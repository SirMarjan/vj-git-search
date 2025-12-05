import { EditorState } from '@codemirror/state'
import { bracketMatching, LanguageSupport } from '@codemirror/language'
import { standardKeymap } from '@codemirror/commands'
import { highlightSelectionMatches } from '@codemirror/search'
import {
  lineNumbers,
  highlightActiveLineGutter,
  drawSelection,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  keymap,
  EditorView,
} from '@codemirror/view'
import { angular } from '@codemirror/lang-angular'
import { css } from '@codemirror/lang-css'
import { cpp } from '@codemirror/lang-cpp'
import { go } from '@codemirror/lang-go'
import { html } from '@codemirror/lang-html'
import { java } from '@codemirror/lang-java'
import { javascript } from '@codemirror/lang-javascript'
import { jinja } from '@codemirror/lang-jinja'
import { json } from '@codemirror/lang-json'
import { liquid } from '@codemirror/lang-liquid'
import { markdown } from '@codemirror/lang-markdown'
import { php } from '@codemirror/lang-php'
import { python } from '@codemirror/lang-python'
import { rust } from '@codemirror/lang-rust'
import { sass } from '@codemirror/lang-sass'
import { sql } from '@codemirror/lang-sql'
import { vue } from '@codemirror/lang-vue'
import { wast } from '@codemirror/lang-wast'
import { xml } from '@codemirror/lang-xml'
import { yaml } from '@codemirror/lang-yaml'
import { oneDark } from '@codemirror/theme-one-dark'
import { highlightLinesPlugin } from './highlightLinesPlugin'
import { highlightTextPlugin } from './highlightTextPlugin'

export type Syntax =
  | 'angular'
  | 'css'
  | 'cpp'
  | 'go'
  | 'html'
  | 'java'
  | 'javascript'
  | 'jinja'
  | 'json'
  | 'liquid'
  | 'markdown'
  | 'php'
  | 'python'
  | 'rust'
  | 'sass'
  | 'sql'
  | 'vue'
  | 'wast'
  | 'xml'
  | 'yaml'

const syntaxMap: Record<Syntax, () => LanguageSupport> = {
  angular: angular,
  css: css,
  cpp: cpp,
  go: go,
  html: html,
  java: java,
  javascript: javascript,
  jinja: jinja,
  json: json,
  liquid: liquid,
  markdown: markdown,
  php: php,
  python: python,
  rust: rust,
  sass: sass,
  sql: sql,
  vue: vue,
  wast: wast,
  xml: xml,
  yaml: yaml,
} as const

const syntaxExtensions = new Map<Syntax, string[]>([
  ['angular', ['component.html']],
  ['css', ['css']],
  ['cpp', ['cpp', 'cc', 'cxx', 'c++', 'h', 'hpp', 'hxx']],
  ['go', ['go']],
  ['html', ['html', 'htm']],
  ['java', ['java']],
  ['javascript', ['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs']],
  ['jinja', ['jinja', 'jinja2', 'j2']],
  ['json', ['json', 'jsonc']],
  ['liquid', ['liquid']],
  ['markdown', ['md', 'markdown', 'mdown', 'mkd']],
  ['php', ['php', 'php3', 'php4', 'php5', 'phtml']],
  ['python', ['py', 'pyw', 'pyx', 'pyi']],
  ['rust', ['rs']],
  ['sass', ['scss', 'sass']],
  ['sql', ['sql', 'mysql', 'pgsql']],
  ['vue', ['vue']],
  ['wast', ['wast', 'wat']],
  ['xml', ['xml', 'xsd', 'xsl', 'xslt', 'svg']],
  ['yaml', ['yaml', 'yml']],
])

export function getSyntaxFromPath(path: string): Syntax | undefined {
  const filename = path.split('/').pop()
  if (filename == null) {
    return
  }

  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1) {
    return
  }

  const fileExtension = filename.substring(lastDotIndex + 1).toLowerCase()

  for (const [syntax, extensions] of syntaxExtensions) {
    if (extensions.includes(fileExtension)) {
      return syntax
    }
  }
  return
}

export function createReadOnlyEditorView(
  text: string,
  syntax: Syntax | undefined,
  highlightLines: number[],
  highlightText?: string,
): EditorView {
  return new EditorView({
    doc: text,
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      drawSelection(),
      EditorState.allowMultipleSelections.of(true),
      bracketMatching(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      highlightLinesPlugin(highlightLines.map((lineNo) => lineNo + 1)),
      highlightTextPlugin(highlightText),
      oneDark,
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
      EditorView.contentAttributes.of({ tabindex: '0' }),
      keymap.of([...standardKeymap]),
      ...(syntax ? [syntaxMap[syntax]()] : []),
    ],
  })
}
