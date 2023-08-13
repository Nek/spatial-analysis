import useHotkeys from '@reecelucas/react-use-hotkeys'
import { Editor } from '$/types'

function useAppHotkeys(editor: Editor) {
  useHotkeys('Escape', () => {
    editor.selectedObserverId = null
  })

  useHotkeys('t', () => {
    editor.transformMode = 'translate'
  })
  useHotkeys(
    's',
    () => {
      editor.transformMode = 'scale'
    },
    {
      enabled: false,
    },
  )
  useHotkeys('r', () => {
    editor.transformMode = 'rotate'
  })

  useHotkeys('c', () => {
        editor.coordinateSystem = 'world' ? 'local' : 'world'
      } 
  )

  useHotkeys(' ', (event) => {
    editor.cameraControl = editor.cameraControl === 'orbit' ? null : 'orbit'
    event.preventDefault()
  })
}

export { useAppHotkeys as useHotkeys }
