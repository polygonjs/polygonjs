import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {GLTFLoaderHandler} from '../../../core/loader/geometry/GLTF';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {BaseFileSopOperation, BaseFileSopParams} from './utils/File/_BaseFileOperation';
import {GLTF} from '../../../modules/three/examples/jsm/loaders/GLTFLoader';
interface FileGLTFSopParams extends DefaultOperationParams {
	url: string;
	draco: boolean;
	matrixAutoUpdate: boolean;
}

export class FileGLTFSopOperation extends BaseFileSopOperation<GLTF> {
	static override readonly DEFAULT_PARAMS: FileGLTFSopParams = {
		url: `${ASSETS_ROOT}/models/resources/threedscans.com/eagle.glb`,
		draco: true,
		matrixAutoUpdate: false,
	};
	static override type(): Readonly<SopTypeFile.FILE_GLTF> {
		return SopTypeFile.FILE_GLTF;
	}

	protected _createGeoLoaderHandler(params: BaseFileSopParams) {
		return new GLTFLoaderHandler(params.url, this._node);
	}
	protected override async _load(loader: GLTFLoaderHandler, params: FileGLTFSopParams) {
		if (this._node) {
			return await loader.load({
				draco: params.draco,
				node: this._node,
			});
		}
	}
}
