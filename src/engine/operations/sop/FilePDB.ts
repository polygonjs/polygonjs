import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {PDBLoaderHandler} from '../../../core/loader/geometry/PDB';
import {PDB} from '../../../modules/three/examples/jsm/loaders/PDBLoader';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {BaseFileSopOperation, BaseFileSopParams} from './utils/File/_BaseFileOperation';

export class FilePDBSopOperation extends BaseFileSopOperation<PDB> {
	static override readonly DEFAULT_PARAMS: BaseFileSopParams = {
		url: `${ASSETS_ROOT}/models/ethanol.pdb`,
		matrixAutoUpdate: false,
	};
	static override type(): Readonly<SopTypeFile.FILE_PDB> {
		return SopTypeFile.FILE_PDB;
	}

	protected _createGeoLoaderHandler(params: BaseFileSopParams) {
		return new PDBLoaderHandler(params.url, this._node);
	}
}
