import { Regl, Texture2D, DrawCommand, DefaultContext } from "regl";
import shaderCrossfilterVert from "./shaders/drawCrossfilter.vert";
import shaderCrossfilterFrag from "./shaders/drawCrossfilter.frag";
import { MvtData } from "./mvt";


export type DrawCrossfilterProps = {};

export class CrossfilterGL {
  regl: Regl;
  drawCommand: DrawCommand<DefaultContext, DrawCrossfilterProps>;

  constructor(regl: Regl, data: MvtData, lookup: Texture2D) {
    this.regl = regl;

    this.drawCommand = regl({
      vert: shaderCrossfilterVert,
      frag: shaderCrossfilterFrag,

      attributes: {
        position: regl.buffer(data.attributes.vertices),
        featid: regl.buffer(data.attributes.featids),
      },

      elements: regl.elements({
          primitive: "triangles",
          data: data.attributes.triangles,
          type: "uint32",
        }),


      uniforms: {
        size: data.extent,
        lookup: lookup,
      },

      blend: {
        enable: false,
      },

      depth: {
        enable: false,
      },
    });
  }

  draw() {
    this.drawCommand();
  }
}

/*
const drawLayerFiltered = regl({
  ...layerAttrs,
  vert: shaderLayerVert,
  frag: `
precision mediump float;
uniform vec4 color;
uniform sampler2D lookup;
varying float v_featid;


void main() {
    float show = texture2D(lookup, vec2(v_featid / float(${FEATID_LIMIT}), 0.0)).a;
    gl_FragColor = color * show;
}
    `,
  uniforms: {
    // This defines the color of the triangle to be a dynamic variable
    color: regl.prop('colour'),
    width: regl.context("viewportWidth"),
    height: regl.context("viewportHeight"),
    lookup: regl.prop('lookup'),
  },
});
*/