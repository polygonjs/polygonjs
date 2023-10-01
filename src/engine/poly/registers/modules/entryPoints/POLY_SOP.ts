import {onPolySopModuleRegister} from '../../../../nodes/sop/utils/poly/createPolySopNode';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const POLY_SOPModule: BaseModule<ModuleName.POLY_SOP> = {
	moduleName: ModuleName.POLY_SOP,
	onRegister: onPolySopModuleRegister,
};
export {POLY_SOPModule};
