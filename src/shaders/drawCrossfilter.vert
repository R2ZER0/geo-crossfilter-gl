#version 100

precision mediump float;

uniform float size;

attribute vec2 position;
attribute float featid;

varying float v_featid;

void main() {
  v_featid = featid;
  gl_Position = vec4((position / size) * 2.0 - 1.0, 0.0, 1.0);
}
