import {Constructor} from '../../../../types/GlobalTypes';
import {TypedObjNode} from '../_Base';
import {Object3D} from 'three';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {TesselationParamConfig} from '../../../../core/geometry/cad/utils/TesselationParamsConfig';

export function ObjTesselationFolderParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		CAD = ParamConfig.FOLDER();
	};
}
export function ObjTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends TesselationParamConfig(ObjTesselationFolderParamConfig(Base)) {};
}
class TesselationParamParamsConfig extends ObjTesselationParamConfig(NodeParamsConfig) {}
export class TesselationParamsObjNode extends TypedObjNode<Object3D, TesselationParamParamsConfig> {}
