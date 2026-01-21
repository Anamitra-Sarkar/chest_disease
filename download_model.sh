#!/bin/bash

# Model Download Script for CheXpert CNN
# This script downloads the pre-trained model from Hugging Face Hub

MODEL_FILE="epoch_001_mAUROC_0.486525.pth"

echo "=========================================="
echo "CheXpert CNN Model Download Script"
echo "=========================================="
echo ""
echo "Downloading model from Hugging Face Hub..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed."
    echo "Please install Python 3 to continue."
    exit 1
fi

# Install huggingface-hub if not already installed
pip install -q huggingface-hub

# Download the model using huggingface-hub
python3 -c "
from huggingface_hub import hf_hub_download
import os

print('Downloading model from Arko007/chexpert-cnn-from-scratch...')
try:
    file_path = hf_hub_download(
        repo_id='Arko007/chexpert-cnn-from-scratch',
        filename='epoch_001_mAUROC_0.486525.pth',
        local_dir='.'
    )
    print(f'Download successful!')
    print(f'Model saved to: {file_path}')
except Exception as e:
    print(f'Error downloading model: {e}')
    print('')
    print('Please try downloading manually from:')
    print('https://huggingface.co/Arko007/chexpert-cnn-from-scratch')
    exit(1)
"

# Check if download was successful
if [ $? -eq 0 ] && [ -f "$MODEL_FILE" ]; then
    FILE_SIZE=$(du -h "$MODEL_FILE" | cut -f1)
    echo ""
    echo "=========================================="
    echo "Download successful!"
    echo "Model file: $MODEL_FILE"
    echo "Size: $FILE_SIZE"
    echo "=========================================="
    echo ""
    echo "You can now run the backend with:"
    echo "  source venv/bin/activate"
    echo "  python backend/main.py"
else
    echo ""
    echo "=========================================="
    echo "Download failed!"
    echo "=========================================="
    echo ""
    echo "Please download the model manually from:"
    echo "https://huggingface.co/Arko007/chexpert-cnn-from-scratch"
    echo ""
    echo "Place the downloaded file in the project root as:"
    echo "  epoch_001_mAUROC_0.486525.pth"
    exit 1
fi
