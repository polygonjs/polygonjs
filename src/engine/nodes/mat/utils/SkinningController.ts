import {Constructor} from '../../../../types/GlobalTypes';
import {BaseController} from './_BaseController';
import {Material} from 'three/src/materials/Material';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {TypedMatNode} from '../_Base';
import {isBooleanTrue} from '../../../../core/BooleanValue';
export function SkinningParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param activates skinning for objects animated via a skeleton */
		skinning = ParamConfig.BOOLEAN(0);
	};
}

class SkinnedMaterial extends Material {
	skinning!: boolean;
}
class SkinningParamsConfig extends SkinningParamConfig(NodeParamsConfig) {}
class SkinningMatNode extends TypedMatNode<SkinnedMaterial, SkinningParamsConfig> {
	createMaterial() {
		return new SkinnedMaterial();
	}
}

export class SkinningController extends BaseController {
	constructor(protected node: SkinningMatNode) {
		super(node);
	}
	static update(node: SkinningMatNode) {
		const new_skinning = isBooleanTrue(node.pv.skinning);
		if (new_skinning != node.material.skinning) {
			node.material.skinning = new_skinning;
			node.material.needsUpdate = true;
		}
	}
}
