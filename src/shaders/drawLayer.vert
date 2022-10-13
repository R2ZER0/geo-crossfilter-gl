#version 100

precision mediump float;

uniform float size;
uniform float filterMax;
uniform float filterMin;

attribute vec2 position;
attribute float featid;
attribute float filterValue;

varying float v_featid;
varying float v_visible;

void main() {
  v_featid = featid;

  // If this vertex is outside the filter range, dont display it
  v_visible = (filterValue < filterMin || filterValue > filterMax) ? 0.0 : 1.0;

  gl_Position = vec4((position / size) * 2.0 - 1.0, 0.0, 1.0);
}
