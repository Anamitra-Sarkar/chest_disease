# Quick Start Guide

This is the fastest way to get the Chest X-Ray Assistant running locally.

## Prerequisites

- Node.js 18+
- Python 3.9+
- Groq API key (free at https://console.groq.com/)

## Step 1: Download the Model

The model file must be downloaded separately (it's too large for GitHub).

**Option A: Using the provided script**
```bash
./download_model.sh
```

**Option B: Manual download**
1. Visit: https://github.com/Arko007/chexpert-cnn-from-scratch
2. Download: `epoch_001_mAUROC_0.486525.pth`
3. Place it in the project root directory

## Step 2: Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
nano .env  # Or use your favorite editor
```

**Edit `.env` and add:**
```bash
GROQ_API_KEY=your_actual_groq_api_key_here
MODEL_PATH=epoch_001_mAUROC_0.486525.pth
INFERENCE_DEVICE=cpu
PORT=8000
```

**Start the backend:**
```bash
cd backend
python main.py
```

The backend will start on http://localhost:8000

## Step 3: Frontend Setup

Open a **new terminal** (keep the backend running):

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
```

**Edit `.env.local` and add:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Start the frontend:**
```bash
npm run dev
```

The frontend will start on http://localhost:3000

## Step 4: Test the Application

1. Open http://localhost:3000 in your browser
2. Click "Start Analysis" to go to the assistant
3. Try sending a message without an image (general medical chat)
4. Try uploading a chest X-ray image (if you have one)

## What's Happening

```
Browser (localhost:3000)
    ↓ HTTPS/HTTP
Frontend (Next.js)
    ↓ API call to localhost:8000
Backend (FastAPI)
    ↓ PyTorch inference
    ↓ Groq LLM interpretation
Response
```

## Troubleshooting

### Backend won't start

**Error:** `Model file not found`
- **Solution:** Ensure `epoch_001_mAUROC_0.486525.pth` is in the project root

**Error:** `Groq API key not configured`
- **Solution:** Add `GROQ_API_KEY=your_key` to `.env` file

### Frontend can't connect to backend

**Error:** Network errors in browser console
- **Solution:** Ensure backend is running on port 8000
- **Solution:** Check `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local`

### TypeScript errors

**Note:** TypeScript errors before running `npm install` are normal. They'll disappear after:
```bash
npm install
npm run build
```

## Next Steps

- Read [README.md](README.md) for full documentation
- Read [DEPLOYMENT.md](DEPLOYMENT.md) to deploy to production
- Read [DEVELOPMENT.md](DEVELOPMENT.md) to understand the codebase

## Architecture

```
Frontend (Vercel)  ←→  Backend (Railway/Render/Local)
   Next.js               FastAPI + PyTorch
```

- **Frontend** can be deployed to Vercel (Node.js compatible)
- **Backend** must run where Python/PyTorch is supported (Railway, Render, AWS, etc.)

This separation is necessary because Vercel's serverless functions are Node.js-based and don't support Python/PyTorch.

---

**Remember:** This is an educational tool, not a diagnostic device. Always consult healthcare professionals for medical advice.
