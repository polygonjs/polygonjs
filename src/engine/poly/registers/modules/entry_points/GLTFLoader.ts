import {GLTFLoader} from '../../../../../modules/three/examples/jsm/loaders/GLTFLoader';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const GLTFLoaderModule: BaseModule<ModuleName.GLTFLoader> = {
	moduleName: ModuleName.GLTFLoader,
	module: GLTFLoader,
};
export {GLTFLoader, GLTFLoaderModule};
