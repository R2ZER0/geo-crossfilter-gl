precision mediump float;

uniform float width, height;
uniform sampler2D layer1;
uniform sampler2D layer2;
uniform sampler2D layer3;

void main() {
  //gl_FragColor = vec4(gl_FragCoord.x / width, gl_FragCoord.y / height, 0.0, 1.0);

  vec2 pos = vec2(gl_FragCoord.x / width, gl_FragCoord.y / height);
  float l1 = texture2D(layer1, pos).a;
  float l2 = texture2D(layer2, pos).a;
  float l3 = texture2D(layer3, pos).a;

  float overlap = floor(clamp((l1 + l2 + l3) / 2.0, 0.0, 1.0));

  gl_FragColor = vec4(overlap, overlap, overlap, 1.0);
}
