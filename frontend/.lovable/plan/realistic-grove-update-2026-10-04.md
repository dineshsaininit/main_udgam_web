# Realistic grove update

## Build
- Replace the plain path with a photographic, textured forest road that runs through the full scroll journey.
- Improve the grass treatment using the existing real grass image with denser detail and natural variation beside the road.
- Make cherry blossom petals visibly drift, tumble, and cross the camera throughout the scene.
- Add a realistic central wayfinding board labeled “NIT SIKKIM” and a second board on the left labeled “UDGAM 2K26”.
- Keep the current camera journey, realistic cherry trees, performance control, and page content unchanged.

## Verification
- Check the opening and a scrolled position at desktop and mobile widths.
- Confirm both signs are readable, the road and grass render correctly, petals move, and no preview errors remain.

## Technical details
- Use textured Three.js geometry for the ground and road, and mesh-built sign structures with high-resolution canvas text textures.
- Keep all scene assets local to the project and preserve the existing low-quality mode.
