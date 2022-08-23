import createRegl, { Framebuffer2D, Vec4 } from 'regl';

import drawVertShader from './shaders/draw.vert';
import drawFragShader from './shaders/draw.frag';
import combineVertShader from './shaders/combine.vert';
import combineFragShader from './shaders/combine.frag';

// Calling the regl module with no arguments creates a full screen canvas and
// WebGL context, and then uses this context to initialize a new REGL instance
const regl = createRegl({
    container: '#container',
    extensions: ['webgl_draw_buffers', 'oes_texture_float'],
});

const triCoords = (x: number, y: number, scale: number) => [
    [x, y + 0.89*scale],
    [x - 0.8*scale, y - 0.39*scale],
    [x + 0.8*scale, y - 0.39*scale]
];



const drawTriangle = (x: number, y: number, scale: number, renderTarget: Framebuffer2D | null) => regl({

    vert: drawVertShader,
    frag: drawFragShader,

    attributes: {
        // regl.buffer creates a new array buffer object
        position: regl.buffer(triCoords(x, y, scale))
        // regl automatically infers sane defaults for the vertex attribute pointers
    },

    // This tells regl the number of vertices to draw in this command
    count: 3,

    uniforms: {
        // This defines the color of the triangle to be a dynamic variable
        color: [1, 1, 1, 1],
        width: regl.context('viewportWidth'),
        height: regl.context('viewportHeight'),
        scale: 25,
    },


    blend: {
        enable: false,
    },

    depth: {
        enable: false
    },

    framebuffer: renderTarget,
});

const drawCombine = regl({
    vert: combineVertShader,
    frag: combineFragShader,

    attributes: {
        position: regl.buffer([
            [-1,  1],
            [-1, -1],
            [ 1, -1],
            [ 1, -1],
            [ 1,  1],
            [-1,  1],
        ])
    },
    count: 6,

    uniforms: {
        width: regl.context('viewportWidth'),
        height: regl.context('viewportHeight'),
        layer1: regl.prop('layer1'),
        layer2: regl.prop('layer2'),
    },

    blend: {
        enable: false,
    },

    depth: {
        enable: false
    },

});


const tex1 = regl.texture({ width: 512, height: 512 });
const tex2 = regl.texture({ width: 512, height: 512 });

const fbo1 = regl.framebuffer({ color: tex1, depth: false, stencil: false });
const fbo2 = regl.framebuffer({ color: tex2, depth: false, stencil: false });

const drawLayer1 = drawTriangle(100, 100, 125, fbo1);
const drawLayer2 = drawTriangle(200, 50,  150, fbo2);

// regl.frame() wraps requestAnimationFrame and also handles viewport changes
regl.frame((_) => {
    // clear contents of the drawing buffer
    regl.clear({
        color: [0, 0, 0, 1],
        depth: 1
    })

    drawLayer1();
    drawLayer2();

    drawCombine({
        layer1: tex1,
        layer2: tex2,
    });
});
