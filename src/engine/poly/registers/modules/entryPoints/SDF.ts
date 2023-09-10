import {onSDFModuleRegister} from '../../../../../core/geometry/modules/sdf/SDFModule';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const SDFModule: BaseModule<ModuleName.SDF> = {
	moduleName: ModuleName.SDF,
	// module: cadModule,
	onRegister: onSDFModuleRegister,
};
export {SDFModule};
