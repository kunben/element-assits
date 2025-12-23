module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  ignorePatterns: [
    'docker',
    'public',
    'dist'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['vue'],
  rules: {
    /* eslint */
    'quotes': ['error', 'single'],
    // 对象两边必须有空格
    'object-curly-spacing': ['error', 'always'],
    // 数组两边必须没有空格
    'array-bracket-spacing': ['error', 'never'],
    // 数组两边是否换行要保持一致
    'array-bracket-newline': ['error', 'consistent'],
    // 函数参数两边必须有空格
    'space-before-function-paren': ['error', 'always'],
    // 不要尾随分号
    'semi': ['error', 'never'],
    // 连续最大空白行为1，首尾不允许
    'no-multiple-empty-lines': ['error', {
      'max': 1,
      'maxEOF': 0,
      'maxBOF': 0
    }],
    // 强制文件以换行符（LF）结尾
    'eol-last': ['error'],
    // 不允许尾随空格
    'no-trailing-spaces': ['error', { ignoreComments: true }],
    // 冒号前不允许有空格，冒号后必须有空格
    'key-spacing': ['error'],
    // 不允许尾随逗号
    'comma-dangle': ['error', 'never'],

    /* eslint-plugin-vue */
    // Priority A
    // 关闭组件名称校验
    'vue/multi-word-component-names': 'off',
    // Priority B
    // 关闭强制每个组件都应该在自己的文件中
    'vue/one-component-per-file': 'off',
    // template 缩进2个空格，根元素无需缩进，switch语句1倍缩进
    'vue/html-indent': ['error', 2, {
      'baseIndent': 0,
      'switchCase': 1
    }],
    // 单行和多行元素的 > 都无需另起一行
    'vue/html-closing-bracket-newline': ['error', {
      'singleline': 'never',
      'multiline': 'never'
    }],
    // 单行属性最大3个，多行属性每行最大1个
    'vue/max-attributes-per-line': ['error', {
      'singleline': {
        'max': 3
      },
      'multiline': {
        'max': 1
      }
    }],
    // 关闭单行和多行元素内容前后必须换行
    'vue/multiline-html-element-content-newline': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    // Uncategorized
    // script 缩进2个空格，根语句无需缩进
    'vue/script-indent': ['error', 2, {
      'baseIndent': 0,
      'switchCase': 1
    }],
    // 不允许重复的继承属性
    'vue/no-duplicate-attr-inheritance': ['error'],
    // 顶级元素之间必须有空白行
    'vue/padding-line-between-blocks': ['error', 'always'],
    // 取消禁止道具突变
    'vue/no-mutating-props': ['error', {
      'shallowOnly': true
    }]
  }
}
