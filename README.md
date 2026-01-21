# Chest X-Ray Assistant

A production-ready, medical-grade AI assistant for chest X-ray analysis. Built with a deterministic inference pipeline and strict safety controls.

## ⚠️ Important Disclaimer

**This tool is for educational purposes only and is not a substitute for professional medical diagnosis.** The AI outputs are probabilistic estimates and should always be interpreted with appropriate medical supervision. Always consult a qualified healthcare provider for medical advice.

## Architecture

The application consists of two components:

1. **Frontend**: Next.js 14 (can be deployed to Vercel or other platforms)
2. **Backend**: FastAPI with PyTorch (deployed to Hugging Face Spaces)

### Why This Architecture?

- The backend runs on Hugging Face Spaces with Docker support for PyTorch
- Clean separation ensures each component runs on the optimal infrastructure
- Automatic model downloading from Hugging Face Hub
- CI/CD via GitHub Actions for seamless updates

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with medical-grade design system
- **TypeScript**: Full type safety
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI
- **ML Framework**: PyTorch
- **Model**: CheXpert CNN (multi-label classification)
- **LLM**: Groq API with LLaMA 3.3 70B
- **Image Processing**: Pillow, torchvision

## Model Details

**Source**: [Arko007/chexpert-cnn-from-scratch](https://github.com/Arko007/chexpert-cnn-from-scratch)

**Model File**: `epoch_001_mAUROC_0.486525.pth`

**Architecture**: CNN with 4 convolutional blocks

**Classes**: 14 CheXpert conditions
- No Finding
- Enlarged Cardiomediastinum
- Cardiomegaly
- Lung Opacity
- Lung Lesion
- Edema
- Consolidation
- Pneumonia
- Atelectasis
- Pneumothorax
- Pleural Effusion
- Pleural Other
- Fracture
- Support Devices

**Output**: Sigmoid probabilities (0-1) per condition

**Mode**: `eval()` only - no training, no dropout variation

## Features

✅ Deterministic inference pipeline with strict validation
✅ Real-time image analysis (no storage)
✅ AI-powered interpretation of model outputs
✅ Chat interface for medical questions
✅ Clean, medical-grade UI
✅ Privacy-first design
✅ Educational focus with clear disclaimers
✅ Structured probability outputs

## Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.9+
- PyTorch 2.1+
- Groq API key

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd chexpert-cxr-assistant
```

### 2. Download the Model

1. Visit: https://github.com/Arko007/chexpert-cnn-from-scratch
2. Download the model file: `epoch_001_mAUROC_0.486525.pth`
3. Place it in the project root directory

### 3. Backend Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env and add your Groq API key
nano .env
```

Required environment variables:
```bash
GROQ_API_KEY=your_groq_api_key_here
MODEL_PATH=epoch_001_mAUROC_0.486525.pth
INFERENCE_DEVICE=cpu
PORT=8000
```

### 4. Frontend Setup

```bash
# Install dependencies
npm install

# Copy environment template (if not already done)
cp .env.example .env.local

# Update frontend API URL in .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 5. Running Locally

**Terminal 1 - Start Backend:**
```bash
source venv/bin/activate
cd backend
python main.py
```

Backend will be available at: `http://localhost:8000`

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## Deployment

### Deploying to Hugging Face Spaces (Recommended)

This repository is automatically synced to Hugging Face Spaces via GitHub Actions.

**Live Space**: https://huggingface.co/spaces/Arko007/chest-disease

#### Automatic Deployment

1. **Push to main branch** - GitHub Actions automatically syncs to Hugging Face
2. **Model is downloaded automatically** during Docker build from `Arko007/chexpert-cnn-from-scratch`
3. **No manual steps required** - just push your code!

#### Setup Instructions

1. **Add HF_TOKEN to GitHub Secrets:**
   - Go to your GitHub repository settings
   - Navigate to Secrets and Variables > Actions
   - Add a new secret named `HF_TOKEN`
   - Value should be your Hugging Face write token from https://huggingface.co/settings/tokens

2. **Configure Environment Variables in Hugging Face Space:**
   - Go to https://huggingface.co/spaces/Arko007/chest-disease/settings
   - Add the following secret:
     - `GROQ_API_KEY`: Your Groq API key for LLM interpretation

3. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

The GitHub Actions workflow will automatically:
- Clone your repository
- Push to Hugging Face Space
- Trigger a rebuild
- Deploy the updated backend

#### Manual Deployment to Hugging Face Spaces

If you need to deploy manually:

1. **Install Hugging Face CLI:**
   ```bash
   pip install huggingface_hub
   huggingface-cli login
   ```

2. **Clone the Space repository:**
   ```bash
   git clone https://huggingface.co/spaces/Arko007/chest-disease
   cd chest-disease
   ```

3. **Copy your files:**
   ```bash
   cp -r /path/to/your/repo/* .
   ```

4. **Push to Hugging Face:**
   ```bash
   git add .
   git commit -m "Update space"
   git push
   ```

#### Docker Deployment

The backend uses Docker for deployment. The Dockerfile:
- Installs all dependencies
- Downloads the model from Hugging Face Hub
- Exposes port 7860 (HF Spaces default)
- Runs the FastAPI backend with uvicorn

To test Docker locally:
```bash
docker build -t chest-disease .
docker run -p 7860:7860 -e GROQ_API_KEY=your_key chest-disease
```

## API Reference

### POST /api/chat

Main endpoint for chat and image analysis.

**Request:**
- Form data with optional `message` and/or `image`

**Response:**
```json
{
  "response": "Educational explanation...",
  "has_image_analysis": true,
  "conditions": {
    "Cardiomegaly": 0.23,
    "Edema": 0.67
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cpu"
}
```

## Deterministic Behavior

The system guarantees deterministic inference through:

1. **Fixed preprocessing**: Same image → same tensor
2. **Eval mode only**: No dropout variation
3. **No randomness**: No random sampling or augmentation
4. **Explicit thresholds**: Documented probability thresholds
5. **Structured output**: Consistent JSON format

## Safety Features

### Medical Safety
- Explicit disclaimers on all outputs
- Non-diagnostic language
- Recommendation for professional consultation
- Explanation of uncertainty
- No condition hallucination

### Technical Safety
- Input validation for images
- Size limits (10MB)
- Type checking
- Error handling
- No image storage
- Ephemeral processing only

### LLM Controls
- Low temperature (0.3) for deterministic responses
- Strict system prompts
- Prohibition against diagnosis
- Mandatory disclaimers
- Medical education focus only

## Configuration

### Thresholds

Thresholds for positive classification are configurable in `backend/main.py`:

```python
THRESHOLDS = {
    "Cardiomegaly": 0.5,
    "Edema": 0.5,
    "Consolidation": 0.5,
    "Atelectasis": 0.5,
    "Pleural Effusion": 0.5,
}
```

### Model Architecture

The CNN architecture is defined in `backend/main.py`. Do not modify unless you are also retraining the model.

## Troubleshooting

### Build Failures

If `npm run build` fails:
1. Check for TypeScript errors: `npm run lint`
2. Verify all imports are correct
3. Ensure Next.js version is compatible

### Backend Connection Issues

If frontend cannot connect to backend:
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check backend is running: `curl http://localhost:8000/health`
3. Verify CORS settings in FastAPI

### Model Loading Issues

If model fails to load:
1. Verify model file path in `.env`
2. Check model file is not corrupted
3. Ensure PyTorch version is compatible
4. Verify device settings (cpu/cuda)

### Groq API Issues

If LLM interpretation fails:
1. Verify `GROQ_API_KEY` is set
2. Check API key is valid and has credits
3. Verify network connectivity
4. Check Groq service status

## Performance Notes

- **Cold starts**: Serverless functions may have cold starts
- **Model loading**: Happens once at startup
- **Inference time**: ~1-3 seconds on CPU per image
- **LLM latency**: ~1-2 seconds per request

## Security Considerations

1. **API Keys**: Never commit `.env` files
2. **Rate Limiting**: Consider adding rate limiting for production
3. **Input Validation**: All inputs are validated
4. **CORS**: Configure allowed origins for production
5. **HTTPS**: Always use HTTPS in production

## Contributing

This is a production medical application. Changes should:
- Maintain deterministic behavior
- Preserve medical safety controls
- Follow existing code patterns
- Include comprehensive testing
- Maintain backward compatibility

## License

Apache-2.0 (See LICENSE file)

## Support

For issues or questions:
1. Check troubleshooting section
2. Review logs in backend and frontend
3. Verify all configuration is correct
4. Consult Vercel/Railway documentation

---

**Remember: This is an educational tool, not a diagnostic device. Always consult healthcare professionals for medical advice.**
