from pathlib import Path
import json

chunks_dir = Path("data/chunks")

chunk_files = sorted(chunks_dir.glob("*.txt"))

metadata = []

for i, file in enumerate(chunk_files):

    with open(file, "r", encoding="utf-8") as f:
        text = f.read()

    metadata.append({
        "chunk_id": i,
        "file_name": file.name,
        "text": text
    })

output_path = Path("vector_store/metadata.json")

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=4)

print("Metadata saved successfully.")