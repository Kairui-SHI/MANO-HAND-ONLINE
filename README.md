# Online MANO Hand Viewer

A browser-based viewer for the MANO hand model. Loads `MANO_RIGHT.pkl` locally
(parsed in the browser — nothing is uploaded), and lets you pose the 16 joints
interactively with sliders.

## Usage

1. **You must download MANO yourself** from
   [mano.is.tue.mpg.de](https://mano.is.tue.mpg.de) after registering and
   accepting their non-commercial research license. The model is **not**
   bundled with this repo and never will be.

2. Serve the page locally:

   ```
   python -m http.server 8765
   ```

3. Open `http://localhost:8765/` and drop your `MANO_RIGHT.pkl` into the
   modal. It's cached in your browser, so you only do this once per machine.

## License

Viewer code: MIT.
MANO model: © Max-Planck, non-commercial license — see
[mano.is.tue.mpg.de](https://mano.is.tue.mpg.de).
