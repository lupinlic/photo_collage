You are a senior WebGL engineer specializing in Three.js, GLSL, GPU particle systems and creative coding.

I already have a Canvas version of a particle portrait.

I DO NOT want to change the visual concept.

I still want thousands of glowing particles that assemble into a girl's portrait.

However, I want to completely replace the rendering engine with Three.js + WebGL so the animation is GPU accelerated.

====================================================
VISUAL GOAL
====================================================

The animation starts with particles randomly distributed outside the screen.

Particles slowly fly toward their target positions.

They assemble into a beautiful girl's portrait.

The portrait should be made entirely of glowing particles.

No image should be visible.

Only particles.

The final effect should look magical and premium.

====================================================
TECH STACK
====================================================

Use

- Vite
- Vanilla JavaScript
- Three.js
- WebGL2
- BufferGeometry
- ShaderMaterial
- GLSL

Do NOT use Canvas2D.

====================================================
PROJECT STRUCTURE
====================================================

src/

main.js

Scene.js

ParticleSystem.js

ImageSampler.js

MouseController.js

AnimationController.js

shaders/

vertex.glsl

fragment.glsl

avt.png

====================================================
IMAGE SAMPLING
====================================================

Load girl.png.

Read pixel data.

Ignore transparent pixels.

Ignore white background.

Convert every remaining sampled pixel into one particle.

Particle count should automatically adapt.

Typical count:

10,000

20,000

50,000

100,000

depending on image size.

====================================================
PARTICLE DATA
====================================================

Store particle information inside BufferGeometry.

Use attributes such as

position

target

color

size

random

depth

phase

velocity

origin

Do NOT create JavaScript objects per particle.

Everything must be stored inside Float32Array.

====================================================
SPAWN
====================================================

Particles should NOT start at target positions.

Spawn them

outside screen

large circle

random sphere

corners

Then animate toward targets.

====================================================
PHYSICS
====================================================

Each particle behaves like a spring.

Fast movement initially.

Then slowly settles.

Natural damping.

No snapping.

====================================================
BREATHING
====================================================

When portrait is completed

particles should slightly move.

Very subtle.

Almost alive.

====================================================
MOUSE
====================================================

Mouse repels particles.

Soft interaction.

Particles naturally return.

====================================================
EXPLOSION
====================================================

SPACE key

↓

Portrait explodes outward.

Explosion is radial.

Particles lose velocity.

Finally reform the portrait.

====================================================
SHADERS
====================================================

Vertex shader should handle

movement

spring

noise

camera depth

point size

Fragment shader should render

soft circular particles

smooth alpha

glow

additive blending

premium appearance.

====================================================
POST PROCESSING
====================================================

Use

EffectComposer

RenderPass

UnrealBloomPass

ToneMapping

Optional FXAA

====================================================
BACKGROUND
====================================================

Dark cinematic background.

Purple glow.

Soft vignette.

Minimal.

====================================================
CAMERA
====================================================

Camera slowly zooms from

95%

to

100%

Very smooth.

====================================================
PERFORMANCE
====================================================

Target:

Stable 60 FPS.

Support at least

100,000 particles.

All rendering must happen on GPU.

Avoid CPU calculations every frame.

====================================================
FINAL RESULT
====================================================

The final animation should look like an award-winning Awwwards creative coding project.

The viewer should think

"This looks impossible to make with JavaScript."

Do not create a Canvas particle engine.

Create a modern GPU particle engine using Three.js and GLSL while preserving the original concept of a girl's portrait made entirely from particles.