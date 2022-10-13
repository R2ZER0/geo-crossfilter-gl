precision mediump float;

uniform sampler2D lookup;
varying float v_featid;

#define FEATID_LIMIT 256.0

void main() {
  // Convert featid from scale 0..FEATID_LIMIT  to 0.0..1.0
  float texturePosition = (v_featid / FEATID_LIMIT); // + (0.5 / FEATID_LIMIT);
  
  float l = texture2D(lookup, vec2(texturePosition, 0.5)).a;

  if(l > 0.0) {
    //gl_FragColor = vec4(0.0, v_featid / FEATID_LIMIT, 64.0 / 256.0, 1.0);
    //gl_FragColor = vec4(1.0, v_featid / 128.0, mod(v_featid / 8.0, 1.0), 1.0);

    gl_FragColor = vec4(
      mod(v_featid, 8.0) / 8.0,
      mod(v_featid, 32.0) / 32.0,
      mod(v_featid, 128.0) / 128.0,
      1.0
    );
  } else {
    discard;
  }
  
}
