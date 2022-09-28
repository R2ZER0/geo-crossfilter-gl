import { glslify } from 'vite-plugin-glslify';

export default {
    plugins: [
        glslify()
    ],
    assetsInclude: ['**/*.pbf'],
}
