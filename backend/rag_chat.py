from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForCausalLM
import faiss
import numpy as np
from pathlib import Path
import torch

# -----------------------------
# LOAD EMBEDDING MODEL
# -----------------------------

print("Loading embedding model...")

embedding_model = SentenceTransformer(
    "BAAI/bge-small-en-v1.5"
)

# -----------------------------
# LOAD FAISS INDEX
# -----------------------------

print("Loading FAISS index...")

index = faiss.read_index(
    "vector_store/faiss_index.index"
)

# -----------------------------
# LOAD CHUNKS
# -----------------------------

chunks_dir = Path("data/chunks")

chunk_files = sorted(chunks_dir.glob("*.txt"))

documents = []

for file in chunk_files:

    with open(file, "r", encoding="utf-8") as f:
        documents.append(f.read())

print(f"Loaded {len(documents)} chunks.")

# -----------------------------
# LOAD QWEN MODEL
# -----------------------------

print("\nLoading Qwen model...")

model_name = "Qwen/Qwen2.5-1.5B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(model_name)

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map="auto"
)

print("Qwen loaded successfully.\n")

# -----------------------------
# USER QUERY
# -----------------------------

query = input("Ask your labour law question: ")

# -----------------------------
# EMBED QUERY
# -----------------------------

query_embedding = embedding_model.encode([query])

query_embedding = np.array(
    query_embedding
).astype("float32")

# -----------------------------
# SEARCH FAISS
# -----------------------------

top_k = 3

distances, indices = index.search(
    query_embedding,
    top_k
)

retrieved_chunks = []
retrieved_sources = []

for idx in indices[0]:

    retrieved_chunks.append(documents[idx])

    retrieved_sources.append(
        chunk_files[idx].name
    )

context = "\n\n".join(retrieved_chunks)

# -----------------------------
# BUILD PROMPT
# -----------------------------

prompt = f"""
You are an Indian Labour Law AI Assistant.

STRICT RULES:
1. Answer ONLY from provided context.
2. Do NOT make up laws.
3. If answer is missing, say you could not find it.
4. Keep answers clear and professional.

Context:
{context}

Question:
{query}

Provide a concise legal answer.
"""

# -----------------------------
# CHAT TEMPLATE
# -----------------------------

messages = [
    {"role": "user", "content": prompt}
]

text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True
)

inputs = tokenizer(
    text,
    return_tensors="pt"
).to(model.device)

# -----------------------------
# GENERATE RESPONSE
# -----------------------------

print("\nGenerating answer...\n")

outputs = model.generate(
    **inputs,
    max_new_tokens=300
)

response = tokenizer.decode(
    outputs[0],
    skip_special_tokens=True
)

print(response)
print("\n\nSources Used:\n")

for source in retrieved_sources:

    print(source)