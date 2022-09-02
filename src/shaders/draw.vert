#version 100

precision mediump float;
uniform float width, height, scale;
attribute vec2 position;
attribute float featid;
varying float v_featid;

void main() {
  v_featid = featid;
  gl_Position = vec4((position.x*2.0)/width - 1.0, (position.y*2.0)/height, 0.0, 1.0);
}
