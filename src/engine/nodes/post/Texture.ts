/**
 * Applies an image
 *
 *
 */
import {Vector2} from 'three';
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BlendFunction, EffectPass, TextureEffect} from 'postprocessing';
import {BLEND_FUNCTIONS, BLEND_FUNCTION_MENU_OPTIONS} from '../../../core/post/BlendFunction';
import {NodeContext} from '../../poly/NodeContext';
class TexturePostParamsConfig extends NodeParamsConfig {
	/** @param texture */
	texture = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.COP,
		},
		dependentOnFoundNode: false,
		...PostParamOptions,
	});
	/** @param opacity */
	opacity = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param render mode */
	blendFunction = ParamConfig.INTEGER(BLEND_FUNCTIONS.indexOf(BlendFunction.COLOR_DODGE), {
		...PostParamOptions,
		...BLEND_FUNCTION_MENU_OPTIONS,
	});
}
const ParamsConfig = new TexturePostParamsConfig();
export class TexturePostNode extends TypedPostProcessNode<EffectPass, TexturePostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'texture';
	}

	private _rendererSize = new Vector2();
	protected override _createPass(context: TypedPostNodeContext) {
		context.renderer.getSize(this._rendererSize);
		const effect = new TextureEffect({});
		const pass = new EffectPass(context.camera, effect);
		this.updatePass(pass);
		return pass;
	}
	override async updatePass(pass: EffectPass) {
		const effect = (pass as any).effects[0] as TextureEffect;
		effect.blendMode.opacity.value = this.pv.opacity;
		effect.blendMode.blendFunction = BLEND_FUNCTIONS[this.pv.blendFunction];

		const textureNode = this.pv.texture.nodeWithContext(NodeContext.COP, this.states?.error);
		if (textureNode) {
			const container = await textureNode.compute();
			effect.texture = container.coreContent();
		}
	}
}
