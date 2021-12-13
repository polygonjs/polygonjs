import {EXRLoader} from '../../../../../modules/three/examples/jsm/loaders/EXRLoader';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const EXRLoaderModule: BaseModule<ModuleName.EXRLoader> = {
	moduleName: ModuleName.EXRLoader,
	module: EXRLoader,
};
export {EXRLoader, EXRLoaderModule};
