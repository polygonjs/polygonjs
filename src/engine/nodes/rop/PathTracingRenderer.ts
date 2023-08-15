/**
 * Creates a WebGLRenderer
 *
 * @param
 * By default, a camera will create its own renderer, with sensible defaults. But there may be cases where you want to override those defaults. In those situation, simply create this node, and set the camera renderer param to it.
 *
 */
import {TypedRopNode} from './_Base';
import {RopType} from '../../poly/registers/nodes/types/Rop';
import type {WebGLRenderer} from 'three';
import {MeshBasicMaterial, CustomBlending} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Poly} from '../../Poly';
// import {isBooleanTrue} from '../../../core/BooleanValue';
// import {WEBGL_RENDERER_DEFAULT_PARAMS} from './WebGLRenderer';
// <<<<<<< HEAD
import {FullScreenQuad} from '../../../modules/three/examples/jsm/postprocessing/Pass';
import {
	PathTracingRenderer,
	PhysicalPathTracingMaterial,
	DenoiseMaterial,
} from '../../../core/render/PBR/three-gpu-pathtracer';
// =======
// import {FullScreenQuad} from 'three/examples/jsm/postprocessing/Pass';
// import {
// 	PathTracingRenderer,
// 	PhysicalPathTracingMaterial,
// 	PhysicalCamera,
// 	ShapedAreaLight,
// 	PhysicalSpotLight,
// 	IESLoader,
// 	// @ts-ignore
// } from '../../core/thirdParty/three-gpu-pathtracer';
// >>>>>>> master
import {PathTracingRendererContainer} from './utils/pathTracing/PathTracingRendererContainer';
import {BaseNodeType} from '../_Base';
import {ModuleName} from '../../poly/registers/modules/Common';

const updateWithoutCook = {
	cook: false,
	callback: (node: BaseNodeType) => {
		PathTracingRendererRopNode.PARAM_CALLBACK_update(node as PathTracingRendererRopNode);
	},
};

class PathTracingRendererRopParamsConfig extends NodeParamsConfig {
	realtime = ParamConfig.FOLDER();
	/** @param display samples count */
	displayDebug = ParamConfig.BOOLEAN(1);
	/** @param useWorker */
	useWorker = ParamConfig.BOOLEAN(0);
	/** @param samples */
	maxSamplesCount = ParamConfig.INTEGER(2 ** 12, {
		range: [1, 2 ** 12],
		rangeLocked: [true, false],
		step: 1,
	});

	/** @param resolutionScale */
	resolutionScale = ParamConfig.FLOAT(0.5, {
		range: [0.1, 1],
		rangeLocked: [true, true],
		step: 0.01,
		separatorAfter: true,
	});
	/** @param bounces */
	bounces = ParamConfig.INTEGER(3, {
		range: [1, 10],
		rangeLocked: [true, false],
		...updateWithoutCook,
	});
	/** @param bounces inside transmissive material */
	transmissiveBounces = ParamConfig.INTEGER(3, {
		range: [1, 10],
		rangeLocked: [true, false],
		...updateWithoutCook,
	});
	/** @param stableNoise*/
	stableNoise = ParamConfig.BOOLEAN(1, {
		...updateWithoutCook,
	});
	/** @param multipleImportanceSampling */
	multipleImportanceSampling = ParamConfig.BOOLEAN(1, {
		...updateWithoutCook,
	});
	/** @param filterGlossyFactor */
	filterGlossyFactor = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [true, true],
		...updateWithoutCook,
	});
	/** @param backgroundBlur*/
	backgroundBlur = ParamConfig.FLOAT(0, {
		// ...updateWithoutCook,
	});
	/** @param environmentIntensity*/
	environmentIntensity = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
		...updateWithoutCook,
	});
	denoise = ParamConfig.BOOLEAN(1, {
		separatorBefore: true,
		...updateWithoutCook,
	});
	denoiseSigma = ParamConfig.FLOAT(2.5, {
		range: [0.01, 12.0],
		rangeLocked: [true, true],
		...updateWithoutCook,
	});
	denoiseThreshold = ParamConfig.FLOAT(0.1, {
		range: [0.01, 1.0],
		rangeLocked: [true, true],
		...updateWithoutCook,
	});
	denoiseKSigma = ParamConfig.FLOAT(1.0, {
		range: [0.0, 12.0],
		rangeLocked: [true, true],
		...updateWithoutCook,
	});
	/** @param toggle on to have alpha on (change requires page reload) */
	// alpha = ParamConfig.BOOLEAN(1);
	/** @param toggle on to have antialias on (change requires page reload) */
	// antialias = ParamConfig.BOOLEAN(1);
	/** @param tiles */
	tiles = ParamConfig.VECTOR2([2, 2], {
		separatorBefore: true,
		...updateWithoutCook,
	});
	/** @param force update */
	// generate = ParamConfig.BUTTON(null, {
	// 	callback: (node: BaseNodeType) => {
	// 		PathTracingRendererRopNode.PARAM_CALLBACK_generate(node as PathTracingRendererRopNode);
	// 	},
	// });
	// /** @param reset */
	// reset = ParamConfig.BUTTON(null, {
	// 	callback: (node: BaseNodeType) => {
	// 		PathTracingRendererRopNode.PARAM_CALLBACK_reset(node as PathTracingRendererRopNode);
	// 	},
	// });
	sequenceRender = ParamConfig.FOLDER();
	/** @param frame range */
	f = ParamConfig.VECTOR2([0, 100], {
		label: 'Frame Range',
		...updateWithoutCook,
	});
	/** @param samples */
	samplesPerAnimationFrame = ParamConfig.INTEGER(20, {
		range: [1, 1000],
		rangeLocked: [true, false],
		...updateWithoutCook,
	});
	/** @param resolution */
	resolution = ParamConfig.VECTOR2([512, 512], {
		...updateWithoutCook,
	});
	/** @param fileName */
	fileName = ParamConfig.STRING('`$OS`', {
		...updateWithoutCook,
	});
	framePadding = ParamConfig.INTEGER(4, {
		range: [2, 6],
		rangeLocked: [true, false],
		...updateWithoutCook,
	});
}
const ParamsConfig = new PathTracingRendererRopParamsConfig();

export class PathTracingRendererRopNode extends TypedRopNode<PathTracingRendererRopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<RopType.PATH_TRACING> {
		return RopType.PATH_TRACING;
	}
	override requiredModules() {
		return [ModuleName.PBR];
	}

	private _pathTracingRenderer: PathTracingRendererContainer | undefined;
	private _webGLRenderer: WebGLRenderer | undefined;

	protected override initializeNode(): void {
		super.initializeNode();

		Poly.onSceneUpdatedHooks.registerHook(this, this._paramCallbackGenerate.bind(this));
	}
	override dispose() {
		super.dispose();
		Poly.onSceneUpdatedHooks.unregisterHook(this);
	}
	private _createWebGLRenderer(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
		// const params: WebGLRendererParameters = {};
		// const keys: Array<keyof WebGLRendererParameters> = Object.keys(WEBGL_RENDERER_DEFAULT_PARAMS) as Array<
		// 	keyof WebGLRendererParameters
		// >;
		// let k: keyof WebGLRendererParameters;
		// for (k of keys) {
		// 	(params[k] as any) = WEBGL_RENDERER_DEFAULT_PARAMS[k];
		// }

		// params.antialias = isBooleanTrue(this.pv.antialias);
		// params.alpha = isBooleanTrue(this.pv.alpha);
		// params.canvas = canvas;
		// params.context = gl;
		// params.preserveDrawingBuffer = true;
		const webGLRenderer = Poly.renderersController.defaultWebGLRendererForCanvas(canvas);

		if (Poly.renderersController.printDebug()) {
			Poly.renderersController.printDebugMessage(`create renderer from node '${this.path()}'`);
			// Poly.renderersController.printDebugMessage({
			// 	params: params,
			// });
		}
		return webGLRenderer;
	}
	private _createPathTracingRenderer(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
		this._webGLRenderer = this._webGLRenderer || this._createWebGLRenderer(canvas, gl);
		const pathTracingRenderer = new PathTracingRenderer(this._webGLRenderer);
		pathTracingRenderer.material = new PhysicalPathTracingMaterial();

		const fsQuadMat = new MeshBasicMaterial({
			map: pathTracingRenderer.target.texture,
			blending: CustomBlending,
		});
		const denoiseMat = new DenoiseMaterial({
			map: pathTracingRenderer.target.texture,
			blending: CustomBlending,
			premultipliedAlpha: this._webGLRenderer.getContextAttributes().premultipliedAlpha,
		});
		const denoiseQuad = new FullScreenQuad(denoiseMat);

		const fsQuad = new FullScreenQuad(fsQuadMat);
		const pathTracingRendererContainer = new PathTracingRendererContainer({
			node: this,
			webGLRenderer: this._webGLRenderer,
			pathTracingRenderer,
			fsQuad,
			fsQuadMat,
			denoiseQuad,
			denoiseMat,
		});

		this._updateRenderer(pathTracingRendererContainer);

		this._pathTracingRenderer = pathTracingRendererContainer;
		return pathTracingRendererContainer;
	}

	renderer(canvas: HTMLCanvasElement, gl: WebGLRenderingContext): PathTracingRendererContainer {
		return (this._pathTracingRenderer = this._pathTracingRenderer || this._createPathTracingRenderer(canvas, gl));
	}

	override cook() {
		this._paramCallbackUpdate();
		this.cookController.endCook();
	}

	private _updateRenderer(rendererContainer: PathTracingRendererContainer) {
		rendererContainer.update({
			resolutionScale: this.pv.resolutionScale,
			displayDebug: this.pv.displayDebug,
			bounces: this.pv.bounces,
			transmissiveBounces: this.pv.transmissiveBounces,
			stableNoise: this.pv.stableNoise,
			filterGlossyFactor: this.pv.filterGlossyFactor,
			backgroundBlur: this.pv.backgroundBlur,
			environmentIntensity: this.pv.environmentIntensity,
			tiles: this.pv.tiles,
			multipleImportanceSampling: this.pv.multipleImportanceSampling,
			//
			denoise: this.pv.denoise,
			denoiseSigma: this.pv.denoiseSigma,
			denoiseThreshold: this.pv.denoiseThreshold,
			denoiseKSigma: this.pv.denoiseKSigma,
			//
			maxSamplesCount: this.pv.maxSamplesCount,
			samplesPerAnimationFrame: this.pv.samplesPerAnimationFrame,
			f: this.pv.f,
			useWorker: this.pv.useWorker,
		});
	}
	static PARAM_CALLBACK_generate(node: PathTracingRendererRopNode) {
		node._paramCallbackGenerate();
	}
	private _paramCallbackGenerate() {
		const scene = this.scene().threejsScene();
		this._pathTracingRenderer?.generate(scene);
	}
	static PARAM_CALLBACK_update(node: PathTracingRendererRopNode) {
		node._paramCallbackUpdate();
	}
	private _paramCallbackUpdate() {
		if (this._pathTracingRenderer) {
			this._updateRenderer(this._pathTracingRenderer);
		}
	}
}
