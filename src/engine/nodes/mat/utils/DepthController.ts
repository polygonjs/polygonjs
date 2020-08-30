import {Material} from 'three/src/materials/Material';
import {TypedMatNode} from '../_Base';
import {BaseController} from './_BaseController';

import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {BaseNodeType} from '../../_Base';
import {BaseParamType} from '../../../params/_Base';
export function DepthParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		depth_write = ParamConfig.BOOLEAN(1, {
			cook: false,
			callback: (node: BaseNodeType, param: BaseParamType) => {
				DepthController.update(node as DepthMapMatNode);
			},
		});
		depth_test = ParamConfig.BOOLEAN(1, {
			cook: false,
			callback: (node: BaseNodeType, param: BaseParamType) => {
				DepthController.update(node as DepthMapMatNode);
			},
		});
	};
}

class DepthParamsConfig extends DepthParamConfig(NodeParamsConfig) {}

abstract class DepthMapMatNode extends TypedMatNode<Material, DepthParamsConfig> {
	depth_controller!: DepthController;
	abstract create_material(): Material;
}

export class DepthController extends BaseController {
	constructor(protected node: DepthMapMatNode) {
		super(node);
	}

	async update() {
		this.node.material.depthWrite = this.node.pv.depth_write;
		this.node.material.depthTest = this.node.pv.depth_test;
	}
	static async update(node: DepthMapMatNode) {
		node.depth_controller.update();
	}
}
