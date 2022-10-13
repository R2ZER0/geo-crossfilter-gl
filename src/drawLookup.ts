import shaderLookupVert from "./shaders/lookup.vert";
import shaderLookupFrag from "./shaders/lookup.frag";
import { FEATID_LIMIT } from "./constants";
import { DefaultContext, DrawCommand, Framebuffer2D, Regl, Texture2D } from "regl";


const pointsGrid = (size: number) => {
    let arr = new Float32Array(size * size * 2);
    for (let y = 0; y < size; ++y) {
    for (let x = 0; x < size; ++x) {
        let arrPos = (size * y + x) * 2;
        arr[arrPos + 0] = (x / size) * 2.0 - 1.0;
        arr[arrPos + 1] = (y / size) * 2.0 - 1.0;
    }
    }
    return arr;
};

export type DrawLookupProps = {};

export class LookupGL {
    regl: Regl;
    texture: Texture2D;
    framebuffer: Framebuffer2D;
    drawCommand: DrawCommand<DefaultContext, DrawLookupProps>;

    constructor(regl: Regl, toViewport: boolean, layerTex: Texture2D, overlapTex: Texture2D, sampleSize: number) {
        this.regl = regl;

        this.texture = regl.texture({ width: FEATID_LIMIT, height: 1 });

        this.framebuffer = regl.framebuffer({
            color: this.texture,
            depth: false,
            stencil: false,
        });

        this.drawCommand = regl({
        vert: shaderLookupVert,
        frag: shaderLookupFrag,

        attributes: {
            position: regl.buffer(pointsGrid(sampleSize)),
        },
        count: sampleSize * sampleSize,
        primitive: "points",

        uniforms: {
            overlap: overlapTex, 
            layer: layerTex,
            sampleSize: sampleSize,
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

    draw() {
        this.regl.clear({
            framebuffer: this.framebuffer,
            color: [0.0, 0.0, 0.0, 0.0],
        });
        this.drawCommand();
    }
}
