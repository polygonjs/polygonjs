import {STLLoader} from '../../../../../modules/three/examples/jsm/loaders/STLLoader';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const STLLoaderModule: BaseModule<ModuleName.STLLoader> = {
	moduleName: ModuleName.STLLoader,
	module: STLLoader,
};
export {STLLoader, STLLoaderModule};
