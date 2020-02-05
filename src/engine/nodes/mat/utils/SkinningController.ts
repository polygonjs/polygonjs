import {BaseController} from './_BaseController';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {TypedMatNode} from '../_Base';
export function SkinningParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		skinning = ParamConfig.BOOLEAN(0);
	};
}
class SkinningParamsConfig extends SkinningParamConfig(NodeParamsConfig) {}
class SkinningMatNode extends TypedMatNode<MeshBasicMaterial, SkinningParamsConfig> {
	create_material() {
		return new MeshBasicMaterial({});
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
