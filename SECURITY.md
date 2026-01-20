# Security Considerations

This document outlines security considerations for the Chest X-Ray Assistant.

## Overview

This is a medical AI application with privacy and security as top priorities. The system processes potentially sensitive medical images and must maintain strict security controls.

## Threat Model

### Primary Concerns

1. **Privacy**: Chest X-ray images may contain protected health information (PHI)
2. **Data Integrity**: Ensure model outputs are not tampered with
3. **Availability**: System must remain operational for users
4. **Authentication**: Prevent unauthorized access to the LLM API

## Data Privacy

### Image Processing

**Current Implementation:**
- Images are processed entirely in memory
- No disk storage of uploaded images
- No logging of image content
- Ephemeral processing only

**Verification:**
```python
# backend/main.py
image_bytes = await image.read()  # Read into memory
image_tensor = preprocess_image(image_bytes)  # Process
# Image bytes discarded after processing
```

### Data Flow

```
User Upload → In-Memory Processing → Response → Memory Cleared
     ↓                                      ↓
   Encrypted                              No persistence
```

### Compliance Considerations

**HIPAA:**
- No PHI is stored
- No data retention
- No transmission to unauthorized parties
- Access logs contain metadata only

**GDPR:**
- No personal data storage
- Data processing limited to request duration
- Right to access is trivial (no data to access)

## API Security

### Environment Variables

All secrets are stored in environment variables:

```bash
# Backend
GROQ_API_KEY=secret
MODEL_PATH=configuration
INFERENCE_DEVICE=configuration
PORT=configuration

# Frontend
NEXT_PUBLIC_API_URL=configuration
```

**Best Practices:**
- Never commit `.env` files to version control
- Rotate API keys regularly
- Use strong, randomly generated keys
- Limit API key permissions

### CORS Configuration

Current configuration allows all origins for development:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Production Configuration:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type", "Authorization"],
)
```

### Rate Limiting

**Current Status:** Not implemented

**Recommendation for Production:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/chat")
@limiter.limit("10/minute")
async def chat():
    # ...
```

## Input Validation

### Image Upload Validation

**Current Implementation:**
```python
# Type validation
if not image.content_type or not image.content_type.startswith('image/'):
    raise HTTPException(status_code=400)

# Size validation (client-side)
if file.size > 10 * 1024 * 1024:
    alert('File too large')
```

**Additional Validation (Recommended):**
```python
# Server-side size limit
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
image_bytes = await image.read()
if len(image_bytes) > MAX_IMAGE_SIZE:
    raise HTTPException(status_code=413, detail="File too large")

# Image format validation
try:
    image = Image.open(io.BytesIO(image_bytes))
    image.verify()  # Verify it's a valid image
except:
    raise HTTPException(status_code=400, detail="Invalid image file")
```

### Message Validation

**Current Implementation:**
```python
# Empty message check
if not message.strip():
    raise HTTPException(status_code=400)
```

**Additional Validation (Recommended):**
```python
# Length limit
MAX_MESSAGE_LENGTH = 10000
if len(message) > MAX_MESSAGE_LENGTH:
    raise HTTPException(status_code=400, detail="Message too long")

# Content sanitization
import re
# Prevent potential injection attempts
if re.search(r'<script|javascript:', message.lower()):
    raise HTTPException(status_code=400)
```

## Output Security

### LLM Prompt Injection Prevention

**Current Implementation:**
- Strict system prompts
- Low temperature (0.3) for deterministic responses
- Explicit constraints on output format

**Additional Measures:**
```python
# Output sanitization
def sanitize_llm_output(text: str) -> str:
    # Remove any HTML tags
    import re
    text = re.sub(r'<[^>]+>', '', text)
    # Limit length
    return text[:5000]
```

### Response Format Validation

**Current Implementation:**
```python
return JSONResponse({
    "response": response,
    "has_image_analysis": True,
    "conditions": conditions,
})
```

**Security:** JSONResponse automatically handles JSON encoding and prevents injection.

## Authentication & Authorization

### Current Status

**No user authentication required.** This is an educational tool with open access.

### Future Considerations

If authentication is added:
- Use JWT tokens
- Implement rate limiting per user
- Consider OAuth for healthcare professionals
- Log access for audit trails

## Logging & Monitoring

### Current Logging

```python
logger.info(f"Model loaded successfully")
logger.error(f"Inference error: {str(e)}")
```

**What is NOT logged:**
- Image content
- User messages (potential PHI)
- LLM responses
- Detailed error stacks in production

### Security Logging

**Recommended additions:**
```python
import logging

# Security event logging
security_logger = logging.getLogger('security')

security_logger.info(f"Inference request from {client_ip}")
security_logger.warning(f"Invalid image type attempted: {content_type}")
security_logger.error(f"Rate limit exceeded: {client_ip}")
```

## Infrastructure Security

### Vercel (Frontend)

**Built-in Security:**
- Automatic HTTPS
- DDoS protection
- Web Application Firewall (WAF)
- Content Security Policy (CSP) headers

**Additional Headers:**
```json
{
  "headers": [
    {
      "key": "X-Content-Type-Options",
      "value": "nosniff"
    },
    {
      "key": "X-Frame-Options",
      "value": "DENY"
    },
    {
      "key": "X-XSS-Protection",
      "value": "1; mode=block"
    },
    {
      "key": "Referrer-Policy",
      "value": "strict-origin-when-cross-origin"
    },
    {
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    }
  ]
}
```

### Railway (Backend)

**Built-in Security:**
- Automatic HTTPS
- Container isolation
- Secret management

**Recommendations:**
- Enable railway.toml security settings
- Use private networking if scaling
- Regular dependency updates

## Dependency Security

### Frontend Dependencies

**Current (package.json):**
```json
{
  "dependencies": {
    "next": "14.0.4",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0",
    "axios": "^1.6.2"
  }
}
```

**Maintenance:**
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Fix vulnerabilities
npm audit fix
```

### Backend Dependencies

**Current (requirements.txt):**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
pydantic==2.5.2
python-dotenv==1.0.0
torch==2.1.1
torchvision==0.16.1
Pillow==10.1.0
numpy==1.26.2
groq==0.4.1
```

**Maintenance:**
```bash
# Check for vulnerabilities
pip check

# Update dependencies
pip install --upgrade -r requirements.txt

# Use a vulnerability scanner
pip install safety
safety check
```

## Model Security

### Model Integrity

**Current Implementation:**
- Model loaded at startup from filesystem
- No runtime model modification
- Eval mode only (no training)

**Recommendations:**
```python
# Verify model checksum
import hashlib

def verify_model_integrity(model_path: str, expected_hash: str) -> bool:
    with open(model_path, 'rb') as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()
    return file_hash == expected_hash

# Check on startup
verify_model_integrity(MODEL_PATH, "expected_sha256_hash")
```

### Model Path Traversal Prevention

**Current Implementation:**
```python
MODEL_PATH = os.getenv("MODEL_PATH", "epoch_001_mAUROC_0.486525.pth")
```

**Security:** No user input in model path, so path traversal is not a concern.

## LLM Security

### Groq API Usage

**Current Implementation:**
```python
client = Groq(api_key=GROQ_API_KEY)
response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[...],
    temperature=0.3,
    max_tokens=1000,
)
```

**Security Measures:**
- API key stored in environment variable
- Low temperature (0.3) for deterministic responses
- Strict system prompts
- Max tokens limit to prevent runaway generation

### Prompt Injection Prevention

**System Prompt Controls:**
```python
system_prompt = """
CRITICAL RULES (you must follow all):
1. You are NOT a doctor and do NOT provide medical diagnoses
2. DO NOT claim any condition is definitely present or absent
3. Always emphasize uncertainty
4. Include a clear disclaimer at the end
5. Reference only the conditions provided in the data - do NOT invent or hallucinate other conditions
"""
```

## Deployment Security

### Environment Separation

**Development:**
- Local development environment
- Test API keys
- Debug logging enabled

**Staging:**
- Mirror production configuration
- Separate API keys
- Production-like logging

**Production:**
- Production API keys
- Minimal logging (security events only)
- All security headers enabled

### Secrets Management

**Best Practices:**
1. Never commit secrets to git
2. Use platform secret managers (Vercel/Railway)
3. Rotate secrets regularly
4. Audit secret access

## Incident Response

### Security Incident Categories

1. **Data Breach**: Unauthorized access to user data
2. **DoS Attack**: System unavailable
3. **Compromise**: Malicious code execution
4. **Data Integrity**: Tampered model outputs

### Response Plan

**Detection:**
- Monitor logs for anomalies
- Track error rates
- Monitor API usage

**Containment:**
- Isolate affected systems
- Revoke compromised API keys
- Stop service if necessary

**Eradication:**
- Remove malicious code
- Patch vulnerabilities
- Update compromised credentials

**Recovery:**
- Restore from clean backups
- Restart services
- Monitor for recurrence

## Compliance Checklist

### HIPAA (If applicable)

- [ ] Business Associate Agreement (BAA) with cloud providers
- [ ] Access controls implemented
- [ ] Audit logging enabled
- [ ] Data encryption at rest and in transit
- [ ] PHI handling procedures documented

### GDPR (If applicable)

- [ ] Data minimization (collect only necessary data)
- [ ] Data processing agreements
- [ ] User consent mechanisms
- [ ] Right to erasure (not applicable - no data stored)
- [ ] Data breach notification procedures

### SOC 2 (If applicable)

- [ ] Security policies documented
- [ ] Access controls implemented
- [ ] Monitoring and logging
- [ ] Incident response procedures
- [ ] Regular security assessments

## Regular Security Tasks

### Daily
- Monitor error logs
- Check for unusual API usage

### Weekly
- Review access logs
- Check for dependency updates

### Monthly
- Update dependencies
- Rotate API keys
- Run security scans

### Quarterly
- Full security audit
- Penetration testing
- Compliance review

## Resources

- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [FastAPI Security Documentation](https://fastapi.tiangolo.com/tutorial/security/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/deploying#security-headers)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html)

---

**Remember:** Security is an ongoing process, not a one-time setup. Regularly review and update security measures.
