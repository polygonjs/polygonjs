/**
 * Imports a KTX2 image file.
 *
 * @remarks
 * Performance tip: If possible, try to set min filter to LinearFilter in order to avoid the generation of mipmaps.
 * [https://discourse.threejs.org/t/threejs-app-performance-point-click-game/18491](https://discourse.threejs.org/t/threejs-app-performance-point-click-game/18491)
 */

import {copImageNodeFactoryFactory} from './utils/image/_BaseImage';
import {KTX2TextureLoader} from '../../../core/loader/texture/KTX2';
import {BaseNodeType} from '../_Base';
import {CopTypeImage} from '../../poly/registers/nodes/types/Cop';
import {EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT} from '../../../core/loader/FileExtensionRegister';
import {NodeContext} from '../../poly/NodeContext';

export class ImageKTX2CopNode extends copImageNodeFactoryFactory({
	type: CopTypeImage.IMAGE_KTX2,
	defaultUrl: KTX2TextureLoader.PARAM_ENV_DEFAULT,
	extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.COP][CopTypeImage.IMAGE_KTX2],
	getLoader: (url: string, node: BaseNodeType) => new KTX2TextureLoader(url, node),
}) {}
