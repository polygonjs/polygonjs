import {LDrawLoader} from '../../../../../modules/three/examples/jsm/loaders/LDrawLoader';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const LDrawLoaderModule: BaseModule<ModuleName.LDrawLoader> = {
	moduleName: ModuleName.LDrawLoader,
	module: LDrawLoader,
};
export {LDrawLoader, LDrawLoaderModule};
