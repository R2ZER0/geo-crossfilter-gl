import createRegl, { Framebuffer2D, Vec4 } from "regl";

import Point from "@mapbox/point-geometry";
import type { PolyData } from "./mvt";
import { loadMvtData } from "./mvt";

import shaderDrawVert from "./shaders/draw.vert";
import shaderDrawFrag from "./shaders/draw.frag";

const regl = createRegl({
  container: "#container",
  extensions: ["OES_element_index_uint"],
  //extensions: ["webgl_draw_buffers", "oes_texture_float", "WEBGL_color_buffer_float"],
});

type DrawPolyProps = {
  vertices: Float32Array;
  featids: Float32Array;
  triangles: Uint32Array;
  size: number;
  renderTarget: Framebuffer2D | null;
};

const drawPoly =
  regl({
    attributes: {
      position: regl.prop('vertices'),
      featid: regl.prop('featids'),
    },
    
    elements: (_context, props: DrawPolyProps, _batchId) => regl.elements({
      primitive: "triangles",
      data: props.triangles,
      type: "uint32",
    }),

    uniforms: {
      size: regl.prop('size'),
    },

    blend: {
      enable: false,
    },

    depth: {
      enable: false,
    },

    vert: shaderDrawVert,
    frag: shaderDrawFrag,
    //framebuffer: (_context, props: DrawPolyProps, _bactchId) => props.renderTarget,
  });

const MVT_URL = "https://astrosat-testing-public.s3.dualstack.eu-west-1.amazonaws.com/astrosat/lad_2019_gb_childpov2019_breakdown_raw__mvt/7/62/39.pbf";

const main = async () => {
  let data = await loadMvtData(MVT_URL);

  regl.clear({
    color: [0, 0, 0, 1],
  });

  console.log(data.attributes);

  drawPoly({
    "vertices": data.attributes.vertices,
    "featids": data.attributes.featids,
    "triangles": data.attributes.triangles,
    "size": data.extent,
  });

};

main().catch(error => console.error('Main Error', error)).then(() => console.log("main complete"));