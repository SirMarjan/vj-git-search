import {
  Decoration,
  type DecorationSet,
  EditorView,
  type PluginValue,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view'
import { RangeSet, RangeSetBuilder } from '@codemirror/state'

export function highlightLinesPlugin(
  hightlightLines: number[],
  styleClass = 'highlight-line',
): ViewPlugin<PluginValue> {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet

      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view)
      }

      update(update: ViewUpdate): void {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.buildDecorations(update.view)
        }
      }

      buildDecorations(view: EditorView): RangeSet<Decoration> {
        const builder = new RangeSetBuilder<Decoration>()
        if (hightlightLines.length === 0) {
          return builder.finish()
        }

        const doc = view.state.doc
        const docLines = doc.lines
        for (const hightlightLine of hightlightLines) {
          if (hightlightLine >= 1 && hightlightLine <= docLines) {
            const line = doc.line(hightlightLine)
            builder.add(line.from, line.from, Decoration.line({ class: styleClass }))
          }
        }
        return builder.finish()
      }
    },
    {
      decorations: (v) => v.decorations,
    },
  )
}
