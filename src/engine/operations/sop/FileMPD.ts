import {Group} from 'three';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {MPDLoaderHandler} from '../../../core/loader/geometry/MPD';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {BaseFileSopOperation, BaseFileSopParams} from './utils/File/_BaseFileOperation';

export class FileMPDSopOperation extends BaseFileSopOperation<Group> {
	static override readonly DEFAULT_PARAMS: BaseFileSopParams = {
		url: `${ASSETS_ROOT}/models/ldraw/officialLibrary/models/car.ldr_Packed.mpd`,
		matrixAutoUpdate: false,
	};
	static override type(): Readonly<SopTypeFile.FILE_MPD> {
		return SopTypeFile.FILE_MPD;
	}

	protected _createGeoLoaderHandler(params: BaseFileSopParams) {
		return new MPDLoaderHandler(params.url, this._node);
	}
}
