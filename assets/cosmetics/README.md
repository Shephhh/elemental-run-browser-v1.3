# Tutorial hat

Source: user-supplied `hat.zip`, `base_basic_pbr.glb`. The alternative shaded export is not shipped.

- Original: 15,909,904 bytes / 120,000 triangles.
- Lobby asset: `tutorial-hat.glb`, 612,832 bytes / 18,581 triangles.
- PBR base color, normal and metallic/roughness textures retained; 768px WebP, meshopt geometry.
- `tutorial-hat-preview.png` is a transparent, build-time Three.js render of this same model. No live secondary renderer is created for the reward card.
- Model is prepared once in initial lobby warm-up and shared by the avatar. Bow faces avatar forward (-Z); base is aligned with cube top. Standard lobby materials only; no curved-world patch or collision geometry.
- Build-only optimization script: `output/asset-tools/hat-lod.mjs` (excluded from distribution).
- Ownership uses the existing integrity-sealed tutorialHat earned/claimed flags; claim has no price, no duplicate payout. The pending reward must be collected before exiting its dialog.
