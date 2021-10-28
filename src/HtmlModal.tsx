import { convertToHTML } from 'draft-convert'
import { convertToRaw } from 'draft-js'
import React, { useState } from 'react'
import Modal from 'react-modal'
import { useEditor } from './editorContext'

const HtmlModal: React.FC = () => {
    const [modal, setModal] = useState(false)
    const { editorState } = useEditor()
    const html = convertToHTML({
        entityToHTML: (entity) => {
            if (entity.type === 'image') {
                // console.log(entity.data)

                // const alignment = entity.data.alignment || 'none' || 'undefined'
                // const textAlign = alignment === 'none' ? 'center' : alignment

                console.log(entity.data.base64Contents)

                return `
                    <p style="${entity.data.alignment}">
                        <img
                            src="${entity.data.base64Contents}"
                            width="${300}"
                            height="${entity.data.height}"
                            alt="http://www.google.co.th"
                        />
                    </p>
                `
            }
        },
        blockToHTML: (block) => {

            if (block.type === "unstyled") {
                return <div />
            }
        }
    })(editorState.getCurrentContent())

    return (
        <>
            <button
                onClick={() => setModal(true)}
                style={{ marginLeft: '.3rem' }}
            >
                html preview
            </button>
            <Modal isOpen={modal}>
                <button onClick={() => setModal(false)}>close</button>
                <div
                    dangerouslySetInnerHTML={{
                        __html: html,
                    }}
                />
                <pre>
                    {JSON.stringify(
                        convertToHTML(editorState.getCurrentContent()),
                        null,
                        2
                    )}
                </pre>
                <pre>
                    {JSON.stringify(
                        convertToRaw(editorState.getCurrentContent()),
                        null,
                        2
                    )}
                </pre>
            </Modal>
        </>
    )
}

export default HtmlModal
