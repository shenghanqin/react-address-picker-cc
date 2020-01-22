import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter/prism' // 依赖storybook已经安装的版本，8.1.0
require('./prism.css')

export default class CodeBlock extends React.PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    const customStyle = {
      margin: 0
    }
    let { language = 'jsx', value = '', children = '' }  = this.props
    return (
      <SyntaxHighlighter
        language={language}
        customStyle={customStyle}
        useInlineStyles={false}
      >
      {value}
      </SyntaxHighlighter>
    )
  }
}