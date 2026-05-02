# Wisdom - Transformer Internals Visualizer

Wisdom is a modern, interactive web application that visualizes transformer model internals. It allows developers and researchers to explore attention patterns, token relationships, and layer-wise activations using a fast, developer-friendly interface.

## Tech Stack
- **Frontend**: Next.js (React), TypeScript, Tailwind CSS, Canvas API
- **Backend**: Python (FastAPI), HuggingFace Transformers, PyTorch
- **Model**: `bert-base-uncased`

## Features
1. **Attention Visualization**: Heatmap and Circular Graph views for intuitive token-to-token attention tracking.
2. **Multi-Layer Exploration**: Easily slide through all 12 layers and 12 heads of BERT to see how attention evolves.
3. **Interactive Analysis**: Hover over tokens to see immediate connections. Click to lock view and see top incoming and outgoing attention scores.
4. **Performance**: Render up to 128 tokens efficiently utilizing HTML5 Canvas without UI lag.

## Setup Instructions

### 1. Backend Setup

The backend serves the FastAPI application on port 8000 and runs the transformer model.

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
> Note: The first run will download the `bert-base-uncased` model (~440MB).

### 2. Frontend Setup

The frontend uses Next.js and runs on port 3000.

```bash
cd frontend
npm install
npm run dev
```

### 3. Usage
Open `http://localhost:3000` in your browser.
Enter any text in the top input bar and hit "Analyze".
Use the sidebar controls to explore different attention heads, layers, and visualization modes.
