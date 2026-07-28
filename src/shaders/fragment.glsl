precision highp float;

uniform float uTime;
uniform float uTextProgress;
varying vec3 vColor;
varying float vAlpha;
varying float vPhase;
varying float vLetterIndex;
varying float vIsText;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);
  float alpha = smoothstep(0.72, 0.0, dist);
  float glow = pow(max(0.0, 1.0 - dist), 3.1) * 0.95;
  vec3 pulseColor = vColor * (0.92 + 0.08 * sin(uTime * 0.93 + vPhase));
  vec3 baseColor = pulseColor * (0.22 + glow * 0.82);
  vec3 glowColor = baseColor;

  float reveal = 1.0;
  if (vIsText > 0.5) {
    reveal = smoothstep(vLetterIndex - 0.6, vLetterIndex + 0.2, uTextProgress);
  }

  float finalAlpha = alpha * vAlpha * reveal;
  gl_FragColor = vec4(glowColor, finalAlpha);
}
