from pypdf import PdfReader
from pathlib import Path

# PDF path
pdf_path = Path("data/labouract.pdf")

# Load PDF
reader = PdfReader(pdf_path)

print(f"Total Pages: {len(reader.pages)}\n")

full_text = ""

# Extract text page by page
for i, page in enumerate(reader.pages):

    text = page.extract_text()

    if text:
        full_text += text + "\n"

    print(f"Processed page {i+1}")

# Save extracted text
output_path = Path("data/extracted_text.txt")

with open(output_path, "w", encoding="utf-8") as f:
    f.write(full_text)

print("\nExtraction complete.")
print(f"Saved to: {output_path}")