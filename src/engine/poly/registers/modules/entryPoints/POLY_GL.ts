import {onPolyGlModuleRegister} from '../../../../nodes/gl/utils/poly/createPolyGlNode';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const POLY_GLModule: BaseModule<ModuleName.POLY_GL> = {
	moduleName: ModuleName.POLY_GL,
	onRegister: onPolyGlModuleRegister,
};
export {POLY_GLModule};
