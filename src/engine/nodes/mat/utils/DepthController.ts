import {Constructor} from '../../../../types/GlobalTypes';
import {Material} from 'three/src/materials/Material';
import {TypedMatNode} from '../_Base';
import {BaseController} from './_BaseController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {BaseNodeType} from '../../_Base';
import {BaseParamType} from '../../../params/_Base';
export function DepthParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param defines if the objects using this material will be rendered in the depth buffer. This can often help transparent objects */
		depthWrite = ParamConfig.BOOLEAN(1, {
			cook: false,
			callback: (node: BaseNodeType, param: BaseParamType) => {
				DepthController.update(node as DepthMapMatNode);
			},
		});
		/** @param toggle depth test */
		depthTest = ParamConfig.BOOLEAN(1, {
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
	abstract createMaterial(): Material;
}

export class DepthController extends BaseController {
	constructor(protected node: DepthMapMatNode) {
		super(node);
	}

	async update() {
		this.node.material.depthWrite = this.node.pv.depthWrite;
		this.node.material.depthTest = this.node.pv.depthTest;
	}
	static async update(node: DepthMapMatNode) {
		node.depth_controller.update();
	}
}
