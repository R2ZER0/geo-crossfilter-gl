#version 100

precision mediump float;

varying vec3 featIdVec;

void main() {
  gl_FragColor = vec4(featIdVec, 1.0);
}