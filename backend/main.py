from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModel
import torch
import warnings

warnings.filterwarnings("ignore")

app = FastAPI(title="Wisdom - Attention Visualizer Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_NAME = "prajjwal1/bert-mini"
print(f"Loading model {MODEL_NAME}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME, output_attentions=True)
model.eval()
print("Model loaded successfully.")

class AnalyzeRequest(BaseModel):
    text: str
    max_tokens: int = 128

@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    inputs = tokenizer(
        request.text,
        return_tensors="pt",
        max_length=request.max_tokens,
        truncation=True,
        padding=False
    )
    
    with torch.no_grad():
        outputs = model(**inputs)
        
    # Get tokens
    input_ids = inputs["input_ids"][0]
    tokens = tokenizer.convert_ids_to_tokens(input_ids)
    
    # Process attention
    # outputs.attentions is a tuple of (layer_count) tensors
    # Each tensor is of shape (batch_size, num_heads, sequence_length, sequence_length)
    
    attentions = []
    for layer_attention in outputs.attentions:
        # Get batch 0, and convert to python list
        # Shape: (num_heads, sequence_length, sequence_length)
        layer_attention = layer_attention[0].tolist()
        attentions.append(layer_attention)
        
    return {
        "tokens": tokens,
        "attentions": attentions,  # Shape: (num_layers, num_heads, seq_len, seq_len)
        "num_layers": len(attentions),
        "num_heads": len(attentions[0]) if attentions else 0
    }
