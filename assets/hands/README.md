# ELEMENTAL RUN — Baked Viewmodel Hand Assets

## 1.63.0 — download-size optimization

First-person GLBs keep the exact geometry, Meshopt payload, UVs, nodes, skin and
material assignments. Color/emissive images now use same-resolution WebP94/98
(changed-image PSNR≥39.31dB, alpha exact); normal/roughness images unchanged.
This is high-quality lossy color encoding, not pixel-exact/lossless encoding.
Lobby LODs below were not changed. Build/verification tool and reversible source
backups live only in output/asset-size-163; they are not shipped in the ZIP.

This directory is the source of truth for the distinct first-person hand skins completed in build `1.3.91`.

## Required files

The runtime resolves the selected shop skin to these exact, case-sensitive paths:

- `hand_ember.glb`
- `hand_frost.glb`
- `hand_forest.glb`
- `hand_neon.glb`
- `hand_tide.glb`
- `hand_solar.glb`
- `hand_void.glb`
- `hand_elemental.glb`

All eight purchasable skins above are authored, optimized runtime assets. The free `default` skin intentionally remains `../hand.glb`; it is not duplicated in this directory.

## Lobby-only display LODs (1.7.27)

`lobby/hand_{id}.glb` contains dedicated stand copies of these eight models. The first-person originals above are unchanged. Lobby copies retain baked materials/UVs, reduce triangle count conservatively with a 0.2% error ceiling, and use maximum 768px WebP textures plus Meshopt compression. The existing connected-component single-hand selector still runs after loading. Total display asset bytes are 4,594,752 versus 25,211,672 in the originals; total pair triangles are 258,327 versus 960,000. Build-time tool: `output/asset-tools/lobby-lod.mjs` (development only; output tooling is not shipped). Never replace the high-detail viewmodel path with the lobby path.

After adding a validated file, add its skin ID (for example `"ember"`) to `manifest.json#available`. The manifest prevents missing optional models from generating 404 errors in portal consoles.

## Export contract

Each GLB must:

1. Use glTF 2.0 and contain one centered mesh with both hands. Left-hand geometry must be on negative local X and right-hand geometry on positive local X because `vmSplitGeometryByX()` separates faces around `x = 0`.
2. Have transforms applied before export and use the same forward/up orientation as the legacy `assets/hand.glb`. Since build 1.3.98, the runtime splits first, then fits each hand separately to a 0.78-unit height, a maximum 0.65-unit width and a maximum 0.32-unit depth. Model-pair spacing no longer affects the hand size. These shared limits preserve the narrower designs rather than stretching every glove to the same width.
3. Prefer one PBR material on the centered mesh. The preserved splitter does not rebuild multi-material geometry groups, so a multi-material export can assign the wrong material after splitting.
4. Bake the final silhouette and all accessories into the authored mesh. Do not rely on runtime primitive attachments.
5. Preserve `map`, `normalMap`, `roughnessMap`, `metalnessMap`, `aoMap`, and optional `emissiveMap`. Base-color and emissive textures are sRGB; normal, roughness, metalness, AO, and alpha textures are linear data.
6. Include valid UVs, normals, and tangents. Apply scale and recalculate normals/tangents before export.
7. Preserve the authored topology. These image-derived meshes are non-manifold;
   weld/simplify/quantization passes can join remote border vertices, create long
   rear plates, and remove fingertip surfaces.
8. Avoid skeletons and clips unless essential. Running, jumping, sliding, bobbing, and swaying are applied to the split groups by `updateViewmodelHands(delta)`.

## Runtime ownership

- `game-runtime.js#getHandModelAssetPath()` maps skin IDs to this directory.
- `extractAndOptimizeGLBMaterials()` configures baked PBR materials for Three.js r185.1.
- `fitViewmodelHandGeometry()` works on the split geometry copies only. A smooth 12% upper-depth taper reduces inflated fingertips without deleting faces or shortening fingers. Its Jacobian updates normals and tangents along with positions. Source GLBs remain untouched.
- `buildCachedViewmodelGlb()` uses the legacy `releases/Poki` framing: pair-width uniform scaling, the `(-1.25, -0.72)` low/near camera pivot, centered split meshes, and the original mirrored `0.8` yaw / `0.12` roll offsets. `updateViewmodelHands()` keeps that static framing while using a smoother opposed elliptical running gait, capped boost cadence, restrained lane inertia, jump/slide offsets, and `landImpact` recoil. Tiny particles follow the animated anchors.
- `viewmodelGlbCache` stores the parsed `THREE.Group` per skin for the session.
- Skin switching detaches the current cached group and attaches the selected cached group without disposing shared GPU resources.
- `VIEWMODEL_LAYER`, `renderViewmodelOverlay()` and the lightweight particle system remain unchanged. Build 1.3.105 keeps the legacy Poki hand position while refining only its animation, retaining the multi-GLB shop and newer skill overlays.

## Current delivery strategy

- Poki/web build 1.7.15 embeds **lossless WebP** textures in all nine hand GLBs
  (including `../hand.glb`) through the required `EXT_texture_webp` extension.
  The bundled r185.1 GLTFLoader already supports it. Pixel values, texture
  resolution, meshopt geometry bytes, UVs, normals, indices, nodes and baked
  material values are preserved; no resize, weld or simplification is applied.
  Do not add PNG fallback copies to these optimized GLBs: that doubles texture
  payloads. PNG source backups exist only in the excluded QA/output directory.

- Source meshes are approximately 120,000 triangles each and are copied without
  topology-changing simplification by `tools/build-hand-models.ps1`. Only the
  equipped glove is loaded, its parsed group is cached, and locked gloves never
  enter the startup pipeline; this keeps startup stable while preserving every
  fingertip and the intended silhouette.
- Models are never bulk-preloaded. Startup loads only the equipped skin. A newly purchased/equipped skin is fetched on demand and then retained in `viewmodelGlbCache` for the session.
- `previews/hand_<id>.webp` contains a 512x360 shop image. These images receive a URL only after the player opens the Hands tab, so they do not add to initial loading.
- The submitted GLBs stored baked colour in the emissive texture slot. `extractAndOptimizeGLBMaterials()` promotes it to sRGB albedo and keeps a restrained emissive copy so PBR lighting preserves surface detail without flattening the models.
