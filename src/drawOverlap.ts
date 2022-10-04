import shaderOverlapVert from "./shaders/overlap.vert";
import shaderOverlapFrag from "./shaders/overlap.frag";
import { DefaultContext, DrawCommand, Framebuffer2D, Regl, Texture2D } from "regl";

export type DrawOverlapProps = {
    //layer1: Texture2D;
    //layer2: Texture2D;
    //layer3: Texture2D;
};

export class OverlapGL {
  regl: Regl;
  toViewport: boolean;
  texture: Texture2D;
  framebuffer: Framebuffer2D;
  drawCommand: DrawCommand<DefaultContext, DrawOverlapProps>;

  constructor(regl: Regl, toViewport: boolean, layer1: Texture2D, layer2: Texture2D, sampleSize: number) {
    this.regl = regl;
    this.toViewport = toViewport;

    this.texture = regl.texture({
      width: sampleSize,
      height: sampleSize,
    });

    this.framebuffer = regl.framebuffer({
      color: this.texture,
      depth: false,
      stencil: false,
    });

    this.drawCommand = regl({
      vert: shaderOverlapVert,
      frag: shaderOverlapFrag,

      attributes: {
        position: regl.buffer([
          [-1, 1],
          [-1, -1],
          [1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ]),
      },
      count: 6,

      uniforms: {
        size: sampleSize,
        layer1: layer1,
        layer2: layer2,
        //layer1: regl.prop("layer1"),
        //layer2: regl.prop("layer2"),
        //layer3: regl.prop("layer3"),
      },

      blend: {
        enable: false,
      },

      depth: {
        enable: false,
      },

      framebuffer: toViewport ? null : this.framebuffer,
    });
  }

  draw(props: DrawOverlapProps) {
    if(!this.toViewport) {
      this.regl.clear({
        framebuffer: this.framebuffer,
        color: [0.0, 0.0, 0.0, 0.0],
      });
    }
    this.drawCommand(props);
  }
}