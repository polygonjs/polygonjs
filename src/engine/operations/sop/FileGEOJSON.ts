import {Group} from 'three';
import {GEOJSONLoaderHandler} from '../../../core/loader/geometry/GEOJSON';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {BaseFileSopOperation, BaseFileSopParams} from './utils/File/_BaseFileOperation';

export class FileGEOJSONSopOperation extends BaseFileSopOperation<Group> {
	static override readonly DEFAULT_PARAMS: BaseFileSopParams = {
		url: ``,
		matrixAutoUpdate: false,
	};
	static override type(): Readonly<SopTypeFile.FILE_GEOJSON> {
		return SopTypeFile.FILE_GEOJSON;
	}

	protected _createGeoLoaderHandler(params: BaseFileSopParams) {
		return new GEOJSONLoaderHandler(params.url, this._node);
	}
}
