module.exports = function() {
  const { BABEL_MODULE, NODE_ENV } = process.env;
  const isTest = NODE_ENV === 'test';
  const useESModules = BABEL_MODULE !== 'commonjs' && !isTest;

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          loose: true,
          modules: useESModules ? false : 'commonjs'
        }
      ],
      [
        '@vue/babel-preset-jsx',
        {
          functional: false
        }
      ],
      '@babel/preset-typescript'
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          corejs: false,
          helpers: true,
          regenerator: isTest,
          useESModules
        }
      ],
      [
        'import',
        {
          libraryName: 'vant',
          libraryDirectory: 'es',
          style: true
        },
        'vant'
      ],
      '@babel/plugin-transform-object-assign',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator'
    ]
  };
};

export default module.exports;