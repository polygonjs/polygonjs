import {Constructor} from '../../../../types/GlobalTypes';
import {Material} from 'three/src/materials/Material';
import {TypedMatNode} from '../_Base';
import {BaseController} from './_BaseController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {BaseNodeType} from '../../_Base';
import {BaseParamType} from '../../../params/_Base';
import {DoubleSide, BackSide, FrontSide} from 'three/src/constants';
import {NoBlending, NormalBlending, AdditiveBlending, SubtractiveBlending, MultiplyBlending} from 'three/src/constants';
import {isBooleanTrue} from '../../../../core/BooleanValue';
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
		front = ParamConfig.BOOLEAN(1, {visibleIf: {doubleSided: false}, separatorAfter: true});
		/** @param defines if the objects using this material will be rendered in the color buffer. Setting it to false can have those objects occlude the ones behind */
		colorWrite = ParamConfig.BOOLEAN(1, {
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
		/** @param activate polygon offset */
		polygonOffset = ParamConfig.BOOLEAN(false, {separatorBefore: true});
		polygonOffsetFactor = ParamConfig.INTEGER(0, {range: [0, 1000], visibleIf: {polygonOffset: 1}});
		polygonOffsetUnits = ParamConfig.INTEGER(0, {range: [0, 1000], visibleIf: {polygonOffset: 1}});
	};
}

class AdvancedCommonParamsConfig extends AdvancedCommonParamConfig(NodeParamsConfig) {}
interface Controllers {
	advancedCommon: AdvancedCommonController;
}
abstract class AdvancedCommonMapMatNode extends TypedMatNode<Material, AdvancedCommonParamsConfig> {
	controllers!: Controllers;
	abstract createMaterial(): Material;
}

export class AdvancedCommonController extends BaseController {
	constructor(protected node: AdvancedCommonMapMatNode) {
		super(node);
	}

	initializeNode() {}

	async update() {
		const single_side = isBooleanTrue(this.node.pv.front) ? FrontSide : BackSide;
		const new_side = isBooleanTrue(this.node.pv.doubleSided) ? DoubleSide : single_side;
		const pv = this.node.pv;
		const mat = this.node.material;
		if (new_side != mat.side) {
			mat.side = new_side;
			mat.needsUpdate = true;
		}

		mat.colorWrite = pv.colorWrite;
		mat.depthWrite = pv.depthWrite;
		mat.depthTest = pv.depthTest;
		mat.blending = pv.blending;
		mat.premultipliedAlpha = pv.premultipliedAlpha;
		mat.polygonOffset = pv.polygonOffset;
		if (mat.polygonOffset) {
			mat.polygonOffsetFactor = pv.polygonOffsetFactor;
			mat.polygonOffsetUnits = pv.polygonOffsetUnits;
			mat.needsUpdate = true;
		}
	}
	static async update(node: AdvancedCommonMapMatNode) {
		node.controllers.advancedCommon.update();
	}
}
