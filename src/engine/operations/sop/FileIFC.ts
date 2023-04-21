import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {IFCLoaderHandler} from '../../../core/loader/geometry/IFC';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {BaseFileSopOperation, BaseFileSopParams} from './utils/File/_BaseFileOperation';
import {sanitizeUrl} from '../../../core/UrlHelper';
import {Object3D} from 'three';
// import type {IFCModel} from 'web-ifc-three/IFC/components/IFCModel';
type IFCModel = Object3D;
interface FileIFCSopParams extends DefaultOperationParams {
	url: string;
	matrixAutoUpdate: boolean;
}

export class FileIFCSopOperation extends BaseFileSopOperation<IFCModel> {
	static override readonly DEFAULT_PARAMS: FileIFCSopParams = {
		url: sanitizeUrl(`${ASSETS_ROOT}/models/resources/ifc/basic.ifc`),
		matrixAutoUpdate: false,
	};
	static override type(): Readonly<SopTypeFile.FILE_IFC> {
		return SopTypeFile.FILE_IFC;
	}

	protected _createGeoLoaderHandler(params: BaseFileSopParams) {
		return new IFCLoaderHandler(params.url, this._node);
	}
	protected override async _load(loader: IFCLoaderHandler, params: FileIFCSopParams) {
		if (this._node) {
			return await loader.load({
				node: this._node,
			});
		}
	}
}
