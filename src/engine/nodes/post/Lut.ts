/**
 * applies a LUT
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {EffectPass, BlendFunction, LUT3DEffect} from 'postprocessing';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BLEND_FUNCTIONS, BLEND_FUNCTION_MENU_OPTIONS} from '../../../core/post/BlendFunction';
import {NodeContext} from '../../poly/NodeContext';
import {Texture} from 'three';
class LutPostParamsConfig extends NodeParamsConfig {
	/** @param texture */
	texture = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.COP,
		},
		dependentOnFoundNode: false,
		...PostParamOptions,
	});
	/** @param effect opacity */
	opacity = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param render mode */
	blendFunction = ParamConfig.INTEGER(BLEND_FUNCTIONS.indexOf(BlendFunction.NORMAL), {
		...PostParamOptions,
		...BLEND_FUNCTION_MENU_OPTIONS,
	});
}
const ParamsConfig = new LutPostParamsConfig();
export class LutPostNode extends TypedPostProcessNode<EffectPass, LutPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'lut';
	}

	protected override _createPass(context: TypedPostNodeContext) {
		// const texture = await this._fetchTexture();
		const passes: EffectPass[] = [];
		// if (texture) {
		// 	console.log(context.renderer.capabilities.isWebGL2, texture);
		const texture: Texture | any = null;
		const effect = context.renderer.capabilities.isWebGL2 ? new LUT3DEffect(texture) : new LUT3DEffect(null as any);

		const pass = new EffectPass(context.camera, effect);
		passes.push(pass);
		this.updatePass(pass);
		// }

		console.log(passes);
		return passes;
	}
	override async updatePass(pass: EffectPass) {
		const effect = (pass as any).effects[0] as LUT3DEffect;
		if (!effect) {
			return;
		}
		effect.blendMode.opacity.value = this.pv.opacity;
		effect.blendMode.blendFunction = BLEND_FUNCTIONS[this.pv.blendFunction];
		const texture = await this._fetchTexture();
		if (texture) {
			effect.lut = texture;
		}
	}
	private async _fetchTexture() {
		const textureNode = this.pv.texture.nodeWithContext(NodeContext.COP, this.states?.error);
		if (textureNode) {
			const container = await textureNode.compute();
			return container.coreContent();
		}
	}
}
