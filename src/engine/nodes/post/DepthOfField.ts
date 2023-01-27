/**
 * Adds a depth of field effect
 *
 *
 */
import {TypedPostNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	BlendFunction,
	DepthEffect,
	DepthOfFieldEffect,
	// EdgeDetectionMode,
	Effect,
	EffectPass,
	// SMAAEffect,
	// SMAAPreset,
	TextureEffect,
	VignetteEffect,
	VignetteTechnique,
} from 'postprocessing';
import {isBooleanTrue} from '../../../core/Type';

const VIGNETTE_TECHNIQUES: VignetteTechnique[] = [VignetteTechnique.DEFAULT, VignetteTechnique.ESKIL];
const VIGNETTE_TECHNIQUE_NAME_BY_TECHNIQUE = {
	[VignetteTechnique.DEFAULT]: 'DEFAULT',
	[VignetteTechnique.ESKIL]: 'ESKIL',
};

enum RenderMode {
	DEFAULT = 'DEFAULT',
	DEPTH = 'DEPTH',
	COC = 'CIRCLE_OF_CONFUSION',
}
const RENDER_MODES: RenderMode[] = [RenderMode.DEFAULT, RenderMode.DEPTH, RenderMode.COC];

class DepthOfFieldPostParamsConfig extends NodeParamsConfig {
	depthOfField = ParamConfig.FOLDER();
	/** @param focalDepth */
	focusDistance = ParamConfig.FLOAT(10, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param focalDepth */
	focusRange = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, true],
		...PostParamOptions,
	});
	/** @param bokeh scale */
	bokehScale = ParamConfig.FLOAT(2, {
		range: [0, 5],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	vignette = ParamConfig.FOLDER();
	/** @param vignetting */
	vignetting = ParamConfig.BOOLEAN(0, {
		...PostParamOptions,
	});
	/** @param vignette technique */
	vignettingTechnique = ParamConfig.INTEGER(0, {
		...PostParamOptions,
		menu: {
			entries: VIGNETTE_TECHNIQUES.map((value) => {
				return {
					name: VIGNETTE_TECHNIQUE_NAME_BY_TECHNIQUE[value],
					value,
				};
			}),
		},
	});
	/** @param vignette darkness */
	vignetteDarkness = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [true, false],
		step: 0.001,
		...PostParamOptions,
	});
	/** @param vignette offset */
	vignetteOffset = ParamConfig.FLOAT(0.35, {
		range: [0, 1],
		rangeLocked: [true, false],
		step: 0.001,
		...PostParamOptions,
	});
	debug = ParamConfig.FOLDER();
	/** @param render mode */
	renderMode = ParamConfig.INTEGER(0, {
		...PostParamOptions,
		menu: {
			entries: RENDER_MODES.map((name, value) => ({name, value})),
		},
	});
}
const ParamsConfig = new DepthOfFieldPostParamsConfig();
export class DepthOfFieldPostNode extends TypedPostNode<EffectPass, DepthOfFieldPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'depthOfField';
	}

	override createPass(context: TypedPostNodeContext) {
		// const smaaEffect = new SMAAEffect(
		// 	{
		// 		preset: SMAAPreset.HIGH,
		// 		edgeDetectionMode: EdgeDetectionMode.DEPTH,
		// 	}
		// 	// assets.get("smaa-search"),
		// 	// assets.get("smaa-area"),
		// 	// SMAAPreset.HIGH,
		// 	// EdgeDetectionMode.DEPTH
		// );

		const depthOfFieldEffect = new DepthOfFieldEffect(context.camera, {
			blendFunction: BlendFunction.NORMAL,
			focusDistance: 0.0,
			// focalLength: 0.048,
			focusRange: 1,
			bokehScale: 2.0,
			height: 480,
			worldFocusDistance: 1,
			worldFocusRange: 1,
		});

		const depthEffect = new DepthEffect({
			blendFunction: BlendFunction.SKIP,
		});

		const vignetteEffect = new VignetteEffect({
			eskil: false,
			offset: 0.35,
			darkness: 0.5,
		});

		const cocTextureEffect = new TextureEffect({
			blendFunction: BlendFunction.SKIP,
			texture: (depthOfFieldEffect as any).cocTexture,
		});

		// const smaaPass = new EffectPass(context.camera, smaaEffect);

		const DOFPass = new EffectPass(
			context.camera,
			depthOfFieldEffect,
			vignetteEffect,
			cocTextureEffect,
			depthEffect
		);
		this.updatePass(DOFPass);
		return DOFPass;
		// return [DOFPass, smaaPass];
	}
	override updatePass(pass: EffectPass) {
		const effects = (pass as any).effects as Effect[];
		const vignetteEffect = effects.find((effect) => effect instanceof VignetteEffect) as VignetteEffect | undefined;
		if (vignetteEffect) {
			this._updateDOFPass(pass);
		} else {
			this._updateSmaaPass(pass);
		}
	}
	private _updateSmaaPass(pass: EffectPass) {
		const renderMode = RENDER_MODES[this.pv.renderMode];
		pass.enabled = renderMode === RenderMode.DEFAULT;
	}
	private _updateDOFPass(pass: EffectPass) {
		const effects = (pass as any).effects as Effect[];
		const vignetteEffect = effects.find((effect) => effect instanceof VignetteEffect)! as VignetteEffect;

		const DOF = effects.find((effect) => effect instanceof DepthOfFieldEffect)! as DepthOfFieldEffect;
		const depthEffect = effects.find((effect) => effect instanceof DepthEffect)! as DepthEffect;
		const cocTextureEffect = effects.find((effect) => effect instanceof TextureEffect)! as TextureEffect;

		const vignetteEnabled = isBooleanTrue(this.pv.vignetting);

		const renderMode = RENDER_MODES[this.pv.renderMode];

		depthEffect.blendMode.blendFunction =
			renderMode === RenderMode.DEPTH ? BlendFunction.NORMAL : BlendFunction.SKIP;
		cocTextureEffect.blendMode.blendFunction =
			renderMode === RenderMode.COC ? BlendFunction.NORMAL : BlendFunction.SKIP;
		vignetteEffect.blendMode.blendFunction =
			renderMode === RenderMode.DEFAULT && vignetteEnabled ? BlendFunction.NORMAL : BlendFunction.SKIP;

		DOF.circleOfConfusionMaterial.focusDistance = this.pv.focusDistance;
		DOF.circleOfConfusionMaterial.focusRange = this.pv.focusRange;
		DOF.bokehScale = this.pv.bokehScale;
		// pass.encodeOutput = renderMode === RenderMode.DEFAULT;
		// pass.renderToScreen = renderMode !== RenderMode.DEFAULT;

		vignetteEffect.blendMode.opacity.value = vignetteEnabled ? 1 : 0;
		vignetteEffect.darkness = this.pv.vignetteDarkness;
		vignetteEffect.offset = this.pv.vignetteOffset;
		// vignette.technique = this.pv.vignettingTechnique;
		// pass.bokehUniforms['fstop'].value = this.pv.fStep;
		// pass.bokehUniforms['maxblur'].value = this.pv.maxBlur;
		// pass.bokehUniforms['threshold'].value = this.pv.threshold;
		// pass.bokehUniforms['gain'].value = this.pv.gain;
		// pass.bokehUniforms['bias'].value = this.pv.bias;
		// pass.bokehUniforms['fringe'].value = this.pv.fringe;
		// pass.bokehUniforms['dithering'].value = this.pv.dithering;
		// // booleans
		// pass.bokehUniforms['noise'].value = isBooleanTrue(this.pv.noise) ? 1 : 0;
		// pass.bokehUniforms['pentagon'].value = isBooleanTrue(this.pv.pentagon) ? 1 : 0;
		// pass.bokehUniforms['vignetting'].value = isBooleanTrue(this.pv.vignetting) ? 1 : 0;
		// pass.bokehUniforms['depthblur'].value = isBooleanTrue(this.pv.depthBlur) ? 1 : 0;
		// // debug
		// pass.bokehUniforms['shaderFocus'].value = 0;
		// pass.bokehUniforms['showFocus'].value = 0;
		// pass.bokehUniforms['manualdof'].value = 0;
		// pass.bokehUniforms['focusCoords'].value.set(0.5, 0.5);
		// pass.bokehMaterial.defines['RINGS'] = this.pv.rings;
		// pass.bokehMaterial.defines['SAMPLES'] = this.pv.samples;
		// pass.bokehMaterial.needsUpdate = true;
		// pass.clearColor.copy(this.pv.clearColor);
		// pass.displayDepth = this.pv.debug;
	}
}
