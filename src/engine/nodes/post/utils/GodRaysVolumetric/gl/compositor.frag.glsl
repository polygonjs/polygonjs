/*
 * Code taken from this demo: https://n8python.github.io/goodGodRays/
 * By: https://github.com/n8python
 *
 * With cleanup and minor changes
 */

#include <common>

uniform sampler2D godrays;
uniform sampler2D sceneDiffuse;
uniform sampler2D sceneDepth;
uniform float edgeStrength;
uniform float edgeRadius;
uniform vec2 resolution;
uniform float near;
uniform float far;
uniform vec3 color;
varying vec2 vUv;

#define DITHERING
#include <dithering_pars_fragment>

float linearize_depth (float d, float zNear, float zFar) {
  return zNear * zFar / (zFar + d * (zNear - zFar));
}

void main() {
  vec4 diffuse = texture2D(sceneDiffuse, vUv);

  float rawDepth = texture2D(sceneDepth, vUv).x;
  float correctDepth = linearize_depth(rawDepth, near, far);

  vec2 pushDir = vec2(0.0);
  float count = 0.0;
  for (float x = -edgeRadius; x <= edgeRadius; x++) {
    for (float y = -edgeRadius; y <= edgeRadius; y++) {
      vec2 sampleUv = (vUv * resolution + vec2(x, y)) / resolution;
      float sampleDepth = linearize_depth(texture2D(sceneDepth, sampleUv).x, near, far);
      if (abs(sampleDepth - correctDepth) < 0.05 * correctDepth) {
        pushDir += vec2(x, y);
        count += 1.0;
      }
    }
  }

  if (count == 0.0) {
    count = 1.0;
  }

  pushDir /= count;
  pushDir = normalize(pushDir);
  vec2 sampleUv = length(pushDir) > 0.0 ? vUv + edgeStrength * (pushDir / resolution) : vUv;
  float bestChoice = texture2D(godrays, sampleUv).x;

  gl_FragColor = vec4(mix(diffuse.rgb, color, bestChoice), 1.0);

  #include <dithering_fragment>
}
