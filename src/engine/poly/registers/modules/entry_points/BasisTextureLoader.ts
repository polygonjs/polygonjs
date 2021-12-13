import {BasisTextureLoader} from '../../../../../modules/three/examples/jsm/loaders/BasisTextureLoader';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const BasisTextureLoaderModule: BaseModule<ModuleName.BasisTextureLoader> = {
	moduleName: ModuleName.BasisTextureLoader,
	module: BasisTextureLoader,
};
export {BasisTextureLoader, BasisTextureLoaderModule};
