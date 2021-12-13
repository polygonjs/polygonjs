import {DRACOLoader} from '../../../../../modules/three/examples/jsm/loaders/DRACOLoader';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const DRACOLoaderModule: BaseModule<ModuleName.DRACOLoader> = {
	moduleName: ModuleName.DRACOLoader,
	module: DRACOLoader,
};
export {DRACOLoader, DRACOLoaderModule};
