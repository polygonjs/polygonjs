import {RGBELoader} from '../../../../../modules/three/examples/jsm/loaders/RGBELoader';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const RGBELoaderModule: BaseModule<ModuleName.RGBELoader> = {
	moduleName: ModuleName.RGBELoader,
	module: RGBELoader,
};
export {RGBELoader, RGBELoaderModule};
