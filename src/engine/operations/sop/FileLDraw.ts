// import {Group} from 'three';
// import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
// import {LDrawLoaderHandler} from '../../../core/loader/geometry/LDraw';
// import {BaseFileSopOperation, BaseFileSopParams} from './utils/File/_BaseFileOperation';

// export class FileLDrawSopOperation extends BaseFileSopOperation<Group> {
// 	static override readonly DEFAULT_PARAMS: BaseFileSopParams = {
// 		url: `${ASSETS_ROOT}/models/resources/threedscans.com/eagle.glb`,
// 		matrixAutoUpdate: false,
// 	};
// 	static override type(): Readonly<'fileLDraw'> {
// 		return 'fileLDraw';
// 	}

// 	protected _createGeoLoaderHandler(params: BaseFileSopParams) {
// 		return new LDrawLoaderHandler(params.url, this.scene(), this._node);
// 	}
// }
