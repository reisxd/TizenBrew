module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    require("./flexbox-gap-polyfill.cjs"),
    require('postcss-preset-env')({
      stage: 0,
      features: {
        'nesting-rules': true
      },
      browsers: 'chrome < 47'
    }),
    require("postcss-css-variables")
  ]
};
