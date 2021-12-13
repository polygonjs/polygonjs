import {TTFLoader} from '../../../../../modules/three/examples/jsm/loaders/TTFLoader';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const TTFLoaderModule: BaseModule<ModuleName.TTFLoader> = {
	moduleName: ModuleName.TTFLoader,
	module: TTFLoader,
};
export {TTFLoader, TTFLoaderModule};
