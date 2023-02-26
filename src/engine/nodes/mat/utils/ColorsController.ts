import {Constructor, Number3} from '../../../../types/GlobalTypes';
import {BaseController, SetParamsTextureNodesRecord} from './_BaseController';
import {TypedMatNode} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../core/BooleanValue';
import {ColorConversion} from '../../../../core/Color';
import {Color, Material, MeshBasicMaterial, MeshStandardMaterial} from 'three';
import {ShadowMaterial} from 'three';

export function ColorParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param material color */
		color = ParamConfig.COLOR([1, 1, 1], {
			// conversion: ColorConversion.SRGB_TO_LINEAR,
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
export interface ColorsControllers {
	colors: ColorsController;
}
class ColoredMatNode extends TypedMatNode<ColoredMaterial, ColorParamsConfig> {
	controllers!: ColorsControllers;
	async material() {
		const container = await this.compute();
		return container.material() as ColoredMaterial | undefined;
	}
}
const _tmpColor = new Color();
const _tmpColorArray: Number3 = [0, 0, 0];
export class ColorsController extends BaseController {
	constructor(protected override node: ColoredMatNode) {
		super(node);
	}
	static async update(node: ColoredMatNode) {
		const container = await node.compute();
		const material = container.material();
		if (!isValidColoredMaterial(material)) {
			return;
		}
		node.controllers.colors.updateMaterial(material);
	}

	override updateMaterial(material: ColoredMaterial) {
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

	override setParamsFromMaterial(material: ColoredMaterial, record: SetParamsTextureNodesRecord) {
		const p = this.node.p;
		_tmpColor.copy(material.color).toArray(_tmpColorArray);
		p.color.set(_tmpColorArray);
		p.color.setConversion(ColorConversion.NONE);

		//
		p.useVertexColors.set(material.vertexColors);
		p.opacity.set(material.opacity);
		p.transparent.set(material.transparent);
		p.alphaTest.set(material.alphaTest);
	}
}
