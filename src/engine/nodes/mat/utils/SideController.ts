import {BaseController} from './_BaseController';

import {FrontSide} from 'three/src/constants';
import {DoubleSide} from 'three/src/constants';
import {BackSide} from 'three/src/constants';
import {Material} from 'three/src/materials/Material';
import {TypedMatNode} from '../_Base';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
export function SideParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		double_sided = ParamConfig.BOOLEAN(0);
		front = ParamConfig.BOOLEAN(1, {visible_if: {double_sided: false}});
	};
}

class SidedMaterial extends Material {
	side!: number;
}
class SideParamsConfig extends SideParamConfig(NodeParamsConfig) {}
class SideMatNode extends TypedMatNode<SidedMaterial, SideParamsConfig> {
	create_material() {
		return new SidedMaterial();
	}
}

export class SideController extends BaseController {
	// add_params() {
	// 	this.node.add_param(ParamType.BOOLEAN, 'double_sided', 0);
	// 	this.node.add_param(ParamType.BOOLEAN, 'front', 1, {visible_if: {double_sided: false}});
	// }

	static update(node: SideMatNode) {
		const prev = node.material.side;
		const single_side = node.pv.front ? FrontSide : BackSide;
		node.material.side = node.pv.double_sided ? DoubleSide : single_side;
		if (prev != node.material.side) {
			node.material.needsUpdate = true;
		}
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
