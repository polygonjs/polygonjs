import {PLYLoader} from '../../../../../modules/three/examples/jsm/loaders/PLYLoader';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const PLYLoaderModule: BaseModule<ModuleName.PLYLoader> = {
	moduleName: ModuleName.PLYLoader,
	module: PLYLoader,
};
export {PLYLoader, PLYLoaderModule};
