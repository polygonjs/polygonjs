import {BaseController} from './_BaseController';

import {FrontSide} from 'three/src/constants';
import {DoubleSide} from 'three/src/constants';
import {BackSide} from 'three/src/constants';
import {Material} from 'three/src/materials/Material';
import {TypedMatNode} from '../_Base';

import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
export function SideParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param defines if the material is double sided or not */
		doubleSided = ParamConfig.BOOLEAN(0);
		/** @param if the material is not double sided, it can be front sided, or back sided */
		front = ParamConfig.BOOLEAN(1, {visibleIf: {doubleSided: false}});
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
	constructor(protected node: SideMatNode) {
		super(node);
	}
	static update(node: SideMatNode) {
		const single_side = node.pv.front ? FrontSide : BackSide;
		const new_side = node.pv.doubleSided ? DoubleSide : single_side;
		if (new_side != node.material.side) {
			node.material.side = new_side;
			node.material.needsUpdate = true;
		}
	}
}
