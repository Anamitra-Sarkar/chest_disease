# Chest X-Ray Assistant

A production-ready, medical-grade AI assistant for chest X-ray analysis. Built with a deterministic inference pipeline and strict safety controls.

## ⚠️ Important Disclaimer

**This tool is for educational purposes only and is not a substitute for professional medical diagnosis.** The AI outputs are probabilistic estimates and should always be interpreted with appropriate medical supervision. Always consult a qualified healthcare provider for medical advice.

## Architecture

The application consists of two components:

1. **Frontend**: Next.js 14 (deployed to Vercel)
2. **Backend**: FastAPI with PyTorch (deployed separately)

### Why This Architecture?

Vercel's serverless functions run on Node.js and do not support Python/PyTorch natively. To ensure production reliability:
- The frontend runs on Vercel for optimal performance
- The Python backend runs on a platform that supports PyTorch (Railway, Render, AWS, etc.)
- Clean separation ensures each component runs on the optimal infrastructure

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

### Deploying Frontend to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Build the Project:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set Environment Variables in Vercel:**
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g., `https://your-backend.railway.app`)

5. **Verify Deployment:**
   ```bash
   vercel --prod
   ```

### Deploying Backend to Railway (Recommended)

1. **Create Railway Account:**
   Visit https://railway.app/

2. **Initialize Railway Project:**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

3. **Add Python Service:**
   ```bash
   railway add
   # Select Python
   ```

4. **Upload Model File:**
   - In Railway dashboard, add the `epoch_001_mAUROC_0.486525.pth` file as a volume
   - Or host it on a CDN and set `MODEL_PATH` to the URL

5. **Set Environment Variables:**
   ```bash
   railway variables set GROQ_API_KEY=your_key
   railway variables set MODEL_PATH=/app/epoch_001_mAUROC_0.486525.pth
   railway variables set INFERENCE_DEVICE=cpu
   railway variables set PORT=8000
   ```

6. **Deploy:**
   ```bash
   railway up
   ```

### Alternative Backend Deployments

**Render:**
- Create a new Web Service
- Connect your GitHub repository
- Set build command: `pip install -r requirements.txt`
- Set start command: `python backend/main.py`
- Add environment variables

**AWS Lambda (with Docker):**
- Package the backend in a Docker container
- Deploy to AWS Lambda using Docker image support
- Requires proper PyTorch installation in container

**Google Cloud Run:**
- Create a Dockerfile for the backend
- Build and push to Google Container Registry
- Deploy to Cloud Run

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
