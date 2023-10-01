import {onQuadModuleRegister} from '../../../../../core/geometry/modules/quad/QuadModule';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const QUADModule: BaseModule<ModuleName.QUAD> = {
	moduleName: ModuleName.QUAD,
	// module: cadModule,
	onRegister: onQuadModuleRegister,
};
export {QUADModule};
