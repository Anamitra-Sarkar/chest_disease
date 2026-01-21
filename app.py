"""
Hugging Face Spaces entrypoint for Chest X-Ray Analysis API.

This file serves as the main entrypoint for Hugging Face Spaces deployment.
It imports the FastAPI app from the backend module and runs it with the correct configuration.
"""

import os
import sys

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import the FastAPI app
from backend.main import app

# This is required for Hugging Face Spaces to detect the app
__all__ = ['app']

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment variable (HuggingFace Spaces uses PORT env var)
    port = int(os.getenv("PORT", 7860))
    
    # Run the app
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
