import {onPolyAnimModuleRegister} from '../../../../nodes/anim/utils/poly/createPolyAnimNode';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const POLY_ANIMModule: BaseModule<ModuleName.POLY_ANIM> = {
	moduleName: ModuleName.POLY_ANIM,
	onRegister: onPolyAnimModuleRegister,
};
export {POLY_ANIMModule};
