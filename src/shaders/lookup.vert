#version 100

precision mediump float;

uniform sampler2D layer;
uniform sampler2D overlap;

attribute vec2 position;

varying vec3 featIdVec;

#define FEATID_LIMIT 1024

void main() {
    // Convert our position from -1.0..1.0  to 0.0..1.0
    // Convert texture output 0.0-1.0 to scale 0-FEATID_FACTOR
    vec2 texturePosition = (position + 1.0) / 2.0;
    float overlap = texture2D(overlap, texturePosition).r;

    featIdVec = texture2D(layer, texturePosition).xyz;

    int featId = int(featIdVec.x * 255.0) + int(featIdVec.y * 255.0 * 255.0) + int(featIdVec.z * 255.0 * 255.0 * 255.0);



    // Scale integer into range -1.0...+1.0
    float featLocation = ((float(featId) / float(FEATID_LIMIT)) * 2.0) - 1.0;

    if (overlap > 0.0) {
        gl_Position = vec4(featLocation, 0.0, 0.0, 1.0);
    } else {
        gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
    }
}