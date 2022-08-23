precision mediump float;

uniform sampler2D layer1;
uniform sampler2D layer2;

attribute vec2 position;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
