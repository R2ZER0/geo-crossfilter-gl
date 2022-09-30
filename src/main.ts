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
  vertices: Point[];
  triangles: number[][];
  featid: number;
  renderTarget: Framebuffer2D | null;
};

const drawPoly = (poly: PolyData, extent: number) =>
  regl({
    attributes: {
      position: poly.vertices,
      featid: poly.featids,
    },
    
    elements: regl.elements({
      primitive: "triangles",
      data: poly.triangles,
      type: "uint32",
    }),

    uniforms: {
      extent: extent,
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

  drawPoly(data.attributes, data.extent)();

  // data.features.forEach(feat => {
  //   let poly = feat.poly;

  //   console.log("Poly", poly);
  //   let drawPolyCmd = drawPoly(poly, data.extent);

  //   drawPolyCmd();

  // });
};

main().catch(error => console.error('Main Error', error)).then(() => console.log("main complete"));