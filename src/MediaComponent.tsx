import {
    CompositeDecorator,
    ContentBlock,
    ContentState,
    DraftDecoratorComponentProps,
    EditorState,
} from 'draft-js'
import React, { CSSProperties, useState } from 'react'
import { useEditor } from './editorContext'

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
    entityKey
}) => {
    const { url } = contentState.getEntity(entityKey || "").getData()
    return (
        <a style={{ color: 'red', textDecoration: 'underline', cursor: "pointer" }} href={url}>
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

    // console.log(hover)
    return (
        <>
            <span
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <p style={styled}>
                    <img src={base64Contents} width={imgSize} alt={info} />
                </p>
                {hover ? (
                    <div>
                        <button onClick={() => setAlignment('left')}>L</button>
                        <button onClick={() => setAlignment('center')}>
                            C
                        </button>
                        <button onClick={() => setAlignment('right')}>R</button>
                        <button
                            onClick={() => {
                                setSize(imgSize - 25)
                            }}
                        >
                            -
                        </button>
                        <button
                            onClick={() => {
                                setSize(imgSize + 25)
                            }}
                        >
                            +
                        </button>
                        <p>
                            #info width: {imgSize} alignment: {alignment}
                        </p>
                    </div>
                ) : null}
            </span>
        </>
    )
}

export const LinkDecorator = new CompositeDecorator([
    {
        component: LinkComponent,
        strategy: (contentBlock, callBack, contentState) => {
            contentBlock.findEntityRanges((character) => {
                const entityKey = character.getEntity()
                return entityKey !== null && contentState.getEntity(entityKey).getType() === "link"
            }, callBack)
        },
    },
])

