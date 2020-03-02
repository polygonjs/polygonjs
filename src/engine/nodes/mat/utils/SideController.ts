import {BaseController} from './_BaseController';

import {FrontSide} from 'three/src/constants';
import {DoubleSide} from 'three/src/constants';
import {BackSide} from 'three/src/constants';
import {Material} from 'three/src/materials/Material';
import {TypedMatNode} from '../_Base';

import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
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
	static update(node: SideMatNode) {
		const single_side = node.pv.front ? FrontSide : BackSide;
		const new_side = node.pv.double_sided ? DoubleSide : single_side;
		if (new_side != node.material.side) {
			node.material.side = new_side;
			node.material.needsUpdate = true;
		}
	}
}
