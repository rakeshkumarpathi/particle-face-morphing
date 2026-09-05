from pathlib import Path

import numpy as np
import torch
from PIL import Image
from transformers import pipeline


# ---------------------------------------
# Paths
# ---------------------------------------
ROOT = Path(__file__).resolve().parent.parent

INPUT_IMAGE = ROOT / "public" / "assets" / "face.png"
OUTPUT_IMAGE = ROOT / "public" / "assets" / "face-depth.png"


# ---------------------------------------
# Device
# ---------------------------------------

device = 0 if torch.cuda.is_available() else -1

print("Using device:", "CUDA" if device == 0 else "CPU")


# ---------------------------------------
# Load Depth Anything V2
# ---------------------------------------

print("Loading Depth Anything V2...")

pipe = pipeline(
    task="depth-estimation",
    model="depth-anything/Depth-Anything-V2-Small-hf",
    device=device
)


# ---------------------------------------
# Load face
# ---------------------------------------

print("Loading:", INPUT_IMAGE)

image = Image.open(INPUT_IMAGE).convert("RGB")


# ---------------------------------------
# Generate depth
# ---------------------------------------

print("Generating depth map...")

result = pipe(image)

depth = result["depth"]


# ---------------------------------------
# Convert to grayscale
# ---------------------------------------

depth = depth.convert("L")

depth_array = np.array(depth).astype(np.float32)


# ---------------------------------------
# Normalize
# ---------------------------------------

depth_array -= depth_array.min()

depth_array /= (
    depth_array.max() + 1e-8
)

depth_array *= 255.0

depth_array = depth_array.astype(np.uint8)


# ---------------------------------------
# Save
# ---------------------------------------

depth_image = Image.fromarray(
    depth_array,
    mode="L"
)

depth_image.save(OUTPUT_IMAGE)

print()
print("Depth map created:")
print(OUTPUT_IMAGE)