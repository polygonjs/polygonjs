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
		front = ParamConfig.BOOLEAN(1, {visibleIf: {doubleSided: false}});
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
		/** @param blending */
		blending = ParamConfig.INTEGER(NormalBlending, {
			menu: {
				entries: BLENDING_VALUE_NAMES.map((name) => {
					return {name: name, value: (BLENDING_VALUES as any)[name]};
				}),
			},
		});
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
		const mat = this.node.material;
		if (new_side != mat.side) {
			mat.side = new_side;
			mat.needsUpdate = true;
		}

		this.node.material.colorWrite = this.node.pv.colorWrite;
		this.node.material.depthWrite = this.node.pv.depthWrite;
		this.node.material.depthTest = this.node.pv.depthTest;
		this.node.material.blending = this.node.pv.blending;
	}
	static async update(node: AdvancedCommonMapMatNode) {
		node.controllers.advancedCommon.update();
	}
}
