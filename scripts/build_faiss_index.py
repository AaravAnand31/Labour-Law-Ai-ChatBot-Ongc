import faiss
import numpy as np
from pathlib import Path
import pickle

# Load embeddings
embeddings_path = Path("vector_store/embeddings.npy")

embeddings = np.load(embeddings_path)

print(f"Loaded embeddings shape: {embeddings.shape}")

# Convert to float32
embeddings = embeddings.astype("float32")

# Get embedding dimension
dimension = embeddings.shape[1]

print(f"Embedding dimension: {dimension}")

# Create FAISS index
index = faiss.IndexFlatL2(dimension)

# Add embeddings to index
index.add(embeddings)

print(f"Total vectors indexed: {index.ntotal}")

# Save FAISS index
faiss.write_index(index, "vector_store/faiss_index.index")

print("\nFAISS index saved successfully.")