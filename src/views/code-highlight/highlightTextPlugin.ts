import {
  Decoration,
  type DecorationSet,
  EditorView,
  type PluginValue,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view'
import { RangeSet, RangeSetBuilder } from '@codemirror/state'

export function highlightTextPlugin(
  hightlightText?: string,
  styleClass = 'highlight-text',
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
        if (hightlightText == null || hightlightText.trim() === '') {
          return builder.finish()
        }

        const doc = view.state.doc
        const text = doc.toString()
        const searchLower = hightlightText.toLowerCase()
        let searchIdx = 0

        while (searchIdx < text.length) {
          const foundIdx = text.toLowerCase().indexOf(searchLower, searchIdx)
          if (foundIdx === -1) {
            break
          }

          builder.add(
            foundIdx,
            foundIdx + hightlightText.length,
            Decoration.mark({ class: styleClass }),
          )
          searchIdx = foundIdx + 1
        }

        return builder.finish()
      }
    },
    {
      decorations: (v) => v.decorations,
    },
  )
}
