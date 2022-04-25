import {Object3D} from 'three';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {OBJLoaderHandler} from '../../../core/loader/geometry/OBJ';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {BaseFileSopOperation, BaseFileSopParams} from './utils/File/_BaseFileOperation';

export class FileOBJSopOperation extends BaseFileSopOperation<Object3D> {
	static override readonly DEFAULT_PARAMS: BaseFileSopParams = {
		url: `${ASSETS_ROOT}/models/dolphin.obj`,
		matrixAutoUpdate: false,
	};
	static override type(): Readonly<SopTypeFile.FILE_OBJ> {
		return SopTypeFile.FILE_OBJ;
	}

	protected _createGeoLoaderHandler(params: BaseFileSopParams) {
		return new OBJLoaderHandler(params.url, this._node);
	}
}
