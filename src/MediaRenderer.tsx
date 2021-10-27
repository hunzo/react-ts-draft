import { ContentBlock } from 'draft-js'
import { MediaComponent } from './MediaComponent'

export const handleBlockRenderer = (contentBlock: ContentBlock) => {
    const type = contentBlock.getType()
    if (type === 'atomic') {
        return {
            component: MediaComponent,
            editable: false,
        }
    }
}
