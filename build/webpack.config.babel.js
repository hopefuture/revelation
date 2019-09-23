import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import autoprefixer from 'autoprefixer';
import flexbugs from 'postcss-flexbugs-fixes'; // 修复 flexbox 已知的 bug
import cssnano from 'cssnano'; // 优化 css，对于长格式优化成短格式等

const appRoot = path.resolve(__dirname, '../');

// 是否做 webpack bundle 分析
const isAnalyze = process.env.ANALYZE === 'true';
const isDev = process.env.NODE_ENV === 'development';

// webpack config
const webpackConfig = {
  mode: process.env.NODE_ENV,
  cache: isDev, // 开启缓存,增量编译
  bail: false, // 设为 true 时如果发生错误，则不继续尝试
  devtool: isDev ? 'eval-source-map' : false, // 生成 source map文件
  /*
   * Specify what bundle information gets displayed
   * https://webpack.js.org/configuration/stats/
   */
  stats: {
    cached: isDev, // 显示缓存信息
    cachedAssets: isDev, // 显示缓存的资源（将其设置为 `false` 则仅显示输出的文件）
    chunks: isDev, // 显示 chunk 信息（设置为 `false` 仅显示较少的输出）
    chunkModules: isDev, // 将构建模块信息添加到 chunk 信息
    colors: true,
    hash: isDev, // 显示编译后的 hash 值
    modules: isDev, // 显示构建模块信息
    reasons: isDev, // 显示被导入的模块信息
    timings: true, // 显示构建时间信息
    version: isDev // 显示 webpack 版本信息
  },
  /*
   * https://webpack.js.org/configuration/target/#target
   * webpack 能够为多种环境构建编译，默认是 'web'，可省略
   */
  target: 'web',
  resolve: {
    // 自动扩展文件后缀名
    extensions: ['.js', '.scss', '.css', '.png', '.jpg', '.gif'],
    // 模块别名定义，方便直接引用别名
    alias: {},
    // 参与编译的文件
    modules: ['client', 'node_modules']
  },
  
  /*
   * 入口文件，让 webpack 用哪个文件作为项目的入口
   * 如果用到了新的 es6 api，需要引入 babel-polyfill，比如 String.prototype 中的方法 includes
   * 所以根据实际需要是否引入 babel-polyfill
   */
  entry: {
    home: ['./client/scripts/home/index.js'],
    about: ['./client/scripts/about/index.js'],
    overview: ['./client/scripts/overview/index.js'],
    news: ['./client/scripts/news/index.js'],
    'news-detail': ['./client/scripts/news-detail/index.js'],
    contact: ['./client/scripts/contact/index.js']
  },
  
  // 出口， 让 webpack 把处理完成的文件放在哪里
  output: {
    // 打包输出目录（必选项, 不能省略）
    path: path.resolve(appRoot, 'dist'),
    filename: 'scripts/[name].js', // 打包文件名称
    publicPath: isDev ? '/' : '../',
    pathinfo: isDev // 打印路径信息
  },
  
  // module 处理
  module: {
    /*
     * Make missing exports an error instead of warning
     * 缺少 exports 时报错，而不是警告
     */
    strictExportPresence: true,
    
    rules: [
      // https://github.com/MoOx/eslint-loader
      ...(
        isDev ? [{
          enforce: 'pre',
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'eslint-loader',
            options: {
              configFile: '.eslintrc.js',
              // 验证失败，终止
              emitError: true
            }
          }
        }] : []
      ),
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: isDev,
            babelrc: false,
            presets: [
              [
                '@babel/preset-env',
                {
                  modules: false, // 设为 false，交由 Webpack 来处理模块化
                  debug: isDev
                }
              ]
            ]
          }
        }
      },
      {
        test: /\.css/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDev
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: isDev,
              plugins: [
                cssnano({
                  autoprefixer: false,
                  zindex: false
                }),
                flexbugs(),
                autoprefixer({
                  flexbox: 'no-2009'
                })
              ]
            }
          }
        ]
        // publicPath: '/public/dist/' 这里如设置会覆盖 output 中的 publicPath
      },
      {
        test: /\.scss/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDev
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: isDev,
              // postcss plugins https://github.com/postcss/postcss/blob/master/docs/plugins.md
              plugins: [
                cssnano({
                  autoprefixer: false,
                  zindex: false
                }),
                flexbugs(),
                autoprefixer({
                  flexbox: 'no-2009'
                })
              ]
            }
          },
          {
            /*
             * Webpack loader that resolves relative paths in url() statements
             * based on the original source file
             */
            loader: 'resolve-url-loader',
            options: {
              debug: isDev
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true, // 必须保留
              sassOptions: {
                outputStyle: isDev ? 'expanded' : 'compressed', // 不压缩，设为 compressed 表示压缩
                precision: 15 // 设置小数精度
              }
            }
          }
        ]
      },
      {
        test: /\.(bmp|gif|jpe?g|png|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[path][name].[ext]?[hash:8]',
            limit: 4096 // 4kb
          }
        }
      }
    ]
  },
  
  // webpack 4 新增属性，选项配置，原先的一些插件部分放到这里设置
  optimization: {
    ...(!isDev ? {
      removeEmptyChunks: true, // 空的块chunks会被移除。这可以减少文件系统的负载并且可以加快构建速度。
      mergeDuplicateChunks: true, // 相同的块被合并。这会减少生成的代码并缩短构建时间。
      occurrenceOrder: true, // Webpack将会用更短的名字去命名引用频度更高的chunk
      sideEffects: true, // 剔除掉没有依赖的模块
      // 为 webpack 运行时代码和 chunk manifest 创建一个单独的代码块。这个代码块应该被内联到 HTML 中，生产环境不需要
      runtimeChunk: false,
      // 开启后给代码块赋予有意义的名称，而不是数字的 id
      namedChunks: false
      // webpack 默认使用 TerserPlugin 来压缩
      // minimizer: []
    } : {})
  },
  
  // https://webpack.js.org/concepts/mode/#mode-development
  plugins: [
    ...(isDev ? [
      new webpack.HotModuleReplacementPlugin() // 热部署替换模块
    ] : [
      // 用来优化生成的代码 chunk，合并相同的代码
      new webpack.optimize.AggressiveMergingPlugin(),
      new MiniCssExtractPlugin({
        filename: 'css/[name].css'
      }),
      new webpack.HashedModuleIdsPlugin()
    ]),
    ...(isAnalyze
      ? [
        new BundleAnalyzerPlugin() // Webpack Bundle Analyzer: https://github.com/th0r/webpack-bundle-analyzer
      ]
      : [])
  ],
  ...(
    isDev
      ? {
        devServer: {
          port: 8088,
          // port: 80,
          host: '0.0.0.0',
          disableHostCheck: true,
          overlay: {
            errors: true // 在网页上显示错误
          },
          contentBase: [path.resolve(appRoot, 'client')],
          hot: true // 设为 true 和加上 webpack.HotModuleReplacementPlugin，不用刷新页面就会更新 dom
          // open: true
        }
      }
      : {})
};

const { entry } = webpackConfig;

// html
const htmlMap = {
  home: 'client/pages/home.html',
  about: 'client/pages/about.html',
  overview: 'client/pages/overview.html',
  news: 'client/pages/news.html',
  'news-detail': 'client/pages/news-detail.html',
  contact: 'client/pages/contact.html'
};

Object.keys(entry).forEach((item) => {
  webpackConfig.plugins.push(new HtmlWebpackPlugin({
    filename: `pages/${item}.html`,
    template: htmlMap[item],
    chunks: [item] // 指定要引入的 chunk
  }));
});

export default webpackConfig;
