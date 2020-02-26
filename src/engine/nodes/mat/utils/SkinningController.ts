import {BaseController} from './_BaseController';
import {Material} from 'three/src/materials/Material';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {TypedMatNode} from '../_Base';
export function SkinningParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		skinning = ParamConfig.BOOLEAN(0);
	};
}

class SkinnedMaterial extends Material {
	skinning!: boolean;
}
class SkinningParamsConfig extends SkinningParamConfig(NodeParamsConfig) {}
class SkinningMatNode extends TypedMatNode<SkinnedMaterial, SkinningParamsConfig> {
	create_material() {
		return new SkinnedMaterial();
	}
}

export class SkinningController extends BaseController {
	// add_params() {
	// 	this.node.add_param(ParamType.BOOLEAN, 'skinning', 0);
	// }

	static update(node: SkinningMatNode) {
		node.material.skinning = node.pv.skinning;
	}

	// update() {
	// 	this.node.material.skinning = this.node.params.boolean('skinning');
	// }
}
