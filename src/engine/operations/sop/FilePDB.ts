import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {PDBLoaderHandler} from '../../../core/loader/geometry/PDB';
import {PDB} from 'three/examples/jsm/loaders/PDBLoader';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {BaseFileSopOperation, BaseFileSopParams} from './utils/File/_BaseFileOperation';
import {sanitizeUrl} from '../../../core/UrlHelper';

export class FilePDBSopOperation extends BaseFileSopOperation<PDB> {
	static override readonly DEFAULT_PARAMS: BaseFileSopParams = {
		url: sanitizeUrl(`${ASSETS_ROOT}/models/ethanol.pdb`),
		matrixAutoUpdate: false,
	};
	static override type(): Readonly<SopTypeFile.FILE_PDB> {
		return SopTypeFile.FILE_PDB;
	}

	protected _createGeoLoaderHandler(params: BaseFileSopParams) {
		return new PDBLoaderHandler(params.url, this._node);
	}
}
