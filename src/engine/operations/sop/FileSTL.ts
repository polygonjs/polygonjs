import {BufferGeometry} from 'three';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {STLLoaderHandler} from '../../../core/loader/geometry/STL';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {BaseFileSopOperation, BaseFileSopParams} from './utils/File/_BaseFileOperation';

export class FileSTLSopOperation extends BaseFileSopOperation<BufferGeometry> {
	static override readonly DEFAULT_PARAMS: BaseFileSopParams = {
		url: `${ASSETS_ROOT}/models/warrior.stl`,
		matrixAutoUpdate: false,
	};
	static override type(): Readonly<SopTypeFile.FILE_STL> {
		return SopTypeFile.FILE_STL;
	}

	protected _createGeoLoaderHandler(params: BaseFileSopParams) {
		return new STLLoaderHandler(params.url, this._node);
	}
}
