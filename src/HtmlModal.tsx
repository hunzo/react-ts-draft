import { convertToHTML } from 'draft-convert'
import React, { useState } from 'react'
import Modal from 'react-modal'
import { useEditor } from './editorContext'

const HtmlModal: React.FC = () => {
    const [modal, setModal] = useState(false)
    const { editorState } = useEditor()
    const html = convertToHTML({
        entityToHTML: (entity, text) => {
            if (entity.type === 'image') {
                const { alignment, width, alt, base64Contents } = entity.data
                return (
                    <p style={{ textAlign: alignment }}>
                        <img src={base64Contents} alt={alt} width={width} />
                    </p>
                )
            }
            if (entity.type === 'link') {
                const {url} = entity.data
                // console.log('convert link')
                return <a  rel="noreferrer" target="_blank"  href={url}>{text}</a>;
            }
        },
        blockToHTML: (block) => {
            if (block.type === 'unstyled') {
                return (
                    <p
                        style={{
                            margin: '1px 0 1px 0',
                            padding: '0',
                            whiteSpace: 'pre-wrap',
                        }}
                    />
                )
            }
        },
        
    })(editorState.getCurrentContent())

    return (
        <>
            <button
                onClick={() => setModal(true)}
                style={{ marginLeft: '.3rem' }}
            >
                html preview
            </button>
            <Modal isOpen={modal} ariaHideApp={false}>
                <button onClick={() => setModal(false)}>close</button>
                <p>
                    <strong>Generate HTML from RTF</strong>
                </p>
                <div
                    style={{ border: '1px solid #e1e1e1' }}
                    dangerouslySetInnerHTML={{
                        __html: html,
                    }}
                />
                <pre style={{ display: 'block', border: '1px solid #e1e1e1' }}>
                    {JSON.stringify(html, null, 2)}
                </pre>
            </Modal>
        </>
    )
}

export default HtmlModal
