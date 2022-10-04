precision mediump float;

uniform sampler2D lookup;
varying float v_featid;

#define FEATID_LIMIT 128.0

void main() {
  vec3 featIdVec = vec3(0.0);
  float featid = v_featid;
  featIdVec.x = mod(featid, 255.0) / 255.0;
  featIdVec.y = mod(featid / 255.0, 255.0) / 255.0;
  featIdVec.z = mod(featid / (255.0 * 255.0), 255.0) / 255.0;

  // TODO: Lookup in texture if we should display this or not

  // Convert featid from scale 0..FEATID_LIMIT  to 0.0..1.0
  float texturePosition = (featid / FEATID_LIMIT);
  float l = texture2D(lookup, vec2(texturePosition, 0.5)).a;

  if(l > 0.5) {
    gl_FragColor = vec4(0.0, v_featid / 10.0, 0.0, 1.0);
  } else {
    discard;
  }
}
