# Hugging Face Spaces Deployment - Setup Guide

## ✅ Changes Made

### 1. Core Files Added
- **`app.py`** - HuggingFace Spaces entrypoint that imports the FastAPI app
- **`.dockerignore`** - Optimizes Docker builds by excluding unnecessary files
- **`README_HF.md`** - HuggingFace Space-specific documentation
- **`.github/workflows/sync_to_hf.yml`** - Auto-sync workflow from GitHub to HF

### 2. Files Modified
- **`Dockerfile`** - Updated for HF Spaces compatibility:
  - Uses dynamic PORT from environment variable
  - Downloads model from HuggingFace Hub during build
  - Exposes port 7860 (HF default)
  - Runs with `uvicorn app:app` instead of `backend.main:app`
  
- **`requirements.txt`** - Added `huggingface-hub==0.20.0` for model downloading

- **`README.md`** - Updated deployment section to focus on HF Spaces

### 3. Files Removed
- **`railway.toml`** - Railway deployment config (no longer needed)
- **`vercel.json`** - Vercel config (frontend only, not needed for backend)

## 🚀 Deployment Instructions

### Step 1: Setup GitHub Actions Secret

1. Go to your Hugging Face account: https://huggingface.co/settings/tokens
2. Create a new token with **WRITE** access
3. Copy the token
4. Go to your GitHub repository: https://github.com/Anamitra-Sarkar/chest_disease/settings/secrets/actions
5. Click "New repository secret"
6. Name: `HF_TOKEN`
7. Value: Paste your Hugging Face token
8. Click "Add secret"

### Step 2: Setup Hugging Face Space Environment

1. Go to your Space: https://huggingface.co/spaces/Arko007/chest-disease/settings
2. Add the following environment variable:
   - Name: `GROQ_API_KEY`
   - Value: Your Groq API key
   - Make it a "Secret" ✅
3. Save changes

### Step 3: Deploy

Simply push to the main branch:
```bash
git push origin main
```

GitHub Actions will automatically:
1. Detect the push to main
2. Clone your repository
3. Push to HuggingFace Space
4. HF will rebuild the Docker container
5. Backend will be live!

## 🔍 Verification

### Check GitHub Actions
- Go to: https://github.com/Anamitra-Sarkar/chest_disease/actions
- Look for the "Sync to Hugging Face Space" workflow
- Verify it completes successfully (green checkmark)

### Check Hugging Face Space
- Go to: https://huggingface.co/spaces/Arko007/chest-disease
- Wait for the build to complete
- Click on the "App" tab to see your running backend

### Test the API
Once deployed, test these endpoints:

**Health Check:**
```bash
curl https://arko007-chest-disease.hf.space/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cpu"
}
```

**Image Analysis:**
```bash
curl -X POST https://arko007-chest-disease.hf.space/api/chat \
  -F "image=@chest_xray.jpg" \
  -F "message=What do you see in this X-ray?"
```

## 🐛 Troubleshooting

### GitHub Actions Fails
**Error: "HF_TOKEN is not set"**
- Make sure you added the `HF_TOKEN` secret to GitHub Actions secrets
- The secret name must be exactly `HF_TOKEN` (case-sensitive)

**Error: "Permission denied"**
- Your HF token needs WRITE access
- Create a new token with write permissions

### Hugging Face Build Fails
**Check the build logs:**
1. Go to https://huggingface.co/spaces/Arko007/chest-disease
2. Click on "Logs" tab
3. Look for error messages

**Common issues:**
- Model download failed: Check if the model repo `Arko007/chexpert-cnn-from-scratch` is accessible
- Port conflict: HF Spaces uses port 7860 by default
- Memory issues: HF Spaces free tier has limited resources

### Backend Not Starting
**Check environment variables:**
- Ensure `GROQ_API_KEY` is set in HF Space settings
- Model path should be: `epoch_001_mAUROC_0.486525.pth` (no leading slash)

**Check logs in HF Space:**
- Look for Python errors
- Check if model loaded successfully
- Verify port binding

## 📝 Notes

### Model Download
- The model is automatically downloaded during Docker build
- Source: `Arko007/chexpert-cnn-from-scratch` on HuggingFace Hub
- File: `epoch_001_mAUROC_0.486525.pth`
- This happens at build time, not runtime

### Port Configuration
- HF Spaces uses port 7860 by default
- The `PORT` environment variable can override this
- The backend automatically reads from `PORT` env var

### CI/CD Pipeline
```
GitHub Push → GitHub Actions → HuggingFace Space → Docker Build → Deploy
```

### GROQ_API_KEY
- The LLM features won't work without this key
- Image analysis will still work (model inference)
- You mentioned you'll set this later - that's fine!
- The backend will start without it, just chat features won't work

## ✅ Verification Checklist

Before considering the deployment complete:

- [ ] GitHub Actions workflow exists and is valid
- [ ] HF_TOKEN is added to GitHub Secrets
- [ ] GROQ_API_KEY is added to HF Space settings (or will be added later)
- [ ] Push to main triggers the workflow
- [ ] Workflow completes successfully
- [ ] HF Space builds successfully
- [ ] Health endpoint returns 200 OK
- [ ] Model loads successfully (check logs)
- [ ] API responds to requests

## 🎯 Success Criteria

Your deployment is successful when:
1. ✅ GitHub Actions workflow completes without errors
2. ✅ HF Space shows "Running" status
3. ✅ `/health` endpoint returns `{"status": "healthy", "model_loaded": true}`
4. ✅ Model file is downloaded and loaded
5. ✅ Backend starts on port 7860 or PORT env var

## 📚 Additional Resources

- [HuggingFace Spaces Documentation](https://huggingface.co/docs/hub/spaces)
- [Docker on HF Spaces](https://huggingface.co/docs/hub/spaces-sdks-docker)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Need Help?**
- Check the troubleshooting section above
- Review HF Space logs
- Review GitHub Actions logs
- Verify all secrets are set correctly
