import {Constructor} from '../../../../types/GlobalTypes';
import {BaseController} from './_BaseController';
import {TypedMatNode} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../core/BooleanValue';
import {ColorConversion} from '../../../../core/Color';
import {Material, MeshBasicMaterial, MeshStandardMaterial} from 'three';
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

export type ColoredMaterial = MeshBasicMaterial | ShadowMaterial | MeshStandardMaterial;
export function isValidColoredMaterial(material?: Material): material is ColoredMaterial {
	if (!material) {
		return false;
	}
	return (material as MeshBasicMaterial).color != null;
}
// class ColoredMaterial extends MeshB {
// 	public color!: Color;
// 	// vertexColors!: boolean;
// 	// transparent!: boolean;
// 	// depthTest!: boolean;
// 	// alphaTest!: number;
// }
class ColorParamsConfig extends ColorParamConfig(NodeParamsConfig) {}
interface ColorsControllers {
	colors: ColorsController;
}
class ColoredMatNode extends TypedMatNode<ColoredMaterial, ColorParamsConfig> {
	override createMaterial(): ColoredMaterial {
		return new MeshBasicMaterial();
	}
	controllers!: ColorsControllers;
}

export class ColorsController extends BaseController {
	constructor(protected override node: ColoredMatNode) {
		super(node);
	}
	static update(node: ColoredMatNode) {
		node.controllers.colors.update();
	}
	override update(): void {
		if (!this.node.material) {
			return;
		}
		this.updateMaterial(this.node.material);
	}
	updateMaterial(material: ColoredMaterial) {
		const pv = this.node.pv;
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
