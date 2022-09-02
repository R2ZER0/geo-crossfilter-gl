#version 100

precision mediump float;
uniform vec4 color;
varying float v_featid;

#define FEATID_FACTOR 16.0

vec3 featidToVec(float featid) {
  float part2 = floor(featid / 255.0);
  float part3 = floor(featid / (255.0 * 255.0));
  float part1 = featid - (part2 * 255.0); // Modulo?
  return vec3(part1, part2, part3);
}

void main() {
  //vec3 featid3 = featidToVec(v_featid);
  gl_FragColor = vec4((v_featid / FEATID_FACTOR), 0.0, 0.0, 1.0);
}
