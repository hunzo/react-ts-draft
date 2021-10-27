import {
    convertToRaw,
    DraftEditorCommand,
    Editor,
    EditorState,
    getDefaultKeyBinding,
    Modifier,
    RichUtils,
} from 'draft-js'
import React, { useState } from 'react'
import './App.css'

interface selecTion {
    offset: number
    focusOffset: number
    isBackward: boolean
}

const App: React.FC = () => {
    const [editorState, setEditorState] = useState<EditorState>(
        EditorState.createEmpty()
    )

    const [selecState, setSelectState] = useState<selecTion>({
        offset: 0,
        focusOffset: 0,
        isBackward: false,
    })

    const handleKeyCommand = (command: DraftEditorCommand) => {
        const newState = RichUtils.handleKeyCommand(editorState, command)
        // console.log(`handleKeyCommandDefault: ${command}`)
        if (newState) {
            // console.log(`NewState => handleKeyComman: ${command}`)
            setEditorState(newState)
            return 'handled'
        } else {
            return 'not-handled'
        }
    }

    const handleKeyBindingFn = (e: React.KeyboardEvent) => {
        // console.log('keyBindingFn Key: ', e.key)
        if (e.key === 'Tab') {
            // const tabCharactor = '_𝘴𝘱𝘢𝘤𝘦_𝘤𝘩𝘢𝘳𝘢𝘤𝘵𝘰𝘳_'
            const tabCharactor = '    '
            const newContentState = Modifier.replaceText(
                editorState.getCurrentContent(),
                editorState.getSelection(),
                tabCharactor
            )
            setEditorState(
                EditorState.push(
                    editorState,
                    newContentState,
                    'insert-characters'
                )
            )

            return 'Tab'
        }
        return getDefaultKeyBinding(e)
    }

    const handleChanges = (state: EditorState) => {
        setEditorState(state)
        const select = state.getSelection()

        setSelectState({
            offset: select.getAnchorOffset(),
            focusOffset: select.getFocusOffset(),
            isBackward: select.getIsBackward(),
        })
    }

    const setSelection = (offset: number, focusOffet: number) => {
        const selectionState = editorState.getSelection()
        const newSelection = selectionState.merge({
            anchorOffset: offset,
            focusOffset: focusOffet,
        })

        const newEditorState = EditorState.forceSelection(
            editorState,
            newSelection
        )
        setEditorState(newEditorState)
    }

    return (
        <div className="App">
            <p>
                <span>
                    #selection offset: {selecState.offset} focusOffset:{' '}
                    {selecState.focusOffset} isBackward:{' '}
                    {selecState.isBackward ? 'true' : 'false'}
                </span>
            </p>
            <h3 style={{ marginLeft: '1rem' }}>editor</h3>
            <div className="editor">
                <Editor
                    editorState={editorState}
                    onChange={handleChanges}
                    handleKeyCommand={handleKeyCommand}
                    keyBindingFn={handleKeyBindingFn}
                />
            </div>
            <h3 style={{ marginLeft: '1rem' }}>PainText</h3>
            <pre className="editor">
                {editorState.getCurrentContent().getPlainText()}
            </pre>
            <pre className="editor">
                {JSON.stringify(
                    convertToRaw(editorState.getCurrentContent()),
                    null,
                    4
                )}
            </pre>
        </div>
    )
}

export default App
