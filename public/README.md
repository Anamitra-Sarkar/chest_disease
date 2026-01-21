# Video Assets Setup

This directory should contain three video files for the landing page carousel:

- `video1.mp4`
- `video2.mp4`
- `video3.mp4`

## Download Instructions

Due to file size, these videos are not included in the repository. Download them from:

1. **video1.mp4**: https://github.com/user-attachments/assets/5fa52f51-c98b-4c93-a5fc-a9d1e6985fd7
2. **video2.mp4**: https://github.com/user-attachments/assets/888a2e66-fe3a-478f-b2e1-a23b45e2135c
3. **video3.mp4**: https://github.com/user-attachments/assets/ea8dcda9-e657-4a8c-ad61-0b3d86a4d30e

## Quick Download (Unix/Linux/Mac)

```bash
cd public
curl -L -o video1.mp4 "https://github.com/user-attachments/assets/5fa52f51-c98b-4c93-a5fc-a9d1e6985fd7"
curl -L -o video2.mp4 "https://github.com/user-attachments/assets/888a2e66-fe3a-478f-b2e1-a23b45e2135c"
curl -L -o video3.mp4 "https://github.com/user-attachments/assets/ea8dcda9-e657-4a8c-ad61-0b3d86a4d30e"
```

## For Hugging Face Spaces

If deploying to Hugging Face Spaces with Docker, add these lines to your Dockerfile:

```dockerfile
RUN curl -L -o public/video1.mp4 "https://github.com/user-attachments/assets/5fa52f51-c98b-4c93-a5fc-a9d1e6985fd7" && \
    curl -L -o public/video2.mp4 "https://github.com/user-attachments/assets/888a2e66-fe3a-478f-b2e1-a23b45e2135c" && \
    curl -L -o public/video3.mp4 "https://github.com/user-attachments/assets/ea8dcda9-e657-4a8c-ad61-0b3d86a4d30e"
```

Place this after copying the application files.
