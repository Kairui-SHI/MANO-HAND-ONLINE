"""Convert MANO_RIGHT.pkl into a single self-contained binary the
viewer can load via drag-drop.

File layout (little-endian):
    [0..4]            uint32  header_len  (padded so payload starts 4-byte aligned)
    [4..4+header_len] utf-8 JSON
        {
          "n_verts", "n_joints",
          "parents", "faces", "hands_mean",
          "arrays": { name: {"offset", "count", "shape"} ... }
        }
    [4+header_len..]  packed Float32 LE  (v_template, weights, posedirs, J)

The license forbids redistributing the model, so this script is meant
to be run by each user against their own MANO_RIGHT.pkl downloaded
from mano.is.tue.mpg.de.
"""
import json
import pickle
import struct
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
PKL = HERE / "mano_v1_2" / "models" / "MANO_RIGHT.pkl"
OUT = HERE / "mano_right.bin"

if not PKL.exists():
    raise SystemExit(
        f"MANO model not found at {PKL}\n"
        "Download MANO_RIGHT.pkl from https://mano.is.tue.mpg.de "
        "after accepting the license, then place it under mano_v1_2/models/."
    )

with open(PKL, "rb") as f:
    d = pickle.load(f, encoding="latin1")

v_template = np.asarray(d["v_template"], dtype=np.float32)         # (778, 3)
faces      = np.asarray(d["f"],          dtype=np.uint32)          # (1538, 3)
weights    = np.asarray(d["weights"],    dtype=np.float32)         # (778, 16)
posedirs   = np.asarray(d["posedirs"],   dtype=np.float32)         # (778, 3, 135)
J          = np.asarray(d["J"],          dtype=np.float32)         # (16, 3)
kintree    = np.asarray(d["kintree_table"], dtype=np.int32)        # (2, 16)
hands_mean = np.asarray(d["hands_mean"], dtype=np.float32)         # (45,)

parents = kintree[0].copy()
parents[0] = -1

n_verts, n_joints = v_template.shape[0], J.shape[0]

payload = bytearray()
arrays = {}
for name, arr in [
    ("v_template", v_template),
    ("weights",    weights),
    ("posedirs",   posedirs),
    ("J",          J),
]:
    a = np.ascontiguousarray(arr.astype(np.float32, copy=False))
    arrays[name] = {"offset": len(payload), "count": int(a.size), "shape": list(a.shape)}
    payload.extend(a.tobytes())

header = {
    "n_verts":    int(n_verts),
    "n_joints":   int(n_joints),
    "parents":    parents.tolist(),
    "faces":      faces.flatten().tolist(),
    "hands_mean": hands_mean.tolist(),
    "arrays":     arrays,
}
hjson = json.dumps(header).encode("utf-8")

# Pad header so (4 + len(hjson)) is a multiple of 4 → Float32Array view stays aligned
pad = (-len(hjson) - 4) % 4
hjson += b" " * pad

OUT.write_bytes(struct.pack("<I", len(hjson)) + hjson + bytes(payload))

# Tidy old split-file leftovers, if any
old_json = HERE / "mano_right.json"
if old_json.exists():
    old_json.unlink()

print(f"wrote {OUT.name} ({OUT.stat().st_size/1024:.1f} KB)")
print(f"  verts={n_verts} joints={n_joints} faces={faces.shape[0]}")
print(f"  parents={parents.tolist()}")
