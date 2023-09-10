import {Constructor} from '../../../../types/GlobalTypes';
import {TypedObjNode} from '../_Base';
import {Object3D} from 'three';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {OBJCADTesselationParamConfig} from '../../../../core/geometry/modules/cad/utils/TesselationParamsConfig';
import {OBJCSGTesselationParamConfig} from '../../../../core/geometry/modules/csg/utils/TesselationParamsConfig';
import {OBJQUADTesselationParamConfig} from '../../../../core/geometry/modules/quad/utils/TesselationParamsConfig';
// import {OBJSDFTesselationParamConfig} from '../../../../core/geometry/modules/sdf/utils/TesselationParamsConfig';
import {OBJTetTesselationParamConfig} from '../../../../core/geometry/modules/tet/utils/TesselationParamsConfig';

export function ObjCADTesselationFolderParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		CAD = ParamConfig.FOLDER();
	};
}
export function ObjCSGTesselationFolderParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		CSG = ParamConfig.FOLDER();
	};
}
export function ObjQUADTesselationFolderParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		QUAD = ParamConfig.FOLDER();
	};
}
// export function ObjSDFTesselationFolderParamConfig<TBase extends Constructor>(Base: TBase) {
// 	return class Mixin extends Base {
// 		SDF = ParamConfig.FOLDER();
// 	};
// }
export function ObjTetTesselationFolderParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		TET = ParamConfig.FOLDER();
	};
}
export function ObjTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin //OBJSDFTesselationParamConfig(
		//ObjSDFTesselationFolderParamConfig(
		extends OBJTetTesselationParamConfig(
			ObjTetTesselationFolderParamConfig(
				OBJQUADTesselationParamConfig(
					ObjQUADTesselationFolderParamConfig(
						OBJCSGTesselationParamConfig(
							ObjCSGTesselationFolderParamConfig(
								OBJCADTesselationParamConfig(ObjCADTesselationFolderParamConfig(Base))
							)
						)
					)
					//		)
					//)
				)
			)
		) {};
}
class TesselationParamParamsConfig extends ObjTesselationParamConfig(NodeParamsConfig) {}
export class TesselationParamsObjNode extends TypedObjNode<Object3D, TesselationParamParamsConfig> {}
