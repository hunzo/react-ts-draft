import {
    AtomicBlockUtils,
    convertToRaw,
    DraftEditorCommand,
    EditorState,
    getDefaultKeyBinding,
    Modifier,
    RichUtils,
    Editor,
} from 'draft-js'
import React, { ChangeEvent, useCallback, useRef, useState } from 'react'
import './App.css'
import { useEditor } from './editorContext'
import { handleBlockRenderer } from './MediaRenderer'
import HtmlModal from './HtmlModal'

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
    width?: number
    alignment?: string
}

const App: React.FC = () => {
    const { editorState, setEditorState } = useEditor()
    const [images, setImages] = useState<Images[]>([])
    const editor = useRef<Editor>(null)

    const focusEditor = useCallback(() => {
        if (editor.current) {
            console.log('in Focus')
            editor.current.focus()
        }
    }, [editor])

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
            // const tabCharactor = '\t'
            const newContentState = Modifier.replaceText(
                editorState.getCurrentContent(),
                editorState.getSelection(),
                tabCharactor
            )
            setEditorState(
                EditorState.push(
                    editorState,
                    newContentState,
                    'change-inline-style'
                )
            )
            return 'Tab'
        }
        return getDefaultKeyBinding(e)
    }

    const handleChanges = (state: EditorState) => {
        setEditorState(state)
        const select = state.getSelection()

        // console.log(state.getCurrentContent().getBlockMap())
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
                width: 450,
                alignment: 'center',
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
    const handleAddLink = () => {
        const selection = editorState.getSelection()
        const link = prompt(
            'please insert image link (ex. https://www.google.co.th)'
        )
        if (!link) {
            setEditorState(RichUtils.toggleLink(editorState, selection, null))
            return
        }
        const contentState = editorState.getCurrentContent()
        const contentStateWithEntity = contentState.createEntity(
            'link',
            'MUTABLE',
            {
                url: link,
            }
        )
        const newEditorState = EditorState.push(
            editorState,
            contentStateWithEntity,
            'apply-entity'
        )
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
        setEditorState(
            RichUtils.toggleLink(newEditorState, selection, entityKey)
        )
    }

    const handleRemoveLink = () => {
        const selection = editorState.getSelection()
        if (!selection.isCollapsed()) {
            setEditorState(RichUtils.toggleLink(editorState, selection, null))
        }
    }

    // const setSelection = (offset: number, focusOffet: number) => {
    //     const selectionState = editorState.getSelection()
    //     const newSelection = selectionState.merge({
    //         anchorOffset: offset,
    //         focusOffset: focusOffet,
    //     })

    //     const newEditorState = EditorState.forceSelection(
    //         editorState,
    //         newSelection
    //     )
    //     setEditorState(newEditorState)
    // }

    return (
        <div className="App">
            <p style={{ marginLeft: '1rem' }}>
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
            <button
                disabled={editorState.getSelection().isCollapsed()}
                style={{ marginLeft: '.3rem' }}
                onMouseDown={(e) => {
                    e.preventDefault()
                    handleAddLink()
                }}
            >
                add link
            </button>
            <button
                disabled={editorState.getSelection().isCollapsed()}
                style={{ marginLeft: '.3rem' }}
                onMouseDown={(e) => {
                    e.preventDefault()
                    handleRemoveLink()
                }}
            >
                remove link
            </button>{' '}
            <HtmlModal />
            <div style={{marginTop: "1rem"}}>
                {images.map((i, idx) => (
                    <p
                        style={{
                            margin: '0',
                            marginLeft: '1rem',
                            padding: '0',
                        }}
                        key={idx}
                    >
                        file_name: {i.fileName} file_size: {i.fileSize}{' '}
                        file_type: {i.fileType}
                    </p>
                ))}
            </div>
            <div className="editor" onClick={focusEditor}>
                <Editor
                    ref={editor}
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
                    convertToRaw(editorState.getCurrentContent()).entityMap,
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
