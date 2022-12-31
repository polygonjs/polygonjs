import {Constructor} from '../../../../types/GlobalTypes';
import {Material} from 'three';
import {TypedMatNode} from '../_Base';
import {BaseController} from './_BaseController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {BaseNodeType} from '../../_Base';
import {BaseParamType} from '../../../params/_Base';
import {NoBlending, NormalBlending, AdditiveBlending, SubtractiveBlending, MultiplyBlending} from 'three';
import {ParamsValueAccessorType} from '../../utils/params/ParamsValueAccessor';
import {updateMaterialSideWithShadow} from './helpers/MaterialSideHelper';
const BLENDING_VALUES = {
	NoBlending,
	NormalBlending,
	AdditiveBlending,
	SubtractiveBlending,
	MultiplyBlending,
};
const BLENDING_VALUE_NAMES = Object.keys(BLENDING_VALUES);

export function AdvancedCommonParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param defines if the material is double sided or not */
		doubleSided = ParamConfig.BOOLEAN(0);
		/** @param if the material is not double sided, it can be front sided, or back sided */
		front = ParamConfig.BOOLEAN(1, {visibleIf: {doubleSided: false}});
		/** @param override the default shadowSide behavior */
		overrideShadowSide = ParamConfig.BOOLEAN(0);
		/** @param defines which side(s) are used when rendering shadows */
		shadowDoubleSided = ParamConfig.BOOLEAN(0, {visibleIf: {overrideShadowSide: true}});
		/** @param if the material is not double sided, it can be front sided, or back sided, when computing shadows */
		shadowFront = ParamConfig.BOOLEAN(1, {visibleIf: {overrideShadowSide: true, shadowDoubleSided: false}});
		/** @param defines if the objects using this material will be rendered in the color buffer. Setting it to false can have those objects occlude the ones behind */
		colorWrite = ParamConfig.BOOLEAN(1, {
			separatorBefore: true,
			cook: false,
			callback: (node: BaseNodeType, param: BaseParamType) => {
				AdvancedCommonController.update(node as AdvancedCommonMapMatNode);
			},
		});
		/** @param defines if the objects using this material will be rendered in the depth buffer. This can often help transparent objects */
		depthWrite = ParamConfig.BOOLEAN(1, {
			cook: false,
			callback: (node: BaseNodeType, param: BaseParamType) => {
				AdvancedCommonController.update(node as AdvancedCommonMapMatNode);
			},
		});
		/** @param toggle depth test */
		depthTest = ParamConfig.BOOLEAN(1, {
			cook: false,
			callback: (node: BaseNodeType, param: BaseParamType) => {
				AdvancedCommonController.update(node as AdvancedCommonMapMatNode);
			},
		});
		/** @param premultipliedAlpha */
		premultipliedAlpha = ParamConfig.BOOLEAN(false, {
			separatorAfter: true,
		});
		/** @param blending */
		blending = ParamConfig.INTEGER(NormalBlending, {
			menu: {
				entries: BLENDING_VALUE_NAMES.map((name) => {
					return {name: name, value: (BLENDING_VALUES as any)[name]};
				}),
			},
		});
		/** @param dithering, which can be useful when using postprocessing and banding appears on some objects */
		dithering = ParamConfig.BOOLEAN(0);
		/** @param activate polygon offset */
		polygonOffset = ParamConfig.BOOLEAN(false, {separatorBefore: true});
		polygonOffsetFactor = ParamConfig.INTEGER(0, {range: [0, 1000], visibleIf: {polygonOffset: 1}});
		polygonOffsetUnits = ParamConfig.INTEGER(0, {range: [0, 1000], visibleIf: {polygonOffset: 1}});
	};
}

class AdvancedCommonParamsConfig extends AdvancedCommonParamConfig(NodeParamsConfig) {}
export interface AdvancedCommonControllers {
	advancedCommon: AdvancedCommonController;
}
abstract class AdvancedCommonMapMatNode extends TypedMatNode<Material, AdvancedCommonParamsConfig> {
	controllers!: AdvancedCommonControllers;
	async material() {
		const container = await this.compute();
		return container.material() as Material | undefined;
	}
}

export class AdvancedCommonController extends BaseController {
	constructor(protected override node: AdvancedCommonMapMatNode) {
		super(node);
	}

	static async update(node: AdvancedCommonMapMatNode) {
		const material = await node.material();
		if (!material) {
			return;
		}
		node.controllers.advancedCommon.updateMaterial(material);
	}
	override updateMaterial(material: Material) {
		const pv = this.node.pv;
		this._updateSides(material, pv);

		material.colorWrite = pv.colorWrite;
		material.depthWrite = pv.depthWrite;
		material.depthTest = pv.depthTest;
		material.blending = pv.blending;
		material.premultipliedAlpha = pv.premultipliedAlpha;
		material.dithering = pv.dithering;
		material.polygonOffset = pv.polygonOffset;
		if (material.polygonOffset) {
			material.polygonOffsetFactor = pv.polygonOffsetFactor;
			material.polygonOffsetUnits = pv.polygonOffsetUnits;
			material.needsUpdate = true;
		}
	}

	private _updateSides(mat: Material, pv: ParamsValueAccessorType<AdvancedCommonParamsConfig>) {
		updateMaterialSideWithShadow(mat, pv);
	}
}
