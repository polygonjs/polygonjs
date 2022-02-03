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
import {ThreeToGl} from '../../../../core/ThreeToGl';

export function PCSSParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param if on, the material will blur shadows cast on this object. Note that you should adjust the near parameter of the light shadow to get the result visible */
		shadowPCSS = ParamConfig.BOOLEAN(0, {
			callback: (node: BaseNodeType) => {
				PCSSController.PARAM_CALLBACK_setRecompileRequired(node as PCSSMapMatNode);
			},
			separatorBefore: true,
		});
		/** @param shadowPCSSFilterSize PCSS Shadow filter size */
		shadowPCSSFilterSize = ParamConfig.FLOAT(1, {
			visibleIf: {shadowPCSS: 1},
			range: [0, 10],
			rangeLocked: [true, false],
		});
	};
}

class PCSSParamsConfig extends PCSSParamConfig(NodeParamsConfig) {}
interface Controllers {
	PCSS: PCSSController;
}
abstract class PCSSMapMatNode extends TypedMatNode<Material, PCSSParamsConfig> {
	controllers!: Controllers;
	abstract override createMaterial(): Material;
}

export class PCSSController extends BaseController {
	constructor(protected override node: PCSSMapMatNode) {
		super(node);
	}

	initializeNode() {}

	static filterFragmentShader(node: PCSSMapMatNode, fragmentShader: string) {
		// removed since PCSS refactor in GLSL
		// #define NUM_SAMPLES ${ThreeToGl.integer(node.pv.shadowPCSSSamplesCount)}
		const PCSSWithDefines = `
#define PCSS_FILTER_SIZE ${ThreeToGl.float(node.pv.shadowPCSSFilterSize)}
${PCSS}
`;

		let shadowParsFragmentModified = SHADOW_MAP_PARS_FRAGMENT;
		shadowParsFragmentModified = shadowParsFragmentModified.replace(
			'#ifdef USE_SHADOWMAP',
			`#ifdef USE_SHADOWMAP
${PCSSWithDefines}
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

	override async update() {
		const matNode = (<unknown>this.node) as BaseBuilderMatNodeType;
		if (!matNode.assemblerController) {
			return;
		}
		const callbackName = 'PCSS';
		if (isBooleanTrue(this.node.pv.shadowPCSS)) {
			matNode
				.assemblerController()
				?.addFilterFragmentShaderCallback(callbackName, (fragmentShader: string) =>
					PCSSController.filterFragmentShader(this.node, fragmentShader)
				);
		} else {
			matNode.assemblerController()?.removeFilterFragmentShaderCallback(callbackName);
		}
	}

	static async update(node: PCSSMapMatNode) {
		node.controllers.PCSS.update();
	}
	static PARAM_CALLBACK_setRecompileRequired(node: PCSSMapMatNode) {
		node.controllers.PCSS.update();
	}
}
