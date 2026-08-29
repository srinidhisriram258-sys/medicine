FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for Tesseract OCR & PyTorch
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["python", "-c", "import sys; sys.path.insert(0, '.'); import uvicorn; uvicorn.run('app.main:app', host='0.0.0.0', port=8001)"]
