import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';

const env = process.env.NODE_ENV;
const config = {
  input: 'client/scripts/src/home.js',
  output: {
    file: 'client/scripts/home.js',
    format: 'umd',
    name: 'RevelationHome',
    indent: false,
    sourcemap: env === 'development'
  },
  plugins: [
    resolve({
      browser: true
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    commonjs(),
    ...(env === 'production' ? [uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })] : [])
  ]
};

export default config;
