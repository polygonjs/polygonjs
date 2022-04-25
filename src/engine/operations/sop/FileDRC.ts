import {BufferGeometry} from 'three';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {DRCLoaderHandler} from '../../../core/loader/geometry/DRC';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {BaseFileSopOperation, BaseFileSopParams} from './utils/File/_BaseFileOperation';

export class FileDRCSopOperation extends BaseFileSopOperation<BufferGeometry> {
	static override readonly DEFAULT_PARAMS: BaseFileSopParams = {
		url: `${ASSETS_ROOT}/models/bunny.drc`,
		matrixAutoUpdate: false,
	};
	static override type(): Readonly<SopTypeFile.FILE_DRC> {
		return SopTypeFile.FILE_DRC;
	}

	protected _createGeoLoaderHandler(params: BaseFileSopParams) {
		return new DRCLoaderHandler(params.url, this._node);
	}
}
