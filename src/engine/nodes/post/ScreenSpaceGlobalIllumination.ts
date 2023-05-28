// /**
//  * Screen space global illumination
//  *
//  *
//  */
// import {TypedPostNode, TypedPostNodeContext, PostParamOptions} from './_Base';
// import {Effect, Pass, EffectPass} from 'postprocessing';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// // @ts-ignore
// import {SSGIEffect, VelocityDepthNormalPass} from 'realism-effects';

// class ScreenSpaceGlobalIlluminationParamsConfig extends NodeParamsConfig {
// 	main = ParamConfig.FOLDER();
// 	/** @param color */
// 	color = ParamConfig.COLOR([0, 0, 0], {
// 		...PostParamOptions,
// 	});
// 	/** @param intensity */
// 	intensity = ParamConfig.FLOAT(5, {
// 		range: [0, 10],
// 		rangeLocked: [true, false],
// 		...PostParamOptions,
// 	});
// 	/** @param radius */
// 	radius = ParamConfig.FLOAT(5, {
// 		range: [0, 10],
// 		rangeLocked: [true, false],
// 		...PostParamOptions,
// 	});
// 	/** @param distanceFallOff */
// 	distanceFallOff = ParamConfig.FLOAT(1, {
// 		range: [0, 1],
// 		rangeLocked: [true, false],
// 		...PostParamOptions,
// 	});
// 	displayMode = ParamConfig.INTEGER(DISPLAY_MODES.indexOf(DisplayMode.COMBINED), {
// 		menu: {
// 			entries: DISPLAY_MODES.map((name, value) => {
// 				return {name, value};
// 			}),
// 		},
// 	});
// }
// const ParamsConfig = new ScreenSpaceGlobalIlluminationParamsConfig();
// export class ScreenSpaceGlobalIlluminationPostNode extends TypedPostNode<
// 	Pass,
// 	ScreenSpaceGlobalIlluminationParamsConfig
// > {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'screenSpaceGlobalIllumination';
// 	}

// 	override createPass(context: TypedPostNodeContext) {
// 		const velocityDepthNormalPass = new VelocityDepthNormalPass(context.scene, context.camera);
// 		const ssgiEffect = new SSGIEffect(context.scene, context.camera, velocityDepthNormalPass);

// 		// this.updatePass(ssgiEffect);
// 		const effectPass = new EffectPass(context.camera, ssgiEffect);

// 		const passes: Pass[] = [velocityDepthNormalPass, effectPass];
// 		return passes;
// 	}

// 	override updatePass(pass: SSGIEffect) {
// 		const effects = (pass as any).effects as Effect[] | undefined;
// 		if (!effects) {
// 			return;
// 		}
// 		const ssgiEffect = effects.find((effect) => effect instanceof SSGIEffect) as SSGIEffect | undefined;

// 		console.log(ssgiEffect);
// 	}
// }
