/**
 * Creates an antialiasing pass
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BlendFunction, EffectPass, PredicationMode, SMAAEffect, TextureEffect} from 'postprocessing';
class AntialiasingPostParamsConfig extends NodeParamsConfig {
	/** @param opacity */
	opacity = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, true],
		...PostParamOptions,
	});
}
const ParamsConfig = new AntialiasingPostParamsConfig();
export class AntialiasingPostNode extends TypedPostProcessNode<EffectPass, AntialiasingPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'antialiasing';
	}

	override createPass(context: TypedPostNodeContext) {
		const smaaEffect = new SMAAEffect(
			{}
			// assets.get("smaa-search"),
			// assets.get("smaa-area"),
			// SMAAPreset.HIGH,
			// EdgeDetectionMode.COLOR
		);

		smaaEffect.edgeDetectionMaterial.edgeDetectionThreshold = 0.02;
		smaaEffect.edgeDetectionMaterial.predicationMode = PredicationMode.DEPTH;
		smaaEffect.edgeDetectionMaterial.predicationThreshold = 0.002;
		smaaEffect.edgeDetectionMaterial.predicationScale = 1.0;

		const edgesTextureEffect = new TextureEffect({
			blendFunction: BlendFunction.SKIP,
			texture: smaaEffect.edgesTexture,
		});

		const weightsTextureEffect = new TextureEffect({
			blendFunction: BlendFunction.SKIP,
			texture: smaaEffect.weightsTexture,
		});

		// const copyPass = new ShaderPass(new CopyMaterial());

		const pass = new EffectPass(context.camera, smaaEffect, edgesTextureEffect, weightsTextureEffect);
		this.updatePass(pass);
		return pass;
	}
	override updatePass(pass: EffectPass) {
		const effect = (pass as any).effects[0] as SMAAEffect;

		effect.blendMode.opacity.value = this.pv.opacity;
	}
}
