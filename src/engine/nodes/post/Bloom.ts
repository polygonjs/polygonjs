/**
 * Adds an Unreal Bloom effect.
 *
 *
 */
import {SelectionController} from './utils/SelectionController';
import {Vector2} from 'three';
import {TypedPostNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	BlendFunction,
	SelectiveBloomEffect,
	BloomEffect,
	EffectPass,
	KernelSize,
	BloomEffectOptions,
} from 'postprocessing';
import {KERNEL_SIZES, KERNEL_SIZE_MENU_OPTIONS} from '../../../core/post/KernelSize';
import {BLEND_FUNCTION_MENU_OPTIONS} from './../../../core/post/BlendFunction';
import {isBooleanTrue} from '../../../core/Type';
class BloomPostParamsConfig extends NodeParamsConfig {
	/** @param defines if this node applies a bloom to the whole scene or just a selection. Note that for now, it is necessary to reload your scene when toggling this parameter */
	useObjectMask = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
	/** @param object mask of the objects that will be used for the bloom */
	objectsMask = ParamConfig.STRING('*bloomed*', {
		...PostParamOptions,
		objectMask: true,
		visibleIf: {useObjectMask: 1},
	});
	/** @param updates the cached objects found by objectMask  */
	refreshObjects = ParamConfig.BUTTON(null, {
		...PostParamOptions,
		visibleIf: {useObjectMask: 1},
	});
	/** @param effect strength */
	strength = ParamConfig.FLOAT(1.5, {
		range: [0, 3],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param effect threshold */
	threshold = ParamConfig.FLOAT(1, {
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
	kernelSize = ParamConfig.INTEGER(KernelSize.LARGE, {
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
	/** @param opacity */
	opacity = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param render mode */
	blendFunction = ParamConfig.INTEGER(BlendFunction.SCREEN, {
		...PostParamOptions,
		...BLEND_FUNCTION_MENU_OPTIONS,
	});

	/** @param bloom only */
	// bloomOnly = ParamConfig.BOOLEAN(0, {
	// 	...PostParamOptions,
	// });
}
const ParamsConfig = new BloomPostParamsConfig();
export class BloomPostNode extends TypedPostNode<EffectPass, BloomPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'bloom';
	}

	private _rendererSize = new Vector2();
	override createPass(context: TypedPostNodeContext) {
		context.renderer.getSize(this._rendererSize);
		const bloomEffectOptions: BloomEffectOptions = {
			blendFunction: BlendFunction.SCREEN,
			kernelSize: KERNEL_SIZES[this.pv.kernelSize],
			luminanceThreshold: this.pv.threshold,
			luminanceSmoothing: this.pv.luminanceSmoothing,
			resolutionScale: this.pv.resolutionScale,
			// height: 480,
		};
		const bloomEffect = isBooleanTrue(this.pv.useObjectMask)
			? new SelectiveBloomEffect(context.scene, context.camera, bloomEffectOptions)
			: new BloomEffect(bloomEffectOptions);
		const pass = new EffectPass(context.camera, bloomEffect);
		this.updatePass(pass);
		return pass;
	}
	override updatePass(pass: EffectPass) {
		const effect = (pass as any).effects[0] as BloomEffect;
		effect.blendMode.opacity.value = this.pv.opacity;
		effect.blendMode.blendFunction = this.pv.blendFunction;

		effect.intensity = this.pv.strength;
		effect.luminanceMaterial.threshold = this.pv.threshold;
		effect.luminanceMaterial.smoothing = this.pv.luminanceSmoothing;
		(effect.blurPass.blurMaterial as any).kernelSize = KERNEL_SIZES[this.pv.kernelSize];
		effect.blurPass.resolution.scale = this.pv.resolutionScale;
		effect.blurPass.scale = this.pv.scale;
		this._setSelectedObjects(effect);
	}
	private __selectionController: SelectionController | undefined;
	private _selectionController() {
		return (this.__selectionController = this.__selectionController || new SelectionController());
	}
	private _setSelectedObjects(effect: SelectiveBloomEffect | BloomEffect) {
		if (effect instanceof SelectiveBloomEffect && isBooleanTrue(this.pv.useObjectMask)) {
			this._selectionController().updateSelection(this.scene(), this.pv.objectsMask, effect.selection);
		}
	}
}
