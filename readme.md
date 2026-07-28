# Particle Portrait

> Build a cinematic particle portrait using HTML5 Canvas and JavaScript.

![preview](preview.gif)

---

## Demo

The animation starts with thousands of random particles.

↓

Particles fly across the screen.

↓

Slowly form a girl's portrait.

↓

Mouse interaction pushes particles away.

↓

Particles return smoothly.

↓

Portrait dissolves back into particles.

---

# Features

✔ 20,000+ particles

✔ Smooth animation (60 FPS)

✔ Mouse interaction

✔ Spring physics

✔ Glow effect

✔ Dark cinematic background

✔ Responsive

✔ Zero libraries

✔ Pure HTML + CSS + JavaScript

---

# Tech Stack

- HTML5 Canvas
- Vanilla JavaScript
- CSS3

No frameworks.

No dependencies.

---

# Folder Structure

particle-portrait/

│

├── index.html

├── style.css

├── script.js

│

├── assets/

│ ├── girl.png

│ └── preview.gif

│

└── README.md

---

# Animation Timeline

## Scene 1

Background is completely black.

20,000 particles are generated randomly.

Particles float slowly.

Duration:

3 seconds

---

## Scene 2

Particles receive target positions.

Each particle starts moving.

No one knows what they are creating.

Duration

5 seconds

---

## Scene 3

Portrait slowly appears.

Hair.

Eyes.

Face.

Hand.

Clothes.

Duration

8 seconds

---

## Scene 4

Portrait is complete.

Particles continue moving slightly using Perlin Noise.

Looks alive.

Duration

5 seconds

---

## Scene 5

Mouse interaction.

Particles near cursor

↓

Repelled

↓

Return using spring force.

Duration

Infinite

---

## Scene 6

Portrait explodes.

Particles scatter.

Fade to black.

Loop animation.

---

# Particle System

Each particle stores

```js
{
    x,
    y,

    targetX,
    targetY,

    vx,
    vy,

    radius,

    color,

    alpha
}
```

---

# Physics

Every frame

```js
vx += (targetX - x) * spring

vy += (targetY - y) * spring

vx *= friction

vy *= friction

x += vx

y += vy
```

Recommended values

```js
spring = 0.04

friction = 0.88
```

---

# Image Processing

Load image

↓

Draw to hidden canvas

↓

Read pixels

↓

Ignore transparent pixels

↓

Every visible pixel

↓

Create particle

Pseudo code

```js
image.onload = () => {

ctx.drawImage(image)

const pixels = ctx.getImageData()

for(each pixel){

if(alpha > 20){

createParticle()

}

}

}
```

---

# Rendering

Every frame

```text
Clear canvas

↓

Update particles

↓

Mouse force

↓

Spring force

↓

Draw particles

↓

requestAnimationFrame()
```

---

# Mouse Force

Distance

↓

Calculate force

↓

Push particle

↓

Particle returns

Formula

```js
dx = mouse.x - particle.x

dy = mouse.y - particle.y

distance = Math.sqrt(dx*dx+dy*dy)

if(distance < radius){

applyForce()

}
```

---

# Visual Effects

## Glow

```js
ctx.shadowBlur = 8

ctx.shadowColor = "#ffffff"
```

---

## Gradient

White

↓

Pink

↓

Purple

---

## Random Alpha

```
0.5 ~ 1
```

Makes portrait look alive.

---

# Optional Effects

## Press SPACE

Portrait explodes.

---

## Click

Particles change color.

---

## Double Click

Portrait rotates.

---

## Scroll

Camera zoom.

---

## Press R

Random portrait.

---

# Performance

Particle Count

Low

5000

Medium

12000

High

25000

Ultra

50000

---

# Future Features

- Multiple portraits
- Image upload
- Three.js version
- WebGL renderer
- Shader particles
- Bloom effect
- Motion blur
- Audio reactive particles

---

# Inspiration

Apple Motion

Three.js Journey

Interactive Particle Portrait

Generative Art

Creative Coding
