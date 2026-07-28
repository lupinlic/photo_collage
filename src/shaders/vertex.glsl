uniform float uTime;
uniform vec2 uMouse;
uniform float uExplode;
uniform float uZoom;
uniform float uTextProgress;

attribute vec3 target;
attribute float random;
attribute float depth;
attribute float phase;
attribute float sizeScale;
attribute float alphaScale;
attribute float moveStart;
attribute vec3 aColor;
attribute float isText;
attribute float letterIndex;

varying vec3 vColor;
varying float vAlpha;
varying float vPhase;
varying float vLetterIndex;
varying float vIsText;

float easeOut(float t) {
  return 1.0 - pow(1.0 - t, 3.0);
}

void main() {
  vec3 pos = position;
  vec3 delta = target - pos;
  float speed = 0.01 + random * 0.08;
  float elapsed = max(0.0, uTime - moveStart);
  float t = clamp(elapsed * speed, 0.0, 1.0);
  float ease = easeOut(t);
  vec3 moved = pos + delta * ease;

  vec2 mouseDelta = (uMouse - moved.xy) * 0.5;
  float dist = dot(mouseDelta, mouseDelta);
  if (dist < 0.12) {
    float repel = (0.12 - dist) * 0.5;
    moved.xy += normalize(mouseDelta) * repel * (1.0 - ease);
  }

  float pulse = sin(uTime * 0.8 + phase) * 0.02;
  vec3 floatOffset = vec3(
    sin(uTime * 0.43 + random * 12.0),
    cos(uTime * 0.53 + random * 9.0),
    sin(uTime * 0.68 + random * 7.0)
  ) * 0.19 * (1.0 - ease);
  moved += normalize(target) * pulse * depth + floatOffset * (1.0 + depth * 0.34);

  vec3 explodeOffset = normalize(pos) * uExplode * 18.0 * (1.0 - ease);
  moved += explodeOffset;

  vec4 mvPosition = modelViewMatrix * vec4(moved, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  float glowScale = 1.0;
  float baseSize = 6.5 + depth * 14.0;
  gl_PointSize = max(baseSize * sizeScale * glowScale * (1.0 + ease * 0.8) * (1.0 / -mvPosition.z) * (uZoom * 1.4), 4.5);

  vColor = aColor;
  vAlpha = (0.55 + depth * 0.45) * alphaScale;
  vPhase = phase;
  vIsText = isText;
  vLetterIndex = letterIndex;
}
