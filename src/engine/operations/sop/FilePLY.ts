import {BufferGeometry} from 'three';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {PLYLoaderHandler} from '../../../core/loader/geometry/PLY';
import {sanitizeUrl} from '../../../core/UrlHelper';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {BaseFileSopOperation, BaseFileSopParams} from './utils/File/_BaseFileOperation';

export class FilePLYSopOperation extends BaseFileSopOperation<BufferGeometry> {
	static override readonly DEFAULT_PARAMS: BaseFileSopParams = {
		url: sanitizeUrl(`${ASSETS_ROOT}/models/dolphins_be.ply`),
		matrixAutoUpdate: false,
	};
	static override type(): Readonly<SopTypeFile.FILE_PLY> {
		return SopTypeFile.FILE_PLY;
	}

	protected _createGeoLoaderHandler(params: BaseFileSopParams) {
		return new PLYLoaderHandler(params.url, this._node);
	}
}
