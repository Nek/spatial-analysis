import { Dispatch, SetStateAction } from 'react'
import useHotkeys from '@reecelucas/react-use-hotkeys'
import { Editor } from './state.ts'
import { produce } from 'immer'

function useAppHotkeys(setEditor: Dispatch<SetStateAction<Editor>>) {
  useHotkeys('Escape', () =>
    setEditor(
      produce((draft) => {
        draft.selectedObserverId = null
      }),
    ),
  )
  useHotkeys('t', () =>
    setEditor(
      produce((draft) => {
        draft.transformMode = 'translate'
      }),
    ),
  )
  useHotkeys(
    's',
    () =>
      setEditor(
        produce((draft) => {
          draft.transformMode = 'scale'
        }),
      ),
    {
      enabled: false,
    },
  )
  useHotkeys('r', () =>
    setEditor(
      produce((draft) => {
        draft.transformMode = 'rotate'
      }),
    ),
  )

  useHotkeys('c', () =>
    setEditor(
      produce((draft) => {
        draft.coordinateSystem = 'world' ? 'local' : 'world'
      }),
    ),
  )

  useHotkeys(' ', (event) => {
    setEditor(
      produce((draft) => {
        draft.cameraControl = draft.cameraControl === 'orbit' ? null : 'orbit'
      }),
    )
    event.preventDefault()
  })
}

export { useAppHotkeys as useHotkeys }
