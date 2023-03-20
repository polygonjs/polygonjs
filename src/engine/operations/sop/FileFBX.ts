import {Group} from 'three';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {FBXLoaderHandler} from '../../../core/loader/geometry/FBX';
import {sanitizeUrl} from '../../../core/UrlHelper';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {BaseFileSopOperation, BaseFileSopParams} from './utils/File/_BaseFileOperation';

export class FileFBXSopOperation extends BaseFileSopOperation<Group> {
	static override readonly DEFAULT_PARAMS: BaseFileSopParams = {
		url: sanitizeUrl(`${ASSETS_ROOT}/models/stanford-bunny.fbx`),
		matrixAutoUpdate: false,
	};
	static override type(): Readonly<SopTypeFile.FILE_FBX> {
		return SopTypeFile.FILE_FBX;
	}

	protected _createGeoLoaderHandler(params: BaseFileSopParams) {
		return new FBXLoaderHandler(params.url, this._node);
	}
}
