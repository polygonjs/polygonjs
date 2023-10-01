import {onPolyOBJModuleRegister} from '../../../../nodes/obj/utils/poly/createPolyObjNode';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const POLY_OBJModule: BaseModule<ModuleName.POLY_OBJ> = {
	moduleName: ModuleName.POLY_OBJ,
	onRegister: onPolyOBJModuleRegister,
};
export {POLY_OBJModule};
