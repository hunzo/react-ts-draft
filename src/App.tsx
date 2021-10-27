import {
    AtomicBlockUtils,
    convertToRaw,
    DraftEditorCommand,
    Editor,
    EditorState,
    getDefaultKeyBinding,
    Modifier,
    RichUtils,
} from 'draft-js'
import React, { ChangeEvent, useState } from 'react'
import './App.css'
import { useEditor } from './editorContext'
import { handleBlockRenderer } from './MediaRenderer'

interface selecTion {
    offset: number
    focusOffset: number
    isBackward: boolean
    blockKey: string
}

export interface Images {
    fileName: string
    fileSize: number
    fileType: string
    base64Contents: string
}

const App: React.FC = () => {
    const { editorState, setEditorState } = useEditor()
    const [images, setImages] = useState<Images[]>([])

    const [selecState, setSelectState] = useState<selecTion>({
        offset: 0,
        focusOffset: 0,
        isBackward: false,
        blockKey: '',
    })

    const handleKeyCommand = (command: DraftEditorCommand) => {
        const newState = RichUtils.handleKeyCommand(editorState, command)
        if (newState) {
            setEditorState(newState)
            return 'handled'
        } else {
            return 'not-handled'
        }
    }

    const handleKeyBindingFn = (e: React.KeyboardEvent) => {
        if (e.key === 'Tab') {
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
        
        console.log(
            state.getCurrentContent().getBlockMap()
        )
        setSelectState({
            offset: select.getAnchorOffset(),
            focusOffset: select.getFocusOffset(),
            isBackward: select.getIsBackward(),
            blockKey: select.getEndKey(),
        })
    }

    const handleInsertImage = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const reader = new FileReader()
        reader.onload = () => {
            const file = e.target.files![0]
            const image: Images = {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                base64Contents: reader.result as string,
            }
            const constentStateWithEntity = editorState
                .getCurrentContent()
                .createEntity('image', 'IMMUTABLE', image)

            setEditorState(
                AtomicBlockUtils.insertAtomicBlock(
                    EditorState.set(editorState, {
                        currentContent: constentStateWithEntity,
                    }),
                    constentStateWithEntity.getLastCreatedEntityKey(),
                    ' '
                )
            )
            setImages((previosImage) => [...previosImage, image])
        }
        reader.readAsDataURL(e.target.files[0])
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
                    blockKey: {selecState.blockKey}
                    {selecState.focusOffset} isBackward:{' '}
                    {selecState.isBackward ? 'true' : 'false'}
                </span>
            </p>

            <h3 style={{ marginLeft: '1rem' }}>editor</h3>
            <button
                style={{ marginLeft: '1rem' }}
                onClick={(e) => {
                    e.preventDefault()
                    document.getElementById('inputImage')?.click()
                }}
            >
                add image
            </button>
            <div className="editor">
                {images.map((i, idx) => (
                    <p style={{ margin: '0', padding: '0' }} key={idx}>
                        file_name: {i.fileName} file_size: {i.fileSize}{' '}
                        file_type: {i.fileType}
                    </p>
                ))}
            </div>

            <div className="editor">
                <Editor
                    editorState={editorState}
                    onChange={handleChanges}
                    handleKeyCommand={handleKeyCommand}
                    keyBindingFn={handleKeyBindingFn}
                    blockRendererFn={handleBlockRenderer}
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

            <input
                id="inputImage"
                style={{ display: 'none' }}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif"
                onChange={handleInsertImage}
            />
        </div>
    )
}

export default App
