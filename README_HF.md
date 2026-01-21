---
title: Chest Disease Classification
emoji: 🫁
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
license: mit
app_port: 7860
---

# Chest Disease Classification API

This is a Chest X-Ray Analysis API powered by a CheXpert CNN model trained from scratch. The backend provides deterministic inference for 14 chest conditions using deep learning.

## Features

- **Multi-label Classification**: Detects 14 different chest conditions
- **LLM-powered Interpretation**: Uses Groq API with LLaMA 3.3 for result interpretation
- **Deterministic Inference**: Consistent results for the same input
- **FastAPI Backend**: Modern, fast, and production-ready API

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /api/chat` - Main endpoint for image analysis and chat

## Environment Variables

Set the following environment variable in your Hugging Face Space settings:

- `GROQ_API_KEY` - Your Groq API key for LLM interpretation (required for chat features)

## Model

The model is automatically downloaded from the Hugging Face repository [Arko007/chexpert-cnn-from-scratch](https://huggingface.co/Arko007/chexpert-cnn-from-scratch) during the Docker build process.

## Usage

### Analyze an Image

Send a POST request to `/api/chat` with:
- `image`: The chest X-ray image file (multipart/form-data)
- `message`: Optional text message or question about the image

### Chat Without Image

Send a POST request to `/api/chat` with:
- `message`: Your question about chest X-rays or medical education

## Detected Conditions

The model can detect the following 14 conditions:
1. No Finding
2. Enlarged Cardiomediastinum
3. Cardiomegaly
4. Lung Opacity
5. Lung Lesion
6. Edema
7. Consolidation
8. Pneumonia
9. Atelectasis
10. Pneumothorax
11. Pleural Effusion
12. Pleural Other
13. Fracture
14. Support Devices

## Disclaimer

This is an educational tool and should NOT be used for medical diagnosis. Always consult with qualified healthcare professionals for medical concerns.

## Technical Details

- **Framework**: FastAPI + PyTorch
- **Model Architecture**: Custom CNN trained on CheXpert dataset
- **Inference Device**: CPU (Hugging Face Spaces default)
- **Image Processing**: Grayscale conversion + normalization to 224x224

## Deployment

This Space is automatically synced from the GitHub repository [Anamitra-Sarkar/chest_disease](https://github.com/Anamitra-Sarkar/chest_disease) via GitHub Actions.
