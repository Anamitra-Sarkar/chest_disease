# Deployment Guide

This guide provides step-by-step instructions for deploying the Chest X-Ray Assistant to production.

## Architecture Overview

```
┌─────────────────┐         HTTPS API Call         ┌─────────────────┐
│                 │◄──────────────────────────────┤                 │
│  Next.js Front  │                                │  FastAPI Backend │
│   (Vercel)      │                                │ (HuggingFace)    │
│                 │──────────────────────────────►│                 │
└─────────────────┘                                 └─────────────────┘
       Port 443 (HTTPS)                              Port 7860

Frontend URL: https://chest-disease.vercel.app
Backend URL: https://arko007-chest-disease.hf.space
```

## Part 1: Backend Deployment (HuggingFace Spaces)

### Step 1: Create HuggingFace Space

1. Go to https://huggingface.co/spaces
2. Click "Create new Space"
3. Configure:
   - **Space name**: `chest-disease` (or your preferred name)
   - **License**: MIT
   - **SDK**: Docker
   - **Hardware**: CPU Basic (free tier) or upgrade for better performance
4. Click "Create Space"

### Step 2: Configure Repository Structure

Ensure your repository has these files in the root:
```
/
├── Dockerfile              # Container configuration
├── backend/
│   └── main.py            # FastAPI application
├── requirements.txt        # Python dependencies
├── download_model.sh      # Model download script
└── README_HF.md           # HuggingFace Space README
```

### Step 3: Set Environment Variables (Secrets)

In your HuggingFace Space:
1. Go to Settings → Repository secrets
2. Add these secrets:

**GROQ_API_KEY** (Required)
- Get your key from https://console.groq.com/
- Value: `gsk_...` (your actual API key)

**MODEL_PATH** (Optional - default is `epoch_001_mAUROC_0.486525.pth`)
- Value: `epoch_001_mAUROC_0.486525.pth`

**INFERENCE_DEVICE** (Optional - default is `cpu`)
- Value: `cpu` (or `cuda` if using GPU hardware)

**PORT** (Optional - default is `7860`)
- Value: `7860`

### Step 4: Deploy to HuggingFace

**Option A: Push from Git**
```bash
# Add HuggingFace as a remote
git remote add huggingface https://huggingface.co/spaces/YOUR_USERNAME/chest-disease

# Push to HuggingFace
git push huggingface main
```

**Option B: Use HuggingFace CLI**
```bash
# Install HuggingFace CLI
pip install huggingface_hub

# Login
huggingface-cli login

# Push files
huggingface-cli upload YOUR_USERNAME/chest-disease . --repo-type=space
```

**Option C: Manual Upload**
1. In your Space, click "Files" → "Upload files"
2. Upload all necessary files
3. Commit changes

### Step 5: Verify Deployment

Once deployment is complete (this may take 5-10 minutes for first build):

1. **Check build logs** in your Space's "Build" tab
2. **Test health endpoint**:
   ```bash
   curl https://YOUR_USERNAME-chest-disease.hf.space/health
   ```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cpu"
}
```

3. **Check logs** for any errors:
   - Look for "Model loaded successfully"
   - Look for "API ready to serve requests"

## Part 2: Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Configure Environment Variables

Before deploying, you need to set the backend API URL:

1. Create a `.env.local` file (for local testing):
   ```bash
   NEXT_PUBLIC_API_URL=https://YOUR_USERNAME-chest-disease.hf.space
   ```

2. Or set it in Vercel Dashboard after deployment (recommended for production)

### Step 4: Build the Project Locally (Optional)

```bash
# Install dependencies
npm install

# Build to verify everything works
npm run build
```

### Step 5: Deploy to Vercel

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 6: Configure Environment Variables in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add:

   **Name:** `NEXT_PUBLIC_API_URL`
   **Value:** `https://YOUR_USERNAME-chest-disease.hf.space`
   **Environment:** Production, Preview, Development

5. Redeploy to apply changes:
   ```bash
   vercel --prod
   ```

### Step 7: Verify Frontend Deployment

Visit your Vercel URL:
```
https://chest-disease.vercel.app
```

Test:
1. Navigate to `/assistant` or home page
2. Send a text message (no image) to test API connectivity
3. Upload a chest X-ray image to test full pipeline
4. Verify both text and image analysis work

## Part 3: Connect Frontend to Backend (CORS)

The backend is already configured to allow CORS from all origins:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

For production, you may want to restrict this to your frontend domain:
```python
allow_origins=["https://chest-disease.vercel.app"],
```

## Part 4: Production Checklist

### Backend (HuggingFace Spaces)

- [ ] Space created and configured
- [ ] `GROQ_API_KEY` set in Repository secrets
- [ ] Model downloads successfully during build
- [ ] Health endpoint returns 200 OK
- [ ] CORS allows frontend domain
- [ ] SSL/TLS enabled (automatic on HuggingFace)
- [ ] Logs show "Model loaded successfully"
- [ ] Logs show "API ready to serve requests"

### Frontend (Vercel)

- [ ] `NEXT_PUBLIC_API_URL` set to HuggingFace Space URL
- [ ] Build succeeds without errors
- [ ] All pages load correctly
- [ ] Image upload works
- [ ] Chat functionality works (text-only)
- [ ] Image analysis works (with X-ray upload)
- [ ] Combined text + image analysis works
- [ ] Disclaimers are visible

### Security

- [ ] No API keys in code (all in secrets/environment variables)
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS enforced (automatic on both platforms)
- [ ] CORS properly configured
- [ ] Rate limiting considered (if needed)

### Testing

- [ ] Test text chat without image
- [ ] Test image upload with chest X-ray
- [ ] Test combined text + image
- [ ] Verify error handling (invalid image, network errors)
- [ ] Check mobile responsiveness
- [ ] Test on different browsers

## Part 5: Monitoring and Logs

### HuggingFace Logs

View logs in your Space:
1. Go to your Space page
2. Click "Logs" tab
3. Monitor for errors and warnings

Key things to look for:
- "Model loaded successfully"
- "API ready to serve requests"
- Any error messages during requests

### Vercel Logs

```bash
# View deployment logs
vercel logs

# View function logs (real-time)
vercel logs --follow
```

Or in Vercel Dashboard:
1. Go to your project
2. Click "Logs" tab
3. Monitor API calls and errors

## Part 6: Troubleshooting

### Issue: Frontend cannot connect to backend

**Symptoms:** Network errors, CORS errors, "Failed to fetch"

**Solutions:**
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check backend is running: `curl https://YOUR_USERNAME-chest-disease.hf.space/health`
3. Verify CORS settings in FastAPI (should allow all origins or your frontend domain)
4. Check HuggingFace Space status (may be sleeping or building)
5. Verify no typos in the Space URL

### Issue: Backend shows "Groq API key not configured"

**Symptoms:** LLM interpretation fails, 500 errors

**Solutions:**
1. Verify `GROQ_API_KEY` is set in HuggingFace Space secrets
2. Check the secret name is exactly `GROQ_API_KEY` (case-sensitive)
3. Verify the key format is correct: `gsk_...`
4. Check Groq API key is active at https://console.groq.com/

### Issue: Model loading fails

**Symptoms:** 500 errors, "Model file not found" logs

**Solutions:**
1. Check build logs for model download errors
2. Verify `download_model.sh` runs during build
3. Check model file size (should be ~1.4GB)
4. Verify Dockerfile includes model download step
5. Check HuggingFace Hub access is not blocked

### Issue: Image classification returns unexpected results

**Symptoms:** All probabilities near 0.5, no clear predictions

**Solutions:**
1. This is expected for a model early in training (epoch 1)
2. The model is functional but not highly accurate yet
3. For better results, train the model for more epochs
4. Verify the image is a chest X-ray (not other medical images)

### Issue: Vercel build fails

**Symptoms:** Build errors in Vercel dashboard

**Solutions:**
1. Run `npm run build` locally to reproduce
2. Check TypeScript errors: `npm run lint`
3. Verify all dependencies are installed
4. Check `NEXT_PUBLIC_API_URL` is set (can be placeholder for build)

### Issue: HuggingFace Space is sleeping

**Symptoms:** First request takes 30+ seconds, subsequent requests are fast

**Solutions:**
1. Free tier Spaces sleep after inactivity
2. Upgrade to paid hardware for always-on service
3. Send periodic health check requests to keep it awake
4. First request will wake it up (be patient)

### Issue: "Client.__init__() got an unexpected keyword argument 'proxies'"

**Symptoms:** 500 errors when using LLM, error in logs about proxies

**Solutions:**
1. Update groq library to version 0.11.0 or later
2. Verify requirements.txt has `groq==0.11.0` or newer
3. Rebuild the Space to install updated dependencies

## Part 7: Scaling and Performance

### HuggingFace Spaces Hardware Tiers

- **CPU Basic (Free)**: 2 vCPU, 16 GB RAM - Good for development/testing
- **CPU Upgrade**: 8 vCPU, 32 GB RAM - Better for production
- **T4 GPU**: NVIDIA T4 GPU - Much faster inference (recommended for production)
- **A10G GPU**: NVIDIA A10G GPU - Best performance

### Vercel

- Automatic scaling included
- Serverless functions scale automatically
- No manual intervention needed
- Edge network for global performance

### Cost Estimates

- **HuggingFace Spaces**: 
  - Free tier: $0/month (with sleep after inactivity)
  - CPU Upgrade: ~$0.60/hour
  - T4 GPU: ~$0.60/hour
  - A10G GPU: ~$1.30/hour
- **Vercel**: 
  - Hobby: Free for personal projects
  - Pro: $20/month (for production)
- **Groq API**: Pay per token (very affordable, ~$0.10-1/day for typical usage)
- **Total**: ~$0-60/month depending on traffic and hardware choices

## Part 8: Maintenance

### Regular Tasks

- Monitor logs for errors daily
- Check Groq API usage and credits weekly
- Update dependencies monthly: `pip install -U -r requirements.txt`, `npm update`
- Review security advisories
- Backup model file (stored in HuggingFace Hub)
- Test frontend/backend integration weekly

### Updating the Application

1. Make changes locally
2. Test locally (see DEVELOPMENT.md)
3. Commit changes to GitHub
4. Push to HuggingFace: `git push huggingface main`
5. Deploy frontend: `vercel --prod`
6. Verify everything works

### Model Updates

To update the model:
1. Train new model (see training repository)
2. Upload to HuggingFace Hub
3. Update model filename in Dockerfile or environment variable
4. Rebuild Space (automatic on push)

### Rollback Plan

If deployment fails:

**HuggingFace Spaces:**
```bash
# Revert to previous commit
git revert HEAD
git push huggingface main
```

**Vercel:**
```bash
# List deployments
vercel list

# Promote a previous deployment to production
vercel promote <deployment-url>
```

---

## Support

For deployment issues:

1. Check service status pages:
   - HuggingFace Status: https://status.huggingface.co/
   - Vercel Status: https://www.vercel-status.com/
   - Groq Status: https://status.groq.com/
2. Review logs in both HuggingFace and Vercel dashboards
3. Consult documentation:
   - HuggingFace Spaces: https://huggingface.co/docs/hub/spaces
   - Vercel: https://vercel.com/docs
   - Groq: https://console.groq.com/docs

---

**Remember:** This is a medical application. Always test thoroughly before making production changes.

## Quick Reference

### Current Deployment URLs
- **Frontend**: https://chest-disease.vercel.app
- **Backend**: https://arko007-chest-disease.hf.space
- **Backend Health Check**: https://arko007-chest-disease.hf.space/health
- **Model Repository**: https://huggingface.co/Arko007/chexpert-cnn-from-scratch

### Environment Variables Summary

**HuggingFace Spaces (Backend)**:
```bash
GROQ_API_KEY=gsk_...           # Required - From console.groq.com
MODEL_PATH=epoch_001_mAUROC_0.486525.pth  # Optional - Default value
INFERENCE_DEVICE=cpu           # Optional - cpu or cuda
PORT=7860                      # Optional - Default for HuggingFace
```

**Vercel (Frontend)**:
```bash
NEXT_PUBLIC_API_URL=https://arko007-chest-disease.hf.space  # Required
```
