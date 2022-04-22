import {Constructor} from '../../../../types/GlobalTypes';
import {BaseController} from './_BaseController';
import {TypedMatNode} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../core/BooleanValue';
import {ColorConversion} from '../../../../core/Color';
import {MeshBasicMaterial} from 'three';
import {ShadowMaterial} from 'three';

export function ColorParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param material color */
		color = ParamConfig.COLOR([1, 1, 1], {
			conversion: ColorConversion.SRGB_TO_LINEAR,
		});
		/** @param defines if the color attribute on the geometry is used */
		useVertexColors = ParamConfig.BOOLEAN(0, {separatorAfter: true});
		/** @param sets the material to transparent */
		transparent = ParamConfig.BOOLEAN(0);
		/** @param sets the material opacity */
		opacity = ParamConfig.FLOAT(1);
		/** @param sets the min alpha below which the material is invisible */
		alphaTest = ParamConfig.FLOAT(0);
	};
}

type ColoredMaterial = MeshBasicMaterial | ShadowMaterial;
// class ColoredMaterial extends MeshB {
// 	public color!: Color;
// 	// vertexColors!: boolean;
// 	// transparent!: boolean;
// 	// depthTest!: boolean;
// 	// alphaTest!: number;
// }
class ColorParamsConfig extends ColorParamConfig(NodeParamsConfig) {}
class ColoredMatNode extends TypedMatNode<ColoredMaterial, ColorParamsConfig> {
	override createMaterial(): ColoredMaterial {
		return new MeshBasicMaterial();
	}
}

export class ColorsController extends BaseController {
	constructor(protected override node: ColoredMatNode) {
		super(node);
	}
	static update(node: ColoredMatNode) {
		const material = node.material;
		const pv = node.pv;

		material.color.copy(pv.color);
		const newVertexColor = isBooleanTrue(pv.useVertexColors);
		if (newVertexColor != material.vertexColors) {
			material.vertexColors = newVertexColor;
			material.needsUpdate = true;
		}

		material.opacity = pv.opacity;
		material.transparent = pv.transparent;
		material.alphaTest = pv.alphaTest;
	}
}
