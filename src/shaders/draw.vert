precision mediump float;
uniform float width, height, scale;
attribute vec2 position;

void main() {
    gl_Position = vec4(position.x/width, position.y/height, 0, 1);
}
