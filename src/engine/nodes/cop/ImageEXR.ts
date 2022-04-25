/**
 * Imports an EXR image file.
 *
 * @remarks
 * Performance tip: If possible, try to set min filter to LinearFilter in order to avoid the generation of mipmaps.
 * [https://discourse.threejs.org/t/threejs-app-performance-point-click-game/18491](https://discourse.threejs.org/t/threejs-app-performance-point-click-game/18491)
 */

import {copImageNodeFactoryFactory} from './utils/image/_BaseImage';
import {EXRTextureLoader} from '../../../core/loader/texture/EXR';
import {BaseNodeType} from '../_Base';
import {ImageExtension} from '../../../core/FileTypeController';
import {CopTypeImage} from '../../poly/registers/nodes/types/Cop';

export class ImageEXRCopNode extends copImageNodeFactoryFactory({
	type: CopTypeImage.IMAGE_EXR,
	defaultUrl: EXRTextureLoader.PARAM_ENV_DEFAULT,
	browseExtensions: [ImageExtension.EXR],
	getLoader: (url: string, node: BaseNodeType) => new EXRTextureLoader(url, node),
}) {}
