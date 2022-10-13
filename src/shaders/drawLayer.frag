precision mediump float;

uniform float debugVisible;

varying float v_featid;


vec3 featid_to_vec(float featid) {
  //vec3 featIdVec = vec3(0.0);
  //featIdVec.x = mod(featid, 255.0) / 255.0;
  //featIdVec.y = mod(featid / 255.0, 255.0) / 255.0;
  //featIdVec.z = mod(featid / (255.0 * 255.0), 255.0) / 255.0;
  //return featIdVec;
  return vec3(featid / 256.0, 0.0, 0.0);
}

void main() {
  vec3 featIdVec = featid_to_vec(v_featid);

  if(debugVisible > 0.5) {
    gl_FragColor = vec4(
      mod(v_featid, 8.0) / 8.0,
      mod(v_featid, 32.0) / 32.0,
      mod(v_featid, 128.0) / 128.0,
      1.0
    );
  } else {
    gl_FragColor = vec4(featIdVec, 1.0);
  }
}
