/**
 * Imports an HDR image file.
 *
 * @remarks
 * Performance tip: If possible, try to set min filter to LinearFilter in order to avoid the generation of mipmaps.
 * [https://discourse.threejs.org/t/threejs-app-performance-point-click-game/18491](https://discourse.threejs.org/t/threejs-app-performance-point-click-game/18491)
 */

import {copImageNodeFactoryFactory} from './utils/image/_BaseImage';
import {HDRTextureLoader} from '../../../core/loader/texture/HDR';
import {BaseNodeType} from '../_Base';
import {CopTypeImage} from '../../poly/registers/nodes/types/Cop';
import {EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT} from '../../../core/loader/FileExtensionRegister';
import {NodeContext} from '../../poly/NodeContext';

export class ImageHDRCopNode extends copImageNodeFactoryFactory({
	type: CopTypeImage.IMAGE_HDR,
	defaultUrl: HDRTextureLoader.PARAM_ENV_DEFAULT,
	extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.COP][CopTypeImage.IMAGE_HDR],
	getLoader: (url: string, node: BaseNodeType) => new HDRTextureLoader(url, node),
}) {}
