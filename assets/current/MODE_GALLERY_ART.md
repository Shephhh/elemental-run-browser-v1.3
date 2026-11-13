# Mode Gallery Art — v1.88.6

Seven illustrated posters created with the built-in ImageGen tool. These are original stylized key art, not gameplay screenshots. The gallery references `assets/mode-cards/*-art.webp`; the canyon base remains `assets/mode-cards/canyon.webp`. The geometric background stickers are lightweight inline SVG, not extra raster textures.

## Prompt set

Shared direction: stylized-concept, premium tall portrait 2:3 game key art, polished animated-film illustration rather than photograph or screenshot; action centered within the middle 55% width; bottom 15% dark for an HTML title; no text/UI/frame/watermark. Player: rounded translucent mint jelly cube with expressive face and diamond emblem, no arms or legs.

### troll

Output: `assets/mode-cards/troll-art.webp` (640 × 960).

Troll obstacle course: mint jelly cube mid-jump over a deceptive collapsing platform; bright red spikes below, an unexpected red sliding trap block and purple/cyan platforms receding upward into a neon city canyon. Mischievous playful danger, not horror. Rich crimson accents, electric violet and cyan, strong readable silhouette. A faint laughing cartoon-cat silhouette in the far sky, not a second protagonist.

### level

Output: `assets/mode-cards/level-art.webp` (640 × 960).

Level-based runner adventure through biomes: mint jelly cube racing up a forest highway collecting golden coins toward a checkered finish arch; lush angular trees and distant snowy mountain peaks and a warm volcano far beyond, small floating islands, sunlight shafts. Emerald green, sky blue and honey gold. Exciting upward centered perspective.

### endless

Output: `assets/mode-cards/endless-art.webp` (640 × 960).

Endless running: a luminous highway curling impossibly into the distant horizon between tall indigo futuristic towers, cyan and magenta window accents; golden coins sweep along the road; mint jelly cube rushes toward the horizon, speed ribbons. Midnight blue palette, pink sun and cyan glow; extraordinary sense of infinite distance. No infinity-symbol icon.

### surf

Output: `assets/mode-cards/surf-art.webp` (640 × 960).

Surf & Bunnyhop parkour: enormous smooth sweeping teal surf ramps and sharply banked elevated curves suspended above a mountain cloud sea, small separated bhop stepping blocks, mint jelly cube flying between ramps with a clean mint energy wake. Dynamic diagonal depth but centered action, cyan/teal and royal blue with warm golden sky. Platform geometry and motion must dominate.

### obby

Output: `assets/mode-cards/obby-art.webp` (640 × 960).

Party Run obstacle race: vibrant soft colorful raised platforms, enormous rotating padded sweeper arms, bouncy pink and orange drums, mint jelly cube leaping over an approaching purple-blue tsunami wave. Playful spectacular arcade key art, periwinkle sky, lime/coral/cyan padded obstacles. No other players, no crowds, no confetti covering the focus.

### runner2d

Output: `assets/mode-cards/runner2d-art.webp` (640 × 960).

2D side-scrolling rhythmic runner: crisp side view mint jelly cube jumping across elevated stepping blocks with one spinning circular saw hazard, glimmering gold coins along an arc, stylized layered forest hills and flat teal ground visible in side profile. Clearly 2D cutaway platformer composition, luminous emerald and turquoise and buttery yellow sky. Build a strong central scene not an icon.

### flappy

Output: `assets/mode-cards/flappy-art.webp` (640 × 960).

Flappy flying minigame: a cute small bright orange fire spirit with a yellow glowing core and a single expressive blue eye, flying upward between green capped vertical pipes, tiny ember trail, layered dusky violet sky and soft clouds. Whimsical polished animated-film illustration, readable fire silhouette centered with two pipes framing the route. No cube character in this poster.

## Runtime limits

Single horizontal CSS scroll-snap gallery with arrow/wheel/drag/touch/keyboard navigation. Native circular cursor remains active on every descendant, with a lightweight halo and bounded hover tilt. Sixteen SVG stickers and three slow orbits share the existing background. Reduced-motion disables idle and hover effects. An AbortController, ResizeObserver and on-demand halo RAF are released when the boot screen exits. Gameplay and physics are unchanged.
