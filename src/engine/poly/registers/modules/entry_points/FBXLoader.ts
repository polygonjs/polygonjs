import {FBXLoader} from '../../../../../modules/three/examples/jsm/loaders/FBXLoader';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const FBXLoaderModule: BaseModule<ModuleName.FBXLoader> = {
	moduleName: ModuleName.FBXLoader,
	module: FBXLoader,
};
export {FBXLoader, FBXLoaderModule};
