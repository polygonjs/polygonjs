import {Constructor} from '../../../../types/GlobalTypes';
import {Material} from 'three/src/materials/Material';
import {TypedMatNode} from '../_Base';
import {BaseController} from './_BaseController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {BaseNodeType} from '../../_Base';
import {isBooleanTrue} from '../../../../core/BooleanValue';
import {BaseBuilderMatNodeType} from '../_BaseBuilder';
import PCSS from './shadows/pcss/glsl/PCSS.glsl';
import PCSSGetShadow from './shadows/pcss/glsl/PCSSGetShadow.glsl';
import SHADOW_MAP_PARS_FRAGMENT from 'three/src/renderers/shaders/ShaderChunk/shadowmap_pars_fragment.glsl';

export function PCSSParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param if on, the material will blur shadows cast on this object. Note that you should adjust the near parameter of the light shadow to get the result visible */
		shadowPCSS = ParamConfig.BOOLEAN(0, {
			callback: (node: BaseNodeType) => {
				PCSSController.PARAM_CALLBACK_setRecompileRequired(node as PCSSMapMatNode);
			},
			separatorBefore: true,
		});
	};
}

class PCSSParamsConfig extends PCSSParamConfig(NodeParamsConfig) {}
interface Controllers {
	PCSS: PCSSController;
}
abstract class PCSSMapMatNode extends TypedMatNode<Material, PCSSParamsConfig> {
	controllers!: Controllers;
	abstract createMaterial(): Material;
}

export class PCSSController extends BaseController {
	constructor(protected node: PCSSMapMatNode) {
		super(node);
	}

	initializeNode() {}

	static filterFragmentShader(fragmentShader: string) {
		let shadowParsFragmentModified = SHADOW_MAP_PARS_FRAGMENT;
		shadowParsFragmentModified = shadowParsFragmentModified.replace(
			'#ifdef USE_SHADOWMAP',
			`#ifdef USE_SHADOWMAP
${PCSS}
				`
		);

		shadowParsFragmentModified = shadowParsFragmentModified.replace(
			'#if defined( SHADOWMAP_TYPE_PCF )',
			`
				${PCSSGetShadow}
				#if defined( SHADOWMAP_TYPE_PCF )`
		);

		fragmentShader = fragmentShader.replace('#include <shadowmap_pars_fragment>', shadowParsFragmentModified);

		return fragmentShader;
	}

	async update() {
		const matNode = (<unknown>this.node) as BaseBuilderMatNodeType;
		if (!matNode.assemblerController) {
			return;
		}
		const callbackName = 'PCSS';
		if (isBooleanTrue(this.node.pv.shadowPCSS)) {
			matNode.assemblerController.addFilterFragmentShaderCallback(
				callbackName,
				PCSSController.filterFragmentShader
			);
		} else {
			matNode.assemblerController.removeFilterFragmentShaderCallback(callbackName);
		}
	}

	static async update(node: PCSSMapMatNode) {
		node.controllers.PCSS.update();
	}
	static PARAM_CALLBACK_setRecompileRequired(node: PCSSMapMatNode) {
		node.controllers.PCSS.update();
	}
}
