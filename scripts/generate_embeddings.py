from sentence_transformers import SentenceTransformer
from pathlib import Path
import numpy as np

# Load embedding model
print("Loading embedding model...")

model = SentenceTransformer("BAAI/bge-small-en-v1.5")

# Chunk folder
chunks_dir = Path("data/chunks")

chunk_files = sorted(chunks_dir.glob("*.txt"))

documents = []

print(f"Found {len(chunk_files)} chunks.\n")

# Read chunk files
for file in chunk_files:

    with open(file, "r", encoding="utf-8") as f:
        text = f.read()

    documents.append(text)

print("Generating embeddings...\n")

# Generate embeddings
embeddings = model.encode(
    documents,
    show_progress_bar=True
)

print("\nEmbedding generation complete.")

print(f"\nEmbedding shape: {embeddings.shape}")

# Save embeddings
output_dir = Path("vector_store")
output_dir.mkdir(exist_ok=True)

np.save(output_dir / "embeddings.npy", embeddings)

print("\nEmbeddings saved successfully.")