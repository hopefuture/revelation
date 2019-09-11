const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = ctx => ({
  plugins: [
    cssnano({
      autoprefixer: false,
      zindex: false
    }),
    autoprefixer()
  ]
});
