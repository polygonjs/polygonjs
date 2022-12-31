import {Constructor} from '../../../../types/GlobalTypes';
import {BaseController} from './_BaseController';
import {TypedMatNode} from '../_Base';
import {Material} from 'three';
import {ShaderMaterial} from 'three';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../core/BooleanValue';

export interface WireframeShaderMaterialControllers {
	wireframeShader: WireframeShaderMaterialController;
}

export function WireframeShaderMaterialParamsConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on to set material to wireframe */
		wireframe = ParamConfig.BOOLEAN(0);
		/** @param wireframe line width */
		wireframeLinewidth = ParamConfig.FLOAT(1, {
			range: [0, 5],
			rangeLocked: [true, false],
			visibleIf: {wireframe: 1},
		});
	};
}

class WireframeParamsConfig extends WireframeShaderMaterialParamsConfig(NodeParamsConfig) {}
class WireframedMatNode extends TypedMatNode<Material, WireframeParamsConfig> {
	async material() {
		const container = await this.compute();
		return container.material() as Material | undefined;
	}
	controllers!: WireframeShaderMaterialControllers;
}

export class WireframeShaderMaterialController extends BaseController {
	constructor(protected override node: WireframedMatNode) {
		super(node);
	}
	static async update(node: WireframedMatNode) {
		const material = await node.material();
		if (!material) {
			return;
		}
		node.controllers.wireframeShader.updateMaterial(material);
	}
	override updateMaterial(material: Material) {
		const pv = this.node.pv;

		const shaderMaterial = material as ShaderMaterial;
		if (shaderMaterial.wireframe != null) {
			shaderMaterial.wireframe = isBooleanTrue(pv.wireframe);
			shaderMaterial.wireframeLinewidth = pv.wireframeLinewidth;
			shaderMaterial.needsUpdate = true;
		}
	}
}
