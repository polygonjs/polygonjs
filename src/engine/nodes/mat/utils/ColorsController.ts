import {BaseController} from './_BaseController';
import {TypedMatNode} from '../_Base';
import {Material} from 'three/src/materials/Material';
import {Color} from 'three/src/math/Color';

import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';

export function ColorParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param material color */
		color = ParamConfig.COLOR([1, 1, 1]);
		/** @param defines if the color attribute on the geometry is used */
		useVertexColors = ParamConfig.BOOLEAN(0);
		/** @param sets the material to transparent */
		transparent = ParamConfig.BOOLEAN(0);
		/** @param sets the material opacity */
		opacity = ParamConfig.FLOAT(1);
		/** @param sets the min alpha below which the material is invisible */
		alphaTest = ParamConfig.FLOAT(0);
		/** @param toggle on if you have a fog in the scene and the material should be affected by it */
		useFog = ParamConfig.BOOLEAN(0);
	};
}

class ColoredMaterial extends Material {
	public color!: Color;
	vertexColors!: boolean;
	transparent!: boolean;
	depthTest!: boolean;
	alphaTest!: number;
	fog!: boolean;
}
class ColorParamsConfig extends ColorParamConfig(NodeParamsConfig) {}
class ColoredMatNode extends TypedMatNode<ColoredMaterial, ColorParamsConfig> {
	create_material() {
		return new ColoredMaterial();
	}
}

export class ColorsController extends BaseController {
	constructor(protected node: ColoredMatNode) {
		super(node);
	}
	static update(node: ColoredMatNode) {
		const material = node.material;
		const pv = node.pv;

		material.color.copy(pv.color);
		const newVertexColor = pv.useVertexColors; // ? VertexColors : NoColors;
		if (newVertexColor != material.vertexColors) {
			material.vertexColors = newVertexColor;
			material.needsUpdate = true;
		}

		material.opacity = pv.opacity;
		material.transparent = pv.transparent || pv.opacity < 1;
		material.depthTest = true;
		material.alphaTest = pv.alphaTest;
		material.fog = pv.useFog;
	}
}
