import path from 'path';
// rollup 和 babel 集成
import babel from 'rollup-plugin-babel';
// 处理 node_modules 等第三方依赖
import resolve from 'rollup-plugin-node-resolve';
// 将非 ES6 语法的包转为 ES6
import commonjs from 'rollup-plugin-commonjs';
// 替换打包文件里的一些变量，如 process 在浏览器端是不存在的，需要被替换
import { terser } from 'rollup-plugin-terser';

// 项目环境，可以是 development beta 或 production，默认为 production
const nodeEnv = process.env.NODE_ENV;
const file = path.resolve(__dirname, nodeEnv === 'development' ? '../client/scripts/components/load-more.js' : '../dist/scripts/components/load-more.js');

export default {
  input: path.resolve(__dirname, '../client/scripts/components/src/load-more.js'),
  output: {
    file, // 文件名称
    format: 'umd',
    name: 'LoadMore',
    globals: {},
    sourcemap: nodeEnv === 'development'
  },
  // 注意插件的顺序
  plugins: [
    resolve({
      browser: true
    }),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true
    }),
    commonjs(),
    ...(
      nodeEnv === 'production' ? [terser({
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
          drop_console: true,
          
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
        }
      })] : []
    )
  ]
};
