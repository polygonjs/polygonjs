import {Object3D} from 'three';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {JSONLoaderHandler} from '../../../core/loader/geometry/JSON';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {BaseFileSopOperation, BaseFileSopParams} from './utils/File/_BaseFileOperation';

export class FileJSONSopOperation extends BaseFileSopOperation<Object3D> {
	static override readonly DEFAULT_PARAMS: BaseFileSopParams = {
		url: `${ASSETS_ROOT}/models/wolf.json`,
		matrixAutoUpdate: false,
	};
	static override type(): Readonly<SopTypeFile.FILE_JSON> {
		return SopTypeFile.FILE_JSON;
	}

	protected _createGeoLoaderHandler(params: BaseFileSopParams) {
		return new JSONLoaderHandler(params.url, this._node);
	}
}
