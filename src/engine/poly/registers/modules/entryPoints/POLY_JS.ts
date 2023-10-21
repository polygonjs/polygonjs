import {onPolyJsModuleRegister} from '../../../../nodes/js/utils/poly/createPolyJsNode';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const POLY_JSModule: BaseModule<ModuleName.POLY_JS> = {
	moduleName: ModuleName.POLY_JS,
	onRegister: onPolyJsModuleRegister,
};
export {POLY_JSModule};
