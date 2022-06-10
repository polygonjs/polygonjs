/**
 * Adds an Unreal Bloom effect.
 *
 *
 */
import {Vector2} from 'three';
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BlendFunction, BloomEffect, EffectPass, KernelSize} from 'postprocessing';
import {KERNEL_SIZES, KERNEL_SIZE_MENU_OPTIONS} from '../../../core/post/KernelSize';
class BloomPostParamsConfig extends NodeParamsConfig {
	/** @param effect strength */
	strength = ParamConfig.FLOAT(1.5, {
		range: [0, 3],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param effect threshold */
	threshold = ParamConfig.FLOAT(0.4, {
		...PostParamOptions,
	});
	/** @param effect scale */
	scale = ParamConfig.FLOAT(1, {
		range: [0, 3],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param effect radius */
	// radius = ParamConfig.FLOAT(1, {
	// 	...PostParamOptions,
	// });
	/** @param kernel size */
	kernelSize = ParamConfig.INTEGER(KernelSize.VERY_SMALL, {
		...PostParamOptions,
		...KERNEL_SIZE_MENU_OPTIONS,
	});
	/** @param effect luminance Smoothing */
	luminanceSmoothing = ParamConfig.FLOAT(0.1, {
		...PostParamOptions,
	});
	/** @param resolutionScale */
	resolutionScale = ParamConfig.FLOAT(0.5, {
		...PostParamOptions,
	});

	/** @param bloom only */
	// bloomOnly = ParamConfig.BOOLEAN(0, {
	// 	...PostParamOptions,
	// });
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
		console.log(KERNEL_SIZES[this.pv.kernelSize]);
		const bloomEffect = new BloomEffect({
			blendFunction: BlendFunction.SCREEN,
			kernelSize: KERNEL_SIZES[this.pv.kernelSize],
			luminanceThreshold: this.pv.threshold,
			luminanceSmoothing: this.pv.luminanceSmoothing,
			resolutionScale: this.pv.resolutionScale,
			// height: 480,
		});
		const pass = new EffectPass(context.camera, bloomEffect);
		this.updatePass(pass);
		return pass;
	}
	override updatePass(pass: EffectPass) {
		const effect = (pass as any).effects[0] as BloomEffect;
		effect.intensity = this.pv.strength;
		effect.luminanceMaterial.threshold = this.pv.threshold;
		effect.luminanceMaterial.smoothing = this.pv.luminanceSmoothing;
		(effect.blurPass.blurMaterial as any).kernelSize = KERNEL_SIZES[this.pv.kernelSize];
		effect.blurPass.resolution.scale = this.pv.resolutionScale;
		effect.blurPass.scale = this.pv.scale;
		// effect.blurPass.resolution.height = 1024
		// pass.strength = this.pv.strength;
		// pass.radius = this.pv.radius;
		// pass.threshold = this.pv.threshold;
		// pass.bloomOnly = this.pv.bloomOnly;
	}
}
