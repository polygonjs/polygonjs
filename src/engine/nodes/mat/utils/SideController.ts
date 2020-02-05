import {BaseController} from './_BaseController';

import {FrontSide} from 'three/src/constants';
import {DoubleSide} from 'three/src/constants';
import {BackSide} from 'three/src/constants';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {TypedMatNode} from '../_Base';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
export function SideParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		double_sided = ParamConfig.BOOLEAN(0);
		front = ParamConfig.BOOLEAN(1, {visible_if: {double_sided: false}});
	};
}
class SideParamsConfig extends SideParamConfig(NodeParamsConfig) {}
class SideMatNode extends TypedMatNode<MeshBasicMaterial, SideParamsConfig> {
	create_material() {
		return new MeshBasicMaterial({});
	}
}

export class SideController extends BaseController {
	// add_params() {
	// 	this.node.add_param(ParamType.BOOLEAN, 'double_sided', 0);
	// 	this.node.add_param(ParamType.BOOLEAN, 'front', 1, {visible_if: {double_sided: false}});
	// }

	static update(node: SideMatNode) {
		node.material.side = node.pv.double_sided ? DoubleSide : node.pv.param_front ? FrontSide : BackSide;
	}

	// update() {
	// 	this.material.side = this._param_double_sided ? DoubleSide : this._param_front ? FrontSide : BackSide;
	// }

	// get _param_front() {
	// 	return this.node.params.boolean('front');
	// }
	// get _param_double_sided() {
	// 	return this.node.params.boolean('double_sided');
	// }
}
