import {onPBRModuleRegister} from '../../../../../core/render/PBR/PBR';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const PBRModule: BaseModule<ModuleName.PBR> = {
	moduleName: ModuleName.PBR,
	// module: cadModule,
	onRegister: onPBRModuleRegister,
};
export {PBRModule};
