from pathlib import Path

# Load extracted text
input_path = Path("data/extracted_text.txt")

with open(input_path, "r", encoding="utf-8") as f:
    text = f.read()

print(f"Total characters: {len(text)}")

# Chunk settings
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

chunks = []

start = 0

while start < len(text):

    end = start + CHUNK_SIZE

    chunk = text[start:end]

    chunks.append(chunk)

    start += CHUNK_SIZE - CHUNK_OVERLAP

print(f"\nTotal chunks created: {len(chunks)}")

# Save chunks
output_dir = Path("data/chunks")
output_dir.mkdir(exist_ok=True)

for i, chunk in enumerate(chunks):

    chunk_path = output_dir / f"chunk_{i}.txt"

    with open(chunk_path, "w", encoding="utf-8") as f:
        f.write(chunk)

print("\nChunks saved successfully.")