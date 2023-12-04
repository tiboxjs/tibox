module.exports = {
  env: {
    browser: false,
    es2017: true,
  },
  extends: ['@haoqimao/eslint-config-miniprogram'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  globals: {
    wx: 'readonly',
    App: 'readonly',
    Component: 'writable',
    Behavior: 'readonly',
  },
  rules: {
    'object-curly-newline': 0,
    'linebreak-style': 0,
    complexity: ['error', { max: 96 }],
    'no-nested-ternary': 0,
    'consistent-return': 0,
    'arrow-body-style': 0,
    'class-methods-use-this': 0,
    'no-use-before-define': 0,
    eqeqeq: 0,
    'no-restricted-globals': 0,
    'no-prototype-builtins': 0,
    'no-lonely-if': 0, // 在if中写if
    camelcase: 0, // 驼峰
    'no-unused-expressions': 0,
    'no-cond-assign': 0,
    'max-len': 0,
    'no-mixed-operators': 0,
    'prefer-spread': 0,
    'no-case-declarations': 0,
    'new-cap': 0,
    'no-shadow': 0, // 变量作用域相同名称，暂时关闭
    'no-unused-vars': 0, // 定义变量未使用
    'comma-dangle': [
      'warn',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'ignore',
      },
    ],
  },
}
