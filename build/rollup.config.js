import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

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
    ...(env === 'production' ? [terser({
      compress: {
        arrows: false,
        collapse_vars: false, // 0.3kb
        comparisons: false,
        computed_props: false,
        hoist_funs: false,
        hoist_props: false,
        hoist_vars: false,
        inline: false,
        loops: false,
        negate_iife: false,
        properties: true,
        reduce_funcs: false,
        reduce_vars: false,
        switches: false,
        toplevel: false,
        typeofs: false,
        drop_console: env === 'production',
    
        booleans: true, // 0.7kb
        if_return: true, // 0.4kb
        sequences: true, // 0.7kb
        unused: true, // 2.3kb
    
        conditionals: true,
        dead_code: true,
        evaluate: true
      },
      mangle: {
        safari10: true
      },
      sourcemap: false
    })] : [])
  ]
};

export default config;
