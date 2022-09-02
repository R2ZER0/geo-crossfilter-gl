import createRegl, { Framebuffer2D, Vec4 } from 'regl';

import shaderLayerVert from './shaders/draw.vert';
import shaderLayerFrag from './shaders/draw.frag';
import shaderOverlapVert from './shaders/overlap.vert';
import shaderOverlapFrag from './shaders/overlap.frag';
import shaderLookupVert from './shaders/lookup.vert';
import shaderLookupFrag from './shaders/lookup.frag';

const FEATID_LIMIT = 1024; // Theoretical max 255*255*255, but any more than 2048 needs 2D
const SAMPLE_SIZE = 512;

// Calling the regl module with no arguments creates a full screen canvas and
// WebGL context, and then uses this context to initialize a new REGL instance
const regl = createRegl({
    container: '#container',
    extensions: ['webgl_draw_buffers', 'oes_texture_float'],
});

const triCoords = (x: number, y: number, scale: number) => [
    [x, y + 0.89 * scale],
    [x - 0.8 * scale, y - 0.39 * scale],
    [x + 0.8 * scale, y - 0.39 * scale]
];



const drawLayer = regl({

    vert: shaderLayerVert,
    frag: shaderLayerFrag,

    attributes: {
        // regl.buffer creates a new array buffer object
        position: (_context, props, _batchId) => regl.buffer(triCoords(props.x, props.y, props.scale)),
        //position: regl.buffer(triCoords(100, 110, 100)),
        // regl automatically infers sane defaults for the vertex attribute pointers
        featid: regl.buffer([
            [2, 2, 2],
        ])
    },


    // This tells regl the number of vertices to draw in this command
    count: 3,

    uniforms: {
        // This defines the color of the triangle to be a dynamic variable
        color: [1, 1, 1, 1],
        width: regl.context('viewportWidth'),
        height: regl.context('viewportHeight'),
    },


    blend: {
        enable: false,
    },

    depth: {
        enable: false
    },

    framebuffer: (_context, props, _bactchId) => props.renderTarget,
});

const drawOverlap = regl({
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
        ])
    },
    count: 6,

    uniforms: {
        width: regl.context('viewportWidth'),
        height: regl.context('viewportHeight'),
        layer1: regl.prop('layer1'),
        layer2: regl.prop('layer2'),
        layer3: regl.prop('layer3'),
    },

    blend: {
        enable: false,
    },

    depth: {
        enable: false
    },

    framebuffer: (_context, props, _bactchId) => props.renderTarget,
});

const pointsGrid = (size: number) => {
    let arr = new Float32Array(size * size * 2);
    for (let y = 0; y < size; ++y) {
        for (let x = 0; x < size; ++x) {
            let arrPos = (size*y + x) * 2;
            arr[arrPos + 0] = (x / size) * 2.0 - 1.0;
            arr[arrPos + 1] = (y / size) * 2.0 - 1.0;
        }
    }
    return arr;
};

const drawFeatLookup = regl({
    vert: shaderLookupVert,
    frag: shaderLookupFrag,

    attributes: {
        position: regl.buffer(pointsGrid(SAMPLE_SIZE))
    },
    count: SAMPLE_SIZE*SAMPLE_SIZE,
    primitive: "points",

    uniforms: {
        overlap: regl.prop('overlap'),
        layer: regl.prop('layer')
    },

    blend: {
        enable: false,
    },

    depth: {
        enable: false
    },

    framebuffer: (_context, props, _bactchId) => props.renderTarget,
});


const tex1 = regl.texture({ width: SAMPLE_SIZE, height: SAMPLE_SIZE});
const tex2 = regl.texture({ width: SAMPLE_SIZE, height: SAMPLE_SIZE});
const tex3 = regl.texture({ width: SAMPLE_SIZE, height: SAMPLE_SIZE});
const texOverlap = regl.texture({ width: SAMPLE_SIZE, height: SAMPLE_SIZE});
const texFeatLookup = regl.texture({ width: FEATID_LIMIT, height: 1 });

const fbo1 = regl.framebuffer({ color: tex1, depth: false, stencil: false });
const fbo2 = regl.framebuffer({ color: tex2, depth: false, stencil: false });
const fbo3 = regl.framebuffer({ color: tex3, depth: false, stencil: false });
const fboOverlap = regl.framebuffer({ color: texOverlap, depth: false, stencil: false });
const fboFeatLookup = regl.framebuffer({ color: texFeatLookup, depth: false, stencil: false });

// regl.frame() wraps requestAnimationFrame and also handles viewport changes
//regl.frame((_) => {
// clear contents of the drawing buffer
regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
});

drawLayer([{
    x: 100, y: 100, scale: 125,
    renderTarget: fbo1
}, {
    x: 200, y: 50, scale: 150,
    renderTarget: fbo2
}, {
    x: 50, y: 130, scale: 70,
    renderTarget: fbo3
}]);

drawOverlap({
    layer1: tex1,
    layer2: tex2,
    layer3: tex3,
    renderTarget: fboOverlap,
});

drawFeatLookup({
    layer: tex1,
    overlap: texOverlap,
    renderTarget: fboFeatLookup,
});

regl({ framebuffer: fboFeatLookup })(() => {
    let pixels = regl.read({
        x: 0,
        y: 0,
        width: 16,
        height: 1,
        data: new Uint8Array(4*16),
    });

    console.log(pixels);
    console.log("Found", pixels.filter(val => val > 0).length);
});
//});