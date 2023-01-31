/**
 * Imports an  image file.
 *
 * @remarks
 * Performance tip: If possible, try to set min filter to LinearFilter in order to avoid the generation of mipmaps.
 * [https://discourse.threejs.org/t/threejs-app-performance-point-click-game/18491](https://discourse.threejs.org/t/threejs-app-performance-point-click-game/18491)
 */
import {copImageNodeFactoryFactory} from './utils/image/_BaseImage';
import {ImageDefaultTextureLoader} from '../../../core/loader/texture/ImageDefault';
import {BaseNodeType} from '../_Base';
import {CopTypeImage} from '../../poly/registers/nodes/types/Cop';
import {EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT} from '../../../core/loader/FileExtensionRegister';
import {NodeContext} from '../../poly/NodeContext';
export class ImageCopNode extends copImageNodeFactoryFactory({
	type: CopTypeImage.IMAGE,
	defaultUrl: ImageDefaultTextureLoader.PARAM_DEFAULT,
	extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.COP][CopTypeImage.IMAGE],
	getLoader: (url: string, node: BaseNodeType) => new ImageDefaultTextureLoader(url, node),
}) {}
