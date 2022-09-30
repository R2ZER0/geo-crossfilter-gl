#version 100

precision mediump float;
//uniform vec4 color;
varying float v_featid;


void main() {
  vec3 featIdVec = vec3(0.0);
  float featid = v_featid;
  featIdVec.x = mod(featid, 255.0) / 255.0;
  featIdVec.y = mod(featid / 255.0, 255.0) / 255.0;
  featIdVec.z = mod(featid / (255.0 * 255.0), 255.0) / 255.0;

  gl_FragColor = vec4(featIdVec.x * 16.0, featIdVec.y * 64.0, 1.0, 1.0);

  //gl_FragColor = vec4(1.0, 1.0, v_featid / 10.0, 1.0);
}
