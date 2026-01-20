# Deployment Guide

This guide provides step-by-step instructions for deploying the Chest X-Ray Assistant to production.

## Architecture Overview

```
┌─────────────────┐         HTTPS API Call         ┌─────────────────┐
│                 │◄──────────────────────────────┤                 │
│  Next.js Front  │                                │  FastAPI Backend │
│   (Vercel)      │                                │   (Railway)      │
│                 │──────────────────────────────►│                 │
└─────────────────┘                                 └─────────────────┘
       Port 443 (HTTPS)                              Port 8000

Frontend URL: https://your-app.vercel.app
Backend URL: https://your-backend.railway.app
```

## Part 1: Backend Deployment (Railway)

### Step 1: Prepare Model File

The model file is too large for GitHub. You have two options:

**Option A: Upload via Railway Dashboard**
1. Create Railway account at https://railway.app/
2. Create a new project
3. Add a Volume
4. Upload `epoch_001_mAUROC_0.486525.pth` to the volume

**Option B: Use External Storage**
1. Upload model to cloud storage (AWS S3, Google Cloud Storage, etc.)
2. Get a public URL
3. Set `MODEL_PATH` to the URL in Railway

### Step 2: Deploy Backend via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
cd /path/to/chexpert-cxr-assistant
railway init

# Add Python service
railway add

# Set environment variables
railway variables set GROQ_API_KEY=your_actual_groq_api_key
railway variables set MODEL_PATH=/app/epoch_001_mAUROC_0.486525.pth
railway variables set INFERENCE_DEVICE=cpu
railway variables set PORT=8000

# Deploy
railway up
```

### Step 3: Verify Backend Deployment

Once deployment is complete:

```bash
# Get your backend URL
railway domain

# Test health endpoint
curl https://your-backend.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cpu"
}
```

### Step 4: Configure Backend (If Using Docker)

Railway supports Docker natively. The `Dockerfile` and `docker-compose.yml` are provided:

```bash
# Railway will automatically detect and use the Dockerfile
railway up
```

## Part 2: Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Build the Project

```bash
# Install dependencies
npm install

# Build to verify everything works
npm run build
```

### Step 4: Deploy to Vercel

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 5: Configure Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add:

   **Name:** `NEXT_PUBLIC_API_URL`
   **Value:** `https://your-backend.railway.app`
   **Environment:** Production, Preview, Development

5. Redeploy:
   ```bash
   vercel --prod
   ```

### Step 6: Verify Frontend Deployment

Visit your Vercel URL:
```
https://your-app.vercel.app
```

Test:
1. Navigate to `/assistant`
2. Send a text message (no image) to test API connectivity
3. Upload an image if you have the backend running

## Part 3: Alternative Deployments

### Deploy Backend to Render

```bash
# Create Render account at https://render.com
# Connect your GitHub repository

# Create Web Service:
# - Build Command: pip install -r requirements.txt
# - Start Command: python backend/main.py
# - Environment Variables: Same as Railway
```

### Deploy Backend to AWS (Elastic Beanstalk)

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init

# Create environment
eb create production

# Set environment variables via AWS Console
```

### Deploy Backend to Google Cloud Run

```bash
# Build and push image
gcloud builds submit --tag gcr.io/PROJECT_ID/chexpert-backend

# Deploy
gcloud run deploy chexpert-backend --image gcr.io/PROJECT_ID/chexpert-backend --platform managed

# Set environment variables via Cloud Console
```

## Part 4: Domain Configuration (Optional)

### Custom Domain for Vercel

1. Go to Vercel Dashboard → Your Project → Domains
2. Add your custom domain
3. Configure DNS as instructed

### Custom Domain for Railway

1. Go to Railway Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed

## Part 5: Production Checklist

### Backend (Railway/Other)

- [ ] Model file uploaded and accessible
- [ ] `GROQ_API_KEY` set with valid key
- [ ] `MODEL_PATH` correctly configured
- [ ] `INFERENCE_DEVICE` set to `cpu` or `cuda`
- [ ] Health endpoint returns 200 OK
- [ ] CORS allows frontend domain
- [ ] SSL/TLS enabled (automatic on Railway)

### Frontend (Vercel)

- [ ] `NEXT_PUBLIC_API_URL` set to backend URL
- [ ] Build succeeds without errors
- [ ] All pages load correctly
- [ ] Image upload works
- [ ] Chat functionality works
- [ ] Disclaimers are visible

### Security

- [ ] No API keys in code
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting considered (if needed)

### Testing

- [ ] Test text chat without image
- [ ] Test image upload
- [ ] Test combined text + image
- [ ] Verify error handling
- [ ] Check mobile responsiveness
- [ ] Test on different browsers

## Part 6: Monitoring and Logs

### Vercel Logs

```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --follow
```

### Railway Logs

```bash
# View logs via CLI
railway logs

# Or view in Railway Dashboard
```

## Part 7: Scaling Considerations

### Frontend (Vercel)

- Automatic scaling included
- Serverless functions scale automatically
- No manual intervention needed

### Backend

**Railway:**
- Starts with $5/month plan
- Scales CPU/RAM automatically
- Consider upgrading for higher traffic

**Render:**
- Free tier available
- Pay-as-you-go scaling
- Upgrade based on usage

### Cost Estimates

- Vercel: $0-20/month (depending on usage)
- Railway: $5-20/month (backend)
- Groq API: Pay per token (very affordable)
- Total: ~$10-40/month for typical usage

## Part 8: Troubleshooting

### Issue: Frontend cannot connect to backend

**Symptoms:** Network errors, CORS errors

**Solutions:**
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check backend is running: `curl https://your-backend.railway.app/health`
3. Verify CORS settings in FastAPI
4. Check firewall/security group settings

### Issue: Model loading fails

**Symptoms:** 500 errors, "Model file not found" logs

**Solutions:**
1. Verify `MODEL_PATH` environment variable
2. Check model file exists in the correct location
3. Verify file is not corrupted
4. Check file permissions

### Issue: Groq API errors

**Symptoms:** LLM interpretation fails

**Solutions:**
1. Verify `GROQ_API_KEY` is set correctly
2. Check API key has credits
3. Verify Groq service status
4. Check network connectivity

### Issue: Vercel build fails

**Symptoms:** Build errors in Vercel dashboard

**Solutions:**
1. Run `npm run build` locally to reproduce
2. Check TypeScript errors: `npm run lint`
3. Verify all dependencies are installed
4. Check for environment-specific issues

## Part 9: Rollback Plan

If deployment fails or issues arise:

### Vercel Rollback

```bash
# View deployments
vercel list

# Rollback to previous deployment
vercel rollback <deployment-url>
```

### Railway Rollback

```bash
# View deployments
railway deployments

# Redeploy previous commit
railway up <previous-commit-sha>
```

## Part 10: Maintenance

### Regular Tasks

- Monitor logs for errors
- Check Groq API usage
- Update dependencies monthly
- Review security advisories
- Backup model file

### Updating the Application

1. Update code
2. Test locally
3. Commit changes
4. Deploy backend first
5. Deploy frontend
6. Verify everything works

### Database/Storage

This application uses no database or persistent storage. All processing is ephemeral, which simplifies maintenance.

---

## Support

For deployment issues:

1. Check service status pages (Vercel, Railway, Groq)
2. Review logs in both Vercel and Railway dashboards
3. Consult documentation:
   - Vercel: https://vercel.com/docs
   - Railway: https://docs.railway.app
   - Groq: https://console.groq.com/docs

---

**Remember:** This is a medical application. Always test thoroughly before making production changes.
