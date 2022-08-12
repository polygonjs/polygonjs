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
import {ImageExtension} from '../../../core/FileTypeController';
import {CopTypeImage} from '../../poly/registers/nodes/types/Cop';

export class ImageCopNode extends copImageNodeFactoryFactory({
	type: CopTypeImage.IMAGE,
	defaultUrl: ImageDefaultTextureLoader.PARAM_DEFAULT,
	browseExtensions: [ImageExtension.PNG, ImageExtension.JPEG, ImageExtension.JPG, ImageExtension.WEBP],
	getLoader: (url: string, node: BaseNodeType) => new ImageDefaultTextureLoader(url, node),
}) {}
