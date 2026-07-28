You are a senior Three.js + GLSL creative developer.

I already have a GPU particle portrait made with Three.js.

DO NOT create a new particle engine.

Reuse the existing particle system.

==================================================
GOAL
==================================================

After the girl's portrait has completely formed,
I want a second animation in the top-right corner.

This animation builds the text:

Lan Anh

using the same particle system.

==================================================
TEXT ANIMATION
==================================================

Step 1

After the portrait finishes assembling,
wait about 1 second.

Step 2

Spawn hundreds of floating letters across the screen.

Only use letters from the name:

L
a
n
A
n
h

Repeat them randomly.

Example:

L
a
L
n
A
h
n
a
L
...

There should be around

200–400 letters.

They drift slowly across the screen.

Small random movement.

Different opacity.

Different size.

==================================================
STEP 3
==================================================

After about 2 seconds,
select the correct letters needed to build

Lan Anh

The selected letters should glow brighter.

They accelerate toward the top-right corner.

All remaining letters continue drifting
and slowly fade out.

==================================================
STEP 4
==================================================

The selected letters align perfectly to form

Lan Anh

using the loaded font.

Each letter lands with a soft spring animation.

No snapping.

==================================================
STEP 5
==================================================

When the entire name is complete,

play a subtle glow animation.

Then a horizontal light scan travels
from left to right across the text.

The scan should be soft,
similar to Apple UI animations.

==================================================
TEXT STYLE
==================================================

Position:

Top-right corner.

Margin:

40px from top

40px from right

Font:

Bold

Modern

Sans-serif

Rounded edges

White

Very subtle purple glow.

==================================================
ANIMATION
==================================================

Floating letters:

opacity between

0.2–0.8

rotation

random speed

slow movement

Correct letters:

glow

larger

accelerate

easeOutExpo

small bounce

==================================================
PERFORMANCE
==================================================

Reuse existing render loop.

Reuse existing particle engine.

Avoid creating unnecessary objects every frame.

No memory leaks.

==================================================
OPTIONAL
==================================================

If possible,
build each character itself from tiny particles
instead of HTML text.

That means

Lan Anh

should also be composed of particles,
matching the girl's portrait style.

If particle text is implemented,
mouse interaction and explosion should affect
both the portrait and the text.

==================================================
FINAL RESULT
==================================================

Timeline:

Portrait assembles

↓

1 second pause

↓

Hundreds of floating letters appear

↓

Correct letters are chosen

↓

Letters fly into place

↓

Text "Lan Anh" forms

↓

Glow animation

↓

Horizontal light scan

↓

Idle breathing animation