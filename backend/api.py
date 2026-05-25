from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import faiss
import numpy as np

from sentence_transformers import SentenceTransformer

from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig
)

import torch

app = FastAPI()
print("Loading embedding model...")

embedding_model = SentenceTransformer(
    "BAAI/bge-small-en-v1.5"
)

print("Loading FAISS index...")

index = faiss.read_index(
    "vector_store/faiss_index.index"
)

print("Loading metadata...")

with open(
    "vector_store/metadata.json",
    "r",
    encoding="utf-8"
) as f:

    metadata = json.load(f)

documents = []
sources = []

for item in metadata:

    documents.append(item["text"])
    sources.append(item["file_name"])

print("Loading Qwen model...")

model_name = "Qwen/Qwen2.5-1.5B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(model_name)

quant_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True
)
MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"

model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=quant_config,
    device_map="auto"
)
print("Everything loaded successfully.")

# -----------------------------
# CORS
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Request Model
# -----------------------------

class ChatRequest(BaseModel):
    message: str

# -----------------------------
# Routes
# -----------------------------

@app.get("/")
def home():

    return {
        "message": "AI Labour Law API Running"
    }

@app.post("/chat")
def chat(request: ChatRequest):

    query = request.message

    # --------------------------------
    # Convert query to embedding
    # --------------------------------

    query_embedding = embedding_model.encode([query])

    query_embedding = np.array(
        query_embedding,
        dtype=np.float32
    )

    # --------------------------------
    # Search FAISS
    # --------------------------------

    k = 3

    distances, indices = index.search(
        query_embedding,
        k
    )

    retrieved_chunks = []
    retrieved_sources = []

    for idx in indices[0]:

        retrieved_chunks.append(
            documents[idx]
        )

        retrieved_sources.append(
            sources[idx]
        )

    # --------------------------------
    # Build context
    # --------------------------------

    context = "\n\n".join(retrieved_chunks)

    # --------------------------------
    # Prompt
    # --------------------------------

    prompt = f"""
You are an Indian Labour Law AI Assistant.

Answer ONLY using the provided context.

If answer is not in context,
say:
"I could not find the answer in the knowledge base."

Context:
{context}

Question:
{query}

Provide a concise legal answer.
"""

    # --------------------------------
    # Generate response
    # --------------------------------

    messages = [
        {
            "role": "system",
            "content": "You are a legal AI assistant."
        },
        {
            "role": "user",
            "content": prompt
        }
    ]

    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )

    model_inputs = tokenizer(
        [text],
        return_tensors="pt"
    ).to(model.device)

    outputs = model.generate(
        **model_inputs,
        max_new_tokens=300
    )

    response = tokenizer.decode(
        outputs[0],
        skip_special_tokens=True
    )

    # --------------------------------
    # Clean response
    # --------------------------------

    if "assistant" in response:

        response = response.split(
            "assistant"
        )[-1].strip()
        formatted_sources = []

    for i, source in enumerate(retrieved_sources):
        formatted_sources.append({
            "file": source,
            "preview": retrieved_chunks[i][:120],
            "text": retrieved_chunks[i][:500]
        })

    return {
        "answer": response,
        "sources": formatted_sources
    }