/**
 * Adds an Unreal Bloom effect.
 *
 *
 */
import {Vector2} from 'three';
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BlendFunction, BloomEffect, EffectPass, KernelSize} from 'postprocessing';
class BloomPostParamsConfig extends NodeParamsConfig {
	/** @param effect strength */
	strength = ParamConfig.FLOAT(1.5, {
		range: [0, 3],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param effect radius */
	radius = ParamConfig.FLOAT(1, {
		...PostParamOptions,
	});
	/** @param effect threshold */
	threshold = ParamConfig.FLOAT(0, {
		...PostParamOptions,
	});
	/** @param bloom only */
	bloomOnly = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
}
const ParamsConfig = new BloomPostParamsConfig();
export class BloomPostNode extends TypedPostProcessNode<EffectPass, BloomPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'bloom';
	}

	private _rendererSize = new Vector2();
	protected override _createPass(context: TypedPostNodeContext) {
		context.renderer.getSize(this._rendererSize);
		const bloomEffect = new BloomEffect({
			blendFunction: BlendFunction.SCREEN,
			kernelSize: KernelSize.MEDIUM,
			luminanceThreshold: 0.4,
			luminanceSmoothing: 0.1,
			height: 480,
		});
		const pass = new EffectPass(context.camera, bloomEffect);
		this.updatePass(pass);
		return pass;
	}
	override updatePass(pass: EffectPass) {
		const effect = (pass as any).effects[0] as BloomEffect;
		effect.intensity = this.pv.strength;
		effect.luminanceMaterial.threshold = this.pv.threshold;
		effect.luminanceMaterial.smoothing = this.pv.radius;
		// pass.strength = this.pv.strength;
		// pass.radius = this.pv.radius;
		// pass.threshold = this.pv.threshold;
		// pass.bloomOnly = this.pv.bloomOnly;
	}
}
