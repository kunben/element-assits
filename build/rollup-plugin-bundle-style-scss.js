import fs from 'node:fs'

export default function () {
  let scssContent = fs.readFileSync('src/variables.scss')
  return {
    name: 'rollup-plugin-bundle-style-scss',
    transform (code, id) {
      if (id.endsWith('.css')) {
        scssContent += code
      }
      if (id.endsWith('.vue')) {
        // 从Vue单文件组件中提取样式
        const styleBlockRegex = /<style.*?lang=["']scss["'][\s\S]*?>([\s\S]*?)<\/style>/g
        let match
        while ((match = styleBlockRegex.exec(code)) !== null) {
          scssContent += match[1]
        }
      }
      // 不返回任何内容
    },
    generateBundle () {
      this.emitFile({
        type: 'asset',
        fileName: 'style.scss',
        source: scssContent
      })
    }
  }
}
