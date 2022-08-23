precision mediump float;

uniform float width, height;
uniform sampler2D layer1;
uniform sampler2D layer2;

void main() {
  //gl_FragColor = vec4(gl_FragCoord.x / width, gl_FragCoord.y / height, 0.0, 1.0);

  vec2 pos = vec2(gl_FragCoord.x / width, gl_FragCoord.y / height);
  float l1 = texture2D(layer1, pos).a;
  float l2 = texture2D(layer2, pos).a;

  //gl_FragColor[0] = l1;
  //gl_FragColor[1] = l2;
  gl_FragColor[2] = (l1 + l2) * 0.5;
}
