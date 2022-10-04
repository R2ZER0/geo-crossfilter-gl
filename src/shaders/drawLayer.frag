precision mediump float;

uniform float debugVisible;

varying float v_featid;

void main() {
  vec3 featIdVec = vec3(0.0);
  float featid = v_featid;
  featIdVec.x = mod(featid, 255.0) / 255.0;
  featIdVec.y = mod(featid / 255.0, 255.0) / 255.0;
  featIdVec.z = mod(featid / (255.0 * 255.0), 255.0) / 255.0;

  if(debugVisible > 0.5) {
    gl_FragColor = vec4(1.0, v_featid / 10.0, 0.0, 1.0);
  } else {
    gl_FragColor = vec4(featIdVec, 1.0);
  }
}
