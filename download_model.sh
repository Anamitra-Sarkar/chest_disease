#!/bin/bash

# Model Download Script for CheXpert CNN
# This script helps download the pre-trained model

MODEL_URL="https://github.com/Arko007/chexpert-cnn-from-scratch/releases/download/v1.0/epoch_001_mAUROC_0.486525.pth"
MODEL_FILE="epoch_001_mAUROC_0.486525.pth"

echo "=========================================="
echo "CheXpert CNN Model Download Script"
echo "=========================================="
echo ""
echo "Downloading model file..."
echo ""

# Check if curl is installed
if ! command -v curl &> /dev/null; then
    echo "Error: curl is not installed."
    echo "Please install curl or download the model manually from:"
    echo "https://github.com/Arko007/chexpert-cnn-from-scratch"
    exit 1
fi

# Download the model
curl -L -o "$MODEL_FILE" "$MODEL_URL"

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
    echo "https://github.com/Arko007/chexpert-cnn-from-scratch"
    echo ""
    echo "Place the downloaded file in the project root as:"
    echo "  epoch_001_mAUROC_0.486525.pth"
    exit 1
fi
