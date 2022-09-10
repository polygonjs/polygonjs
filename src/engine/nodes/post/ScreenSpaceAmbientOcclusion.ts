/**
 * Screen space ambient occlusion
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {BlendFunction, DepthDownsamplingPass, Effect, EffectPass, NormalPass, SSAOEffect, Pass} from 'postprocessing';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BLEND_FUNCTION_MENU_OPTIONS} from '../../../core/post/BlendFunction';

// enum RenderMode {
// 	DEFAULT = 'DEFAULT',
// 	NORMALS = 'NORMALS',
// 	DEPTH = 'DEPTH',
// }
// const RENDER_MODES: RenderMode[] = [RenderMode.DEFAULT, RenderMode.NORMALS, RenderMode.DEPTH];

class ScreenSpaceAmbientOcclusionParamsConfig extends NodeParamsConfig {
	main = ParamConfig.FOLDER();
	/** @param samples */
	samples = ParamConfig.INTEGER(9, {
		range: [1, 16],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param rings */
	rings = ParamConfig.INTEGER(7, {
		range: [1, 16],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param distanceThreshold */
	distanceThreshold = ParamConfig.FLOAT(0.02, {
		range: [0, 0.1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param distanceThreshold */
	distanceFalloff = ParamConfig.FLOAT(0.0025, {
		range: [0, 0.01],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param rangeThreshold */
	rangeThreshold = ParamConfig.FLOAT(0.0003, {
		range: [0, 0.001],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param rangeFalloff */
	rangeFalloff = ParamConfig.FLOAT(0.0001, {
		range: [0, 0.001],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param luminanceInfluence */
	luminanceInfluence = ParamConfig.FLOAT(0.7, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param minRadiusScale */
	minRadiusScale = ParamConfig.FLOAT(0.33, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param radius */
	radius = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param intensity */
	intensity = ParamConfig.FLOAT(1, {
		range: [0, 5],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param bias */
	bias = ParamConfig.FLOAT(0.025, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	debug = ParamConfig.FOLDER();
	/** @param render mode */
	// renderMode = ParamConfig.INTEGER(0, {
	// 	...PostParamOptions,
	// 	menu: {
	// 		entries: RENDER_MODES.map((name, value) => ({name, value})),
	// 	},
	// });
	/** @param render mode */
	blendFunction = ParamConfig.INTEGER(BlendFunction.MULTIPLY, {
		...PostParamOptions,
		...BLEND_FUNCTION_MENU_OPTIONS,
	});
}
const ParamsConfig = new ScreenSpaceAmbientOcclusionParamsConfig();
export class ScreenSpaceAmbientOcclusionPostNode extends TypedPostProcessNode<
	Pass,
	ScreenSpaceAmbientOcclusionParamsConfig
> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'screenSpaceAmbientOcclusion';
	}

	override createPass(context: TypedPostNodeContext) {
		const normalPass = new NormalPass(context.scene, context.camera);
		const depthDownsamplingPass = new DepthDownsamplingPass({
			normalBuffer: normalPass.texture,
			resolutionScale: 0.5,
		});

		const isWebGL2 = context.renderer.capabilities.isWebGL2;
		const normalDepthBuffer = isWebGL2 ? depthDownsamplingPass.texture : undefined;

		// const smaaEffect = new SMAAEffect({
		// 	preset: SMAAPreset.HIGH,
		// 	edgeDetectionMode: EdgeDetectionMode.DEPTH,
		// });

		// smaaEffect.edgeDetectionMaterial.edgeDetectionThreshold = 0.01;

		// Note: Thresholds and falloff correspond to camera near/far.
		// Example: worldDistance = distanceThreshold * (camera.far - camera.near)
		const ssaoEffect = new SSAOEffect(context.camera, normalPass.texture, {
			// blendFunction: BlendFunction.NORMAL,
			distanceScaling: true,
			depthAwareUpsampling: false,
			normalDepthBuffer,
			worldDistanceThreshold: 20,
			worldDistanceFalloff: 5,
			worldProximityThreshold: 0.4,
			worldProximityFalloff: 0.1,
			radius: 0.1,
			intensity: 1.33,
			resolutionScale: 0.5,
			// blendFunction: BlendFunction.MULTIPLY,
			// distanceScaling: true,
			// depthAwareUpsampling: true,
			// normalDepthBuffer,
			// samples: 9,
			// rings: 7,
			// distanceThreshold: 0.02, // Render up to a distance of ~20 world units
			// distanceFalloff: 0.0025, // with an additional ~2.5 units of falloff.
			// rangeThreshold: 0.0003, // Occlusion proximity of ~0.3 world units
			// rangeFalloff: 0.0001, // with ~0.1 units of falloff.
			// luminanceInfluence: 0.7,
			// minRadiusScale: 0.33,
			// radius: 0.1,
			// intensity: 1.33,
			// bias: 0.025,
			// fade: 0.01,
			// color: new Color(0, 0, 0),
			// resolutionScale: 0.5,
			// worldDistanceThreshold: 1,
			// worldDistanceFalloff: 1,
			// worldProximityThreshold: 1,
			// worldProximityFalloff: 1,
		});

		// const textureEffect = new TextureEffect({
		// 	blendFunction: BlendFunction.SKIP,
		// 	texture: depthDownsamplingPass.texture,
		// });

		const effectPass = new EffectPass(context.camera, ssaoEffect);
		this.updatePass(effectPass);
		const passes: Pass[] = [normalPass];
		if (isWebGL2) {
			passes.push(depthDownsamplingPass);
		}
		passes.push(effectPass);

		return passes;
	}

	override updatePass(pass: EffectPass) {
		const effects = (pass as any).effects as Effect[] | undefined;
		if (!effects) {
			return;
		}
		const ssaoEffect = effects.find((effect) => effect instanceof SSAOEffect) as SSAOEffect | undefined;
		// const textureEffect = effects.find((effect) => effect instanceof TextureEffect) as TextureEffect | undefined;
		if (!ssaoEffect) {
			return;
		}
		// if (!textureEffect) {
		// 	return;
		// }
		// const renderMode = RENDER_MODES[this.pv.renderMode];

		// if (renderMode === RenderMode.DEPTH) {
		// 	textureEffect.setTextureSwizzleRGBA(ColorChannel.ALPHA);
		// } else if (renderMode === RenderMode.NORMALS) {
		// 	textureEffect.setTextureSwizzleRGBA(
		// 		ColorChannel.RED,
		// 		ColorChannel.GREEN,
		// 		ColorChannel.BLUE,
		// 		ColorChannel.ALPHA
		// 	);
		// }

		// textureEffect.blendMode.blendFunction =
		// 	renderMode !== RenderMode.DEFAULT ? BlendFunction.NORMAL : BlendFunction.SKIP;

		// pass.encodeOutput = renderMode === RenderMode.DEFAULT;
		ssaoEffect.blendMode.blendFunction = this.pv.blendFunction;

		ssaoEffect.samples = this.pv.samples;
		ssaoEffect.rings = this.pv.rings;
		ssaoEffect.ssaoMaterial.distanceThreshold = this.pv.distanceThreshold;
		ssaoEffect.ssaoMaterial.distanceFalloff = this.pv.distanceFalloff;
		ssaoEffect.ssaoMaterial.proximityThreshold = this.pv.rangeThreshold;
		ssaoEffect.ssaoMaterial.proximityFalloff = this.pv.rangeFalloff;
		ssaoEffect.ssaoMaterial.minRadiusScale = this.pv.minRadiusScale;
		ssaoEffect.ssaoMaterial.radius = this.pv.radius;
		ssaoEffect.ssaoMaterial.intensity = this.pv.intensity;
		ssaoEffect.ssaoMaterial.bias = this.pv.bias;
	}
}
