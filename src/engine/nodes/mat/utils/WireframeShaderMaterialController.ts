import {Constructor} from '../../../../types/GlobalTypes';
import {BaseController} from './_BaseController';
import {TypedMatNode} from '../_Base';
import {Material} from 'three';
import {ShaderMaterial} from 'three';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../core/BooleanValue';

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
	createMaterial() {
		return new Material();
	}
}

export class WireframeShaderMaterialController extends BaseController {
	constructor(protected override node: WireframedMatNode) {
		super(node);
	}
	static update(node: WireframedMatNode) {
		const material = node.material;
		const pv = node.pv;

		const shaderMaterial = material as ShaderMaterial;
		if (shaderMaterial.wireframe != null) {
			shaderMaterial.wireframe = isBooleanTrue(pv.wireframe);
			shaderMaterial.wireframeLinewidth = pv.wireframeLinewidth;
			shaderMaterial.needsUpdate = true;
		}
	}
}
