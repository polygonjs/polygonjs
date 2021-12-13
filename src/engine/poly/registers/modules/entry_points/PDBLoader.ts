import {PDBLoader} from '../../../../../modules/three/examples/jsm/loaders/PDBLoader';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const PDBLoaderModule: BaseModule<ModuleName.PDBLoader> = {
	moduleName: ModuleName.PDBLoader,
	module: PDBLoader,
};
export {PDBLoader, PDBLoaderModule};
