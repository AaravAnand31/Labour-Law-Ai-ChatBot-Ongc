from transformers import pipeline
import torch

print("CUDA Available:", torch.cuda.is_available())

generator = pipeline(
    "text-generation",
    model="distilgpt2",
    device=0
)

response = generator(
    "Indian labour laws are important because",
    max_length=50,
    num_return_sequences=1
)

print("\nModel Response:\n")
print(response[0]["generated_text"])