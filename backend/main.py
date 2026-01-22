"""
FastAPI Backend for Chest X-Ray Analysis

Deterministic inference pipeline with strict error handling and validation.
No image storage. All processing is ephemeral.
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import io
import numpy as np
import os
from dotenv import load_dotenv
from groq import Groq
from typing import Optional, Dict, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(
    title="Chest X-Ray Analysis API",
    description="Deterministic inference pipeline for CheXpert model",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_PATH = os.getenv("MODEL_PATH", "epoch_001_mAUROC_0.486525.pth")
INFERENCE_DEVICE = os.getenv("INFERENCE_DEVICE", "cpu")

# CheXpert conditions (14 classes)
CHEXPERT_CONDITIONS = [
    "No Finding",
    "Enlarged Cardiomediastinum",
    "Cardiomegaly",
    "Lung Opacity",
    "Lung Lesion",
    "Edema",
    "Consolidation",
    "Pneumonia",
    "Atelectasis",
    "Pneumothorax",
    "Pleural Effusion",
    "Pleural Other",
    "Fracture",
    "Support Devices",
]

# Thresholds for positive classification (configurable)
THRESHOLDS = {
    "Cardiomegaly": 0.5,
    "Edema": 0.5,
    "Consolidation": 0.5,
    "Atelectasis": 0.5,
    "Pleural Effusion": 0.5,
}

# Default threshold for conditions not specified
DEFAULT_THRESHOLD = 0.5


class CheXpertCNN(nn.Module):
    """
    Simplified CNN architecture compatible with CheXpert model.
    This architecture matches the repository: Arko007/chexpert-cnn-from-scratch
    """

    def __init__(self, num_classes: int = 14):
        super(CheXpertCNN, self).__init__()

        self.features = nn.Sequential(
            # Block 1
            nn.Conv2d(1, 32, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),

            # Block 2
            nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),

            # Block 3
            nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),

            # Block 4
            nn.Conv2d(128, 256, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )

        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(256 * 14 * 14, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x


# Global model variable
model: Optional[CheXpertCNN] = None


def load_model() -> CheXpertCNN:
    """
    Load the CheXpert model with strict error handling.
    Model is loaded once at startup.
    """
    global model

    if model is not None:
        return model

    logger.info(f"Loading model from: {MODEL_PATH}")

    try:
        # Initialize model architecture
        model = CheXpertCNN(num_classes=14)

        # Load state dict
        checkpoint = torch.load(MODEL_PATH, map_location=INFERENCE_DEVICE, weights_only=False)
        
        # Extract model state dict from checkpoint if it's a full training checkpoint
        state_dict = None
        source_key = None
        checkpoint_keys = ("ema_state_dict", "model_state_dict", "state_dict")
        state_dict_prefixes = ("module.", "model.")
        if isinstance(checkpoint, dict):
            for key in checkpoint_keys:
                if key in checkpoint:
                    state_dict = checkpoint[key]
                    source_key = key
                    break

        if state_dict is None:
            # Direct model state dict
            state_dict = checkpoint

        if source_key:
            epoch_info = checkpoint.get("epoch", "unknown")
            logger.info(f"Loaded model from checkpoint ({source_key}, epoch: {epoch_info})")

        if isinstance(state_dict, dict) and state_dict:
            total_keys = 0
            counts = {prefix: 0 for prefix in state_dict_prefixes}
            non_string_key = False
            for key in state_dict.keys():
                if not isinstance(key, str):
                    non_string_key = True
                    break
                total_keys += 1
                for prefix in state_dict_prefixes:
                    if key.startswith(prefix):
                        counts[prefix] += 1
            if not non_string_key:
                for prefix in state_dict_prefixes:
                    if counts[prefix] == total_keys:
                        state_dict = {k[len(prefix):]: v for k, v in state_dict.items()}
                        logger.info(f"Stripped '{prefix}' prefix from model weights")
                        break
        
        model.load_state_dict(state_dict, strict=False)

        # Set to eval mode - CRITICAL: no training, no dropout variation
        model.eval()

        # Move to device
        model = model.to(INFERENCE_DEVICE)

        logger.info("Model loaded successfully")
        return model

    except FileNotFoundError:
        logger.error(f"Model file not found: {MODEL_PATH}")
        raise RuntimeError(f"Model file not found: {MODEL_PATH}")
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        raise RuntimeError(f"Failed to load model: {str(e)}")


def preprocess_image(image_bytes: bytes) -> torch.Tensor:
    """
    Deterministic image preprocessing.

    Steps (exactly once, in order):
    1. Load image
    2. Convert to grayscale (1 channel)
    3. Resize to 224x224 (model resolution)
    4. Convert to tensor
    5. Normalize with fixed values

    NO logging of image content.
    NO storage.
    NO fallback behavior.
    """
    if not image_bytes:
        raise ValueError("Image data is empty")
    
    try:
        # Load image from bytes
        image = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        logger.error(f"Failed to open image: {str(e)}")
        raise ValueError(f"Invalid image format: unable to decode image")

    try:
        # Convert to grayscale (1 channel)
        image = image.convert('L')

        # Define transforms - deterministic, no random augmentations
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5], std=[0.5]),
        ])

        # Apply transforms
        image_tensor = transform(image)

        # Add batch dimension
        image_tensor = image_tensor.unsqueeze(0)

        # Move to device
        image_tensor = image_tensor.to(INFERENCE_DEVICE)

        return image_tensor

    except Exception as e:
        logger.error(f"Image preprocessing error: {str(e)}")
        raise ValueError(f"Failed to preprocess image: {str(e)}")


def run_inference(image_tensor: torch.Tensor) -> Dict[str, float]:
    """
    Run deterministic inference on preprocessed image.

    Returns structured probabilities per condition.
    Applies sigmoid activation to get probabilities.

    No random sampling. No dropout (eval mode).
    Purely deterministic given same input.
    """
    if model is None:
        logger.error("Model not loaded")
        raise RuntimeError("Model not initialized")
    
    if image_tensor is None or image_tensor.numel() == 0:
        raise RuntimeError("Invalid image tensor")
    
    try:
        # Run inference with no gradient calculation
        with torch.no_grad():
            outputs = model(image_tensor)

        # Apply sigmoid to get probabilities (multi-label classification)
        probabilities = torch.sigmoid(outputs)

        # Convert to numpy and then to dict
        probs_np = probabilities.cpu().numpy()[0]

        # Create structured output
        conditions_dict = {
            condition: float(prob)
            for condition, prob in zip(CHEXPERT_CONDITIONS, probs_np)
        }

        return conditions_dict

    except Exception as e:
        logger.error(f"Inference error: {str(e)}")
        raise RuntimeError(f"Inference failed: {str(e)}")


def interpret_with_llm(
    conditions: Dict[str, float],
    user_message: str = ""
) -> str:
    """
    Interpret model results using Groq API with LLaMA model.

    Strict constraints:
    - Receives only structured probabilities
    - MUST NOT hallucinate conditions
    - MUST NOT diagnose
    - MUST ALWAYS include disclaimer
    - MUST encourage professional consultation
    - MUST explain uncertainty

    This is a controlled system prompt to ensure safety.
    """
    if not GROQ_API_KEY:
        logger.error("Groq API key not configured")
        raise HTTPException(status_code=500, detail="LLM service not configured")

    try:
        os.environ.pop("HTTP_PROXY", None)
        os.environ.pop("HTTPS_PROXY", None)
        os.environ.pop("ALL_PROXY", None)
        client = Groq(api_key=GROQ_API_KEY)

        # Format conditions for the prompt
        conditions_str = "\n".join([
            f"- {condition}: {probability:.3f}"
            for condition, probability in conditions.items()
        ])

        system_prompt = """You are a medical AI assistant that provides educational explanations of chest X-ray analysis results.

CRITICAL RULES (you must follow all):
1. You are NOT a doctor and do NOT provide medical diagnoses
2. Explain what the probabilities mean in simple terms
3. DO NOT claim any condition is definitely present or absent
4. Always emphasize uncertainty and the need for professional evaluation
5. Use calm, clear, non-alarmist language
6. Structure your response to be easy to read
7. Include a clear disclaimer at the end
8. Reference only the conditions provided in the data - do NOT invent or hallucinate other conditions
9. If asked for a diagnosis, firmly state you cannot diagnose and recommend consulting a healthcare professional
10. Explain that these are probabilistic model outputs, not definitive findings

Tone: Professional, calm, educational, careful."""

        user_prompt = f"""The AI model has analyzed a chest X-ray and produced the following probability estimates for different conditions:

{conditions_str}

User question: {user_message if user_message else "Please explain these results."}

Provide an educational interpretation of these results. Remember:
- These are probabilities, not diagnoses
- High probability does NOT guarantee the condition is present
- Low probability does NOT guarantee the condition is absent
- Professional medical evaluation is essential
- Always include a disclaimer"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,  # Low temperature for more deterministic responses
            max_tokens=1000,
        )

        return response.choices[0].message.content or "Unable to generate response."

    except Exception as e:
        logger.error(f"LLM interpretation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate interpretation. Please try again."
        )


def chat_without_image(message: str) -> str:
    """
    Handle general medical chat when no image is provided.

    The assistant answers general questions but does NOT imply access to imaging data.
    """
    if not GROQ_API_KEY:
        logger.error("Groq API key not configured")
        raise HTTPException(status_code=500, detail="LLM service not configured")

    try:
        os.environ.pop("HTTP_PROXY", None)
        os.environ.pop("HTTPS_PROXY", None)
        os.environ.pop("ALL_PROXY", None)
        client = Groq(api_key=GROQ_API_KEY)

        system_prompt = """You are a helpful medical education assistant focusing on radiology and chest X-ray knowledge.

CRITICAL RULES:
1. Provide general medical education information only
2. Do NOT provide specific medical advice or diagnoses
3. Do NOT claim to have access to any imaging data
4. Recommend consulting healthcare professionals for specific concerns
5. Use clear, accurate medical terminology while remaining accessible
6. Always include appropriate disclaimers
7. Stay within your knowledge boundaries - if unsure, say so

Tone: Professional, educational, careful, helpful."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message},
            ],
            temperature=0.3,
            max_tokens=800,
        )

        return response.choices[0].message.content or "Unable to generate response."

    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process chat request. Please try again."
        )


@app.on_event("startup")
async def startup_event():
    """Preload model on startup."""
    logger.info("Starting up Chest X-Ray Analysis API")
    try:
        load_model()
        logger.info("API ready to serve requests")
    except Exception as e:
        logger.error(f"Startup failed: {str(e)}")
        raise


@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "device": INFERENCE_DEVICE,
    }


@app.post("/api/chat")
async def chat(
    message: str = Form(""),
    image: Optional[UploadFile] = File(None)
):
    """
    Main chat endpoint.

    Handles three cases:
    1. Image only: Analyze image, interpret results
    2. Message only: General medical chat
    3. Both: Analyze image and answer question

    Returns structured JSON response.
    """
    try:
        # Case 1: Only text message (no image)
        if image is None:
            if not message or not message.strip():
                raise HTTPException(
                    status_code=400,
                    detail="Please provide a message or upload an image"
                )

            response_text = chat_without_image(message.strip())

            return JSONResponse({
                "response": response_text,
                "has_image_analysis": False,
                "conditions": None,
            })

        # Case 2 & 3: Image provided (with or without message)
        # Validate image
        if not image.content_type:
            raise HTTPException(
                status_code=400,
                detail="Unable to determine file type"
            )
        
        if not image.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload an image."
            )

        # Read image bytes (NO storage)
        try:
            image_bytes = await image.read()
            if not image_bytes or len(image_bytes) == 0:
                raise HTTPException(
                    status_code=400,
                    detail="Uploaded image is empty"
                )
        except Exception as e:
            logger.error(f"Error reading image: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail="Failed to read image file"
            )

        # Preprocess image
        try:
            image_tensor = preprocess_image(image_bytes)
        except ValueError as e:
            logger.error(f"Image preprocessing failed: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=str(e)
            )
        except Exception as e:
            logger.error(f"Unexpected preprocessing error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to process image"
            )

        # Run inference
        try:
            conditions = run_inference(image_tensor)
        except RuntimeError as e:
            logger.error(f"Inference failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Model inference failed"
            )
        except Exception as e:
            logger.error(f"Unexpected inference error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to analyze image"
            )

        # Interpret with LLM
        try:
            response_text = interpret_with_llm(conditions, message.strip() if message else "")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"LLM interpretation failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to generate interpretation"
            )

        return JSONResponse({
            "response": response_text,
            "has_image_analysis": True,
            "conditions": conditions,
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred processing your request"
        )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # No reload in production
    )
