import {SVGLoader} from '../../../../../modules/three/examples/jsm/loaders/SVGLoader';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const SVGLoaderModule: BaseModule<ModuleName.SVGLoader> = {
	moduleName: ModuleName.SVGLoader,
	module: SVGLoader,
};
export {SVGLoader, SVGLoaderModule};
