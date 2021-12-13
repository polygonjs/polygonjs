import {OBJLoader} from '../../../../../modules/three/examples/jsm/loaders/OBJLoader';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const OBJLoaderModule: BaseModule<ModuleName.OBJLoader> = {
	moduleName: ModuleName.OBJLoader,
	module: OBJLoader,
};
export {OBJLoader, OBJLoaderModule};
