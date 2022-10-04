import { DefaultContext, DrawCommand, Framebuffer2D, Regl, Texture2D } from "regl";
import { MvtData, MvtFeature } from "./mvt";
import shaderDrawVert from "./shaders/drawLayer.vert";
import shaderDrawFrag from "./shaders/drawLayer.frag";

export type DrawLayerProps = {
  filterRange: [number, number];
  toViewport: boolean, 
};

/*

      vertices: this.geoData.attributes.vertices,
      featids: this.geoData.attributes.featids,
      triangles: this.geoData.attributes.triangles,
      size: this.geoData.extent,
      filterValues: this.filterValuesArray,
      filterRange: options.filterRange,
      renderTarget: options.toViewport ? null : this.framebuffer,

*/

export class LayerGL {
  regl: Regl;
  geoData: MvtData;
  sampleSize: number
  texture: Texture2D;
  framebuffer: Framebuffer2D;
  drawCommand: DrawCommand<DefaultContext, DrawLayerProps>

  constructor(regl: Regl, options: { data: MvtData, getFilterValue: (feat: MvtFeature) => number, sampleSize?: number}) {
    this.regl = regl;
    this.geoData = options.data;
    this.sampleSize = options.sampleSize || 512;

    this.texture = regl.texture({
      width: this.sampleSize,
      height: this.sampleSize,
    });

    this.framebuffer = regl.framebuffer({
      color: this.texture,
      depth: false,
      stencil: false /* colorType: 'uint8' */,
    });

    // Map featId => filterValue
    const filterValuesMap = new Map<number, number>(
        options.data.features.map((feat: MvtFeature) => [feat.id, options.getFilterValue(feat)])
    );

    const filterValuesArray = this.geoData.attributes.featids.map(fid => filterValuesMap.get(fid) || 0);

    console.log(filterValuesArray);
    
    this.drawCommand = regl({
      attributes: {
        position: regl.buffer(options.data.attributes.vertices),
        featid: regl.buffer(options.data.attributes.featids),
        filterValue: regl.buffer(filterValuesArray),
      },

      elements: regl.elements({
          primitive: "triangles",
          data: options.data.attributes.triangles,
          type: "uint32",
        }),

      uniforms: {
        size: this.geoData.extent,
        filterMin: (_context, props: DrawLayerProps, _batchId) => props.filterRange[0],
        filterMax: (_context, props: DrawLayerProps, _batchId) => props.filterRange[1],
        debugVisible: (_context, props: DrawLayerProps, _batchId) => props.toViewport ? 1.0 : 0.0,
      },

      blend: {
        enable: false,
      },

      depth: {
        enable: false,
      },

      vert: shaderDrawVert,
      frag: shaderDrawFrag,
      framebuffer: (_context, props: DrawLayerProps, _batchId) => props.toViewport ? null : this.framebuffer,
    });

  }

  draw(props: DrawLayerProps) {
    if(!props.toViewport) {
      this.regl.clear({
        framebuffer: this.framebuffer,
        color: [0.0, 0.0, 0.0, 0.0],
      });
    }
    this.drawCommand(props);
  }
};
