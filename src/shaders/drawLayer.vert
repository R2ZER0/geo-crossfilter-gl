#version 100

precision mediump float;

uniform float size;
uniform float filterMax;
uniform float filterMin;

attribute vec2 position;
attribute float featid;
attribute float filterValue;

varying float v_featid;

void main() {
  v_featid = featid;

  if (filterValue < filterMin || filterValue > filterMax) {
    // If this vertex is outside the filter range, discard it
    // by moving it outside of clip space.
    gl_Position = vec4(2.0, 2.0, 0.0, 1.0);

  } else {
    // Passed the filter, keep this vertex
    gl_Position = vec4((position / size) * 2.0 - 1.0, 0.0, 1.0);
  }
}
