// /**
//  * Screen space global illumination
//  *
//  *
//  */
// import {TypedPostNode, TypedPostNodeContext, PostParamOptions} from './_Base';
// import {Effect, Pass, EffectPass} from 'postprocessing';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// // @ts-ignore
// import {SSREffect} from 'screen-space-reflections';

// class ScreenSpaceReflectionsParamsConfig extends NodeParamsConfig {
// 	main = ParamConfig.FOLDER();
// 	/** @param intensity */
// 	intensity = ParamConfig.FLOAT(5, {
// 		range: [0, 10],
// 		rangeLocked: [true, false],
// 		...PostParamOptions,
// 	});
// }
// const ParamsConfig = new ScreenSpaceReflectionsParamsConfig();
// export class ScreenSpaceReflectionsPostNode extends TypedPostNode<Pass, ScreenSpaceReflectionsParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'screenSpaceReflections';
// 	}

// 	override createPass(context: TypedPostNodeContext) {
// 		const ssrEffect = new SSREffect(context.scene, context.camera);

// 		const ssrPass = new EffectPass(context.camera, ssrEffect);

// 		console.log({ssrPass, ssrEffect});
// 		const passes: Pass[] = [ssrPass];
// 		return passes;
// 	}

// 	override updatePass(pass: Pass) {
// 		const effects = (pass as any).effects as Effect[] | undefined;
// 		if (!effects) {
// 			return;
// 		}
// 		const ssrEffect = effects.find((effect) => effect instanceof SSREffect) as SSREffect | undefined;

// 		console.log({ssrEffect});
// 	}
// }
