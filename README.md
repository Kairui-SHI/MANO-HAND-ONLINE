# Online MANO Hand Viewer

A browser-based viewer for the MANO hand model. Parses `MANO_RIGHT.pkl`
entirely in your browser — nothing is ever uploaded. Pose 16 joints with
sliders; toggle mesh / colored skeleton / per-joint local axes; light or
dark theme.

---

## ⚠️ Step 0 — Download MANO yourself (required)

> The MANO model is **not** included in this repository, will never be,
> and is not hosted on the demo page. You **must** obtain it directly
> from Max-Planck:
>
> ### 👉 **[mano.is.tue.mpg.de](https://mano.is.tue.mpg.de)**
>
> Register, accept the non-commercial research license, download the
> archive, and locate `MANO_RIGHT.pkl` inside `mano_v1_2/models/`.

Without this file the viewer has nothing to load.

---

## Usage

Two ways to run, pick whichever you prefer.

### Option A — Hosted page (zero install)

1. Open **https://kairui-shi.github.io/MANO-HAND-ONLINE/**
2. Drag `MANO_RIGHT.pkl` into the modal

The file is parsed locally and cached in your browser's IndexedDB, so you
only do this once per machine. No server ever sees the model.

### Option B — Run locally

```bash
git clone https://github.com/Kairui-SHI/MANO-HAND-ONLINE.git
cd MANO-HAND-ONLINE
python -m http.server 8765
```

Open `http://localhost:8765/` and drop the pkl into the modal.

---

## License

- **Viewer code**: MIT.
- **MANO model**: © Max-Planck, non-commercial research license only —
  see [mano.is.tue.mpg.de](https://mano.is.tue.mpg.de).
