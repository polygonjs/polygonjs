import {KTX2Loader} from '../../../../../modules/three/examples/jsm/loaders/KTX2Loader';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const KTX2LoaderModule: BaseModule<ModuleName.KTX2Loader> = {
	moduleName: ModuleName.KTX2Loader,
	module: KTX2Loader,
};
export {KTX2Loader, KTX2LoaderModule};
