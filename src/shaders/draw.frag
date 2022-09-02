#version 100

precision mediump float;
uniform vec4 color;
varying float v_featid;


void main() {
  vec3 featIdVec = vec3(0.0);
  featIdVec.x = mod(v_featid, 255.0) / 255.0;
  featIdVec.y = mod(v_featid / 255.0, 255.0) / 255.0;
  featIdVec.z = mod(v_featid / (255.0 * 255.0), 255.0) / 255.0;

  gl_FragColor = vec4(featIdVec, 1.0);
}
