module.exports = {
  plugins: [
    // Autoprefixer - adiciona prefixos CSS automaticamente
    require('autoprefixer')({
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'not dead',
        'IE 11'
      ]
    }),
    
    // CSSnano - minificação CSS
    require('cssnano')({
      preset: ['default', {
        discardComments: {
          removeAll: true
        },
        normalizeWhitespace: true,
        colormin: true,
        convertValues: true,
        discardDuplicates: true,
        mergeLonghand: true,
        mergeRules: true,
        minifyFontValues: true,
        minifyGradients: true,
        minifyParams: true,
        minifySelectors: true,
        normalizeCharset: true,
        normalizeDisplayValues: true,
        normalizePositions: true,
        normalizeRepeatStyle: true,
        normalizeString: true,
        normalizeTimingFunctions: true,
        normalizeUnicode: true,
        normalizeUrl: true,
        orderedValues: true,
        reduceIdents: true,
        reduceInitial: true,
        reduceTransforms: true,
        svgo: true,
        uniqueSelectors: true
      }]
    }),
    
    // PostCSS Import - permite @import em CSS
    require('postcss-import'),
    
    // PostCSS Nested - permite aninhamento como Sass
    require('postcss-nested'),
    
    // PostCSS Custom Properties - melhora variáveis CSS
    require('postcss-custom-properties')({
      preserve: false
    })
  ]
}