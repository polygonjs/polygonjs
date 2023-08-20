import type {Chunk} from 'three/examples/jsm/loaders/VOXLoader';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {VOXLoaderHandler} from '../../../core/loader/geometry/VOX';
import {sanitizeUrl} from '../../../core/UrlHelper';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {BaseFileSopOperation, BaseFileSopParams} from './utils/File/_BaseFileOperation';

export class FileVOXSopOperation extends BaseFileSopOperation<Chunk[]> {
	static override readonly DEFAULT_PARAMS: BaseFileSopParams = {
		url: sanitizeUrl(`${ASSETS_ROOT}/models/vox/monu10.vox`),
		matrixAutoUpdate: false,
	};
	static override type(): Readonly<SopTypeFile.FILE_VOX> {
		return SopTypeFile.FILE_VOX;
	}

	protected _createGeoLoaderHandler(params: BaseFileSopParams) {
		return new VOXLoaderHandler(params.url, this._node);
	}
}
