import {onCadModuleRegister} from '../../../../../core/geometry/modules/cad/CadModule';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const CADModule: BaseModule<ModuleName.CAD> = {
	moduleName: ModuleName.CAD,
	// module: cadModule,
	onRegister: onCadModuleRegister,
};
export {CADModule};
