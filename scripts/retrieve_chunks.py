from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from pathlib import Path

# Load embedding model
print("Loading embedding model...")

model = SentenceTransformer("BAAI/bge-small-en-v1.5")

# Load FAISS index
print("Loading FAISS index...")

index = faiss.read_index("vector_store/faiss_index.index")

# Load chunk files
chunks_dir = Path("data/chunks")

chunk_files = sorted(chunks_dir.glob("*.txt"))

documents = []

for file in chunk_files:

    with open(file, "r", encoding="utf-8") as f:
        documents.append(f.read())

print(f"Loaded {len(documents)} chunks.\n")

# User query
query = input("Enter your query: ")

# Convert query into embedding
query_embedding = model.encode([query])

# Convert to float32
query_embedding = np.array(query_embedding).astype("float32")

# Search FAISS
top_k = 3

distances, indices = index.search(query_embedding, top_k)

print("\nTop Retrieved Chunks:\n")

for i, idx in enumerate(indices[0]):

    print(f"\n--- Result {i+1} ---\n")

    print(documents[idx][:1000])