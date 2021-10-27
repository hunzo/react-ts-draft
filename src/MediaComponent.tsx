import { ContentBlock, ContentState } from 'draft-js'
import React from 'react'

interface BlockComponentProps {
    contentState: ContentState
    block: ContentBlock
}

export const MediaComponent: React.FC<BlockComponentProps> = ({
    contentState,
    block,
}) => {
    const { fileName, fileType, fileSize, base64Contents } = contentState
        .getEntity(block.getEntityAt(0))
        .getData()
    const info = `file_name: ${fileName} file_type: ${fileType} file_size: ${fileSize}`
    console.log(contentState.getEntity(block.getEntityAt(0)).getData())
    return (
        <>
            <img src={base64Contents} width="300px" height="auto" alt={info} />
        </>
    )
}
