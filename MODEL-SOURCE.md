# FitNotes anatomical hologram base

The hologram body mesh is adapted from **Male base mesh – 3D Person, Rigged A-pose**, published by Innerscene and based on MakeHuman CC0 assets.

- Original: https://www.innerscene.com/tools/library/3d-parts/male-base-mesh-3d-person-rigged-a-pose-380e6d89
- License: Creative Commons Zero (CC0 1.0), public domain dedication.
- Adaptations: first continuous body mesh is extracted from the GLB, neutralized to a single hologram material, centred and scaled. The unneeded bone rig, facial accessories, original materials and textures are omitted. Strength and muscle size are not represented by the model.
- Rebuild: `node tools/convert-human-glb.mjs <downloaded-original.glb> dist/human-silhouette.bin`
- Visual refinement: `node tools/refine-human-mesh.mjs dist/human-silhouette.bin dist/human-silhouette-refined.bin`. This preserves the original mesh, gently relaxes the arm stance, slightly broadens the upper arms, replaces the source's open-mouth face with a smooth, low-relief closed-mouth neutral expression and smooths pectoral details. The renderer provides a close-up face inspection control and a distinct 2D point-cloud fallback when WebGL is unavailable.
