import {
    CompositeDecorator,
    ContentBlock,
    ContentState,
    DraftDecoratorComponentProps,
    EditorState,
} from 'draft-js'
import React, { CSSProperties, useState } from 'react'
import { useEditor } from './editorContext'
import './image.css'

interface BlockComponentProps {
    contentState: ContentState
    block: ContentBlock
}

export const MediaComponent: React.FC<BlockComponentProps> = (
    props: BlockComponentProps
) => {
    const entity = props.contentState.getEntity(props.block.getEntityAt(0))
    let media = null

    switch (entity.getType()) {
        case 'image':
            media = <ImageComponent {...props} />
            break
        // ex. video, embended, link
        // case 'link':
        //     console.log('Link case')
        //     break
        default:
            media = null
            break
    }

    return media
}

export const LinkComponent: React.FC<DraftDecoratorComponentProps> = ({
    children,
    contentState,
    entityKey,
}) => {
    const { url } = contentState.getEntity(entityKey || '').getData()
    return (
        <a
            style={{
                color: 'red',
                textDecoration: 'underline',
                cursor: 'pointer',
            }}
            href={url}
        >
            {children}
        </a>
    )
}

export const ImageComponent: React.FC<BlockComponentProps> = ({
    contentState,
    block,
}) => {
    const { fileName, fileType, fileSize, base64Contents, width, alignment } =
        contentState.getEntity(block.getEntityAt(0)).getData()
    const info = `file_name: ${fileName} file_type: ${fileType} file_size: ${fileSize}`

    const { editorState, setEditorState } = useEditor()
    const [imgSize, setImgSize] = useState<number>(width)
    const [hover, setHover] = useState(false)
    const [imgAlingment, setImgAlignment] = useState(alignment)

    const setAlignment = (alignment: string) => {
        // set for state
        const entityKey = block.getEntityAt(0)
        contentState.mergeEntityData(entityKey, { alignment })
        // setEditorState(
        //     EditorState.forceSelection(editorState, editorState.getSelection())
        // )
        setEditorState(
            EditorState.push(editorState, contentState, 'change-block-data')
        )
        //set for renderer
        setImgAlignment(alignment)
    }

    const setSize = (size: number) => {
        //set for State
        const entityKey = block.getEntityAt(0)
        contentState.mergeEntityData(entityKey, { width: size })
        // setEditorState(
        //     EditorState.forceSelection(editorState, editorState.getSelection())
        // )
        setEditorState(
            EditorState.push(editorState, contentState, 'change-block-data')
        )
        //set for renderer
        setImgSize(size)
    }

    const styled: CSSProperties = {
        textAlign: imgAlingment,
    }

    return (
        <div
            className="box"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div style={styled}>
                <img
                    className="image"
                    src={base64Contents}
                    width={imgSize}
                    alt={info}
                />
            </div>
            {hover ? (
                <div className="wrap-editor">
                    <div className="img-editor">
                        <button
                            className="img-editor-btn"
                            onClick={() => setAlignment('left')}
                        >
                            L
                        </button>
                        <button
                            className="img-editor-btn"
                            onClick={() => setAlignment('center')}
                        >
                            C
                        </button>
                        <button
                            className="img-editor-btn"
                            onClick={() => setAlignment('right')}
                        >
                            R
                        </button>
                        <button
                            className="img-editor-btn"
                            onClick={() => setSize(imgSize + 10)}
                        >
                            +
                        </button>
                        <button
                            className="img-editor-btn"
                            onClick={() => setSize(imgSize - 10)}
                        >
                            -
                        </button>
                        <span className="img-info">
                            imgsize: {imgSize}px alignment: {alignment}
                        </span>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

export const LinkDecorator = new CompositeDecorator([
    {
        component: LinkComponent,
        strategy: (contentBlock, callBack, contentState) => {
            contentBlock.findEntityRanges((character) => {
                const entityKey = character.getEntity()
                return (
                    entityKey !== null &&
                    contentState.getEntity(entityKey).getType() === 'link'
                )
            }, callBack)
        },
    },
])
