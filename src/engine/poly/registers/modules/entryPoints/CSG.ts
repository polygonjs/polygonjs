import {onCsgModuleRegister} from '../../../../../core/geometry/modules/csg/CsgModule';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const CSGModule: BaseModule<ModuleName.CSG> = {
	moduleName: ModuleName.CSG,
	// module: cadModule,
	onRegister: onCsgModuleRegister,
};
export {CSGModule};
