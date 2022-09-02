#version 100

precision mediump float;

uniform sampler2D layer;
uniform sampler2D overlap;

attribute vec2 position;

varying vec3 featIdVec;

#define FEATID_FACTOR 16.0

void main() {
    // Convert our position from -1.0..1.0  to 0.0..1.0
    // Convert texture output 0.0-1.0 to scale 0-FEATID_FACTOR
    vec2 texturePosition = (position + 1.0) / 2.0;
    float featId = texture2D(layer, texturePosition).r * FEATID_FACTOR;
    float overlap = texture2D(overlap, texturePosition).r;

    // If "overlap" is 0, then move the point off screen
    //float discardOffset = (1.0 - overlap) * 10.0;

    // Scale integer 0-16 into range -1.0...+1.0
    float featLocation = ((featId / FEATID_FACTOR) * 2.0) - 1.0;

    if (overlap > 0.0) {
        gl_Position = vec4(featLocation, 0.0, 0.0, 1.0);
    } else {
        gl_Position = vec4(2.0, 0.0, 0.0, 1.0);
    }

    //gl_Position = vec4(texturePosition, 0.0, 1.0);
    gl_PointSize = 1.0;

}