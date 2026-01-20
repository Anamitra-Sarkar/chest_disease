# Development Guide

This guide is for developers working on the Chest X-Ray Assistant codebase.

## Project Structure

```
chexpert-cxr-assistant/
├── app/                      # Next.js App Router
│   ├── assistant/           # Assistant page
│   │   └── page.tsx
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── backend/                 # FastAPI backend
│   └── main.py              # Main API server
├── lib/                     # Utilities
│   └── utils.ts             # Utility functions
├── public/                  # Static assets
├── .env.example             # Environment template
├── .gitignore              # Git ignore rules
├── Dockerfile              # Backend Docker config
├── docker-compose.yml      # Docker compose config
├── download_model.sh       # Model download script
├── next.config.js          # Next.js config
├── package.json            # Node.js dependencies
├── postcss.config.js       # PostCSS config
├── requirements.txt        # Python dependencies
├── tailwind.config.ts      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
└── README.md               # Main documentation
```

## Local Development Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- PyTorch 2.1+ (for backend)
- Git

### Initial Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd chexpert-cxr-assistant

# 2. Download model file
./download_model.sh
# Or manually download from: https://github.com/Arko007/chexpert-cnn-from-scratch

# 3. Setup backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your Groq API key

# 4. Setup frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Running the Application

**Terminal 1 - Backend:**
```bash
source venv/bin/activate
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs (FastAPI auto-docs)

## Frontend Development

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Key Patterns

**Component Structure:**
```typescript
'use client'  // For interactive components

export default function ComponentName() {
  const [state, setState] = useState()

  // Handlers
  const handleAction = () => {}

  return (
    <div className="medical-grade-classes">
      {/* JSX */}
    </div>
  )
}
```

**API Calls:**
```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
  method: 'POST',
  body: formData,
})
const data = await response.json()
```

**Styling Conventions:**
- Use `medical-*` colors for UI elements
- Use `accent-*` colors for primary actions
- Avoid dark themes or glassmorphism
- Keep design clean and minimal
- Use medical/healthcare icons only

### File Naming

- React components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Config files: `kebab-case.js/ts`
- Pages: `page.tsx` (Next.js convention)

### Adding New Routes

1. Create directory in `app/`
2. Add `page.tsx`
3. Follow existing patterns

### Testing Frontend

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Build (to verify production build works)
npm run build
```

## Backend Development

### Tech Stack

- **Framework**: FastAPI
- **ML**: PyTorch
- **Image Processing**: Pillow, torchvision
- **LLM**: Groq API

### Key Patterns

**API Endpoints:**
```python
@app.post("/api/endpoint")
async def endpoint_name(
    param1: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    # Validation
    # Processing
    # Return response
    return JSONResponse({"key": "value"})
```

**Deterministic Inference:**
```python
# 1. Preprocess (no randomness)
image_tensor = preprocess_image(image_bytes)

# 2. Inference (eval mode, no grad)
with torch.no_grad():
    outputs = model(image_tensor)

# 3. Postprocess (sigmoid)
probabilities = torch.sigmoid(outputs)
```

**Error Handling:**
```python
try:
    # Operation
    pass
except HTTPException:
    raise
except Exception as e:
    logger.error(f"Error: {str(e)}")
    raise HTTPException(status_code=500, detail="Error message")
```

### Adding New Endpoints

1. Define endpoint in `backend/main.py`
2. Add input validation
3. Implement deterministic logic
4. Return structured JSON
5. Update API documentation in comments

### Model Architecture

The model is defined in `backend/main.py`. Do NOT modify unless you are:
- Retraining the model
- Using a compatible pre-trained model

The architecture must match the checkpoint file exactly.

### Testing Backend

```bash
# Type checking
mypy backend/main.py

# Health check
curl http://localhost:8000/health

# Test chat endpoint
curl -X POST http://localhost:8000/api/chat \
  -F "message=Hello"
```

## Code Style Guide

### TypeScript/React

```typescript
// Use explicit types
interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Use functional components
const Component: React.FC<Props> = ({ prop }) => {}

// Use hooks for state
const [value, setValue] = useState<string>('')

// Use async/await for API calls
const fetchData = async () => {
  const response = await fetch(url)
  const data = await response.json()
}
```

### Python

```python
# Use type hints
def process_image(image_bytes: bytes) -> torch.Tensor:
    pass

# Use docstrings
def endpoint():
    """Endpoint description.

    Returns:
        JSONResponse: Response data
    """
    pass

# Use context managers
with torch.no_grad():
    outputs = model(inputs)

# Log errors
logger.error(f"Error message: {str(e)}")
```

## Testing Strategy

### Frontend Testing

1. **Manual Testing:**
   - Navigate all routes
   - Test all user interactions
   - Check responsive design

2. **Type Checking:**
   ```bash
   npx tsc --noEmit
   ```

3. **Linting:**
   ```bash
   npm run lint
   ```

4. **Build Verification:**
   ```bash
   npm run build
   ```

### Backend Testing

1. **Manual Testing:**
   - Test all endpoints via Swagger UI (`/docs`)
   - Test with valid/invalid inputs
   - Verify error handling

2. **Health Check:**
   ```bash
   curl http://localhost:8000/health
   ```

3. **Integration Testing:**
   - Test image upload
   - Test text chat
   - Test combined requests

## Debugging

### Frontend Debugging

```bash
# Run dev server with verbose output
npm run dev

# Check browser console for errors
# Use React DevTools for component inspection
```

### Backend Debugging

```bash
# Run with debug logging
python backend/main.py

# Check logs for errors
# Use FastAPI auto-docs at /docs for endpoint testing
```

### Common Issues

**Frontend won't build:**
- Check TypeScript errors: `npx tsc --noEmit`
- Check imports are correct
- Verify all dependencies installed

**Backend won't start:**
- Check model file exists
- Verify environment variables
- Check Python version compatibility

**API connection fails:**
- Verify backend is running
- Check CORS settings
- Verify `NEXT_PUBLIC_API_URL`

## Git Workflow

### Branching Strategy

```
main
  ├─ feat-* (new features)
  ├─ fix-* (bug fixes)
  └─ docs-* (documentation)
```

### Commit Messages

```
feat: add image upload feature
fix: correct inference threshold
docs: update deployment guide
```

### Pre-commit Checks

```bash
# Run before committing
npm run build       # Frontend
python -m py_compile backend/main.py  # Backend syntax
```

## Performance Optimization

### Frontend

- Use Next.js Image component for images
- Implement lazy loading where appropriate
- Minimize bundle size
- Use React.memo for expensive components

### Backend

- Keep model loaded in memory
- Use efficient preprocessing
- Minimize computation in hot paths
- Consider caching for repeated queries

## Security Best Practices

### Frontend

- Never expose API keys on client
- Validate all user inputs
- Use HTTPS in production
- Implement rate limiting if needed

### Backend

- Validate all input types
- Use environment variables for secrets
- Implement proper error handling
- Don't log sensitive data
- Keep dependencies updated

## Common Tasks

### Adding a New Condition

1. Update `CHEXPERT_CONDITIONS` list in `backend/main.py`
2. Ensure model output dimension matches
3. Update thresholding logic if needed

### Changing Model Architecture

1. Modify `CheXpertCNN` class in `backend/main.py`
2. Train/retrain model with new architecture
3. Update checkpoint file
4. Update documentation

### Adding New UI Features

1. Create components in appropriate directories
2. Follow existing styling patterns
3. Ensure mobile responsiveness
4. Update documentation

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment instructions.

## Support

For development issues:
1. Check this guide
2. Review code comments
3. Consult documentation:
   - Next.js: https://nextjs.org/docs
   - FastAPI: https://fastapi.tiangolo.com
   - PyTorch: https://pytorch.org/docs

---

Remember: This is a medical application. Test thoroughly before deploying changes.
