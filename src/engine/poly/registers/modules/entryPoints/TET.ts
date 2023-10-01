import {onTetModuleRegister} from '../../../../../core/geometry/modules/tet/TetModule';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const TETModule: BaseModule<ModuleName.TET> = {
	moduleName: ModuleName.TET,
	// module: cadModule,
	onRegister: onTetModuleRegister,
};
export {TETModule};
