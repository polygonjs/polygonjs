/**
 * Creates a WebGLRenderer
 *
 * @param
 * By default, a camera will create its own renderer, with sensible defaults. But there may be cases where you want to override those defaults. In those situation, simply create this node, and set the camera renderer param to it.
 *
 */
import {TypedRopNode} from './_Base';
import {RopType} from '../../poly/registers/nodes/types/Rop';
import {WebGLRendererParameters} from 'three';
import {MeshBasicMaterial, CustomBlending} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Poly} from '../../Poly';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DEFAULT_PARAMS} from './WebGLRenderer';
import {FullScreenQuad} from '../../../modules/three/examples/jsm/postprocessing/Pass';
import {
	PathTracingRenderer,
	PhysicalPathTracingMaterial,
	// @ts-ignore
} from 'three-gpu-pathtracer';
import {PathTracingRendererContainer} from './utils/pathTracing/PathTracingRendererContainer';
import {BaseNodeType} from '../_Base';
import {ModuleName} from '../../poly/registers/modules/Common';

class PathTracingRendererRopParamsConfig extends NodeParamsConfig {
	realtime = ParamConfig.FOLDER();
	/** @param display samples count */
	displayDebug = ParamConfig.BOOLEAN(1);
	/** @param samples */
	samplesPerFrame = ParamConfig.INTEGER(1, {
		range: [1, 10],
		rangeLocked: [true, false],
	});

	/** @param resolutionScale */
	resolutionScale = ParamConfig.FLOAT(0.5, {
		range: [0.1, 1],
		rangeLocked: [true, true],
		separatorAfter: true,
	});
	/** @param bounces */
	bounces = ParamConfig.INTEGER(3, {
		range: [1, 10],
		rangeLocked: [true, false],
	});
	/** @param stableNoise*/
	stableNoise = ParamConfig.BOOLEAN(1);
	/** @param multipleImportanceSampling */
	multipleImportanceSampling = ParamConfig.BOOLEAN(1);
	/** @param filterGlossyFactor */
	filterGlossyFactor = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
	/** @param backgroundBlur*/
	backgroundBlur = ParamConfig.FLOAT(0);
	/** @param environmentIntensity*/
	environmentIntensity = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
		separatorAfter: true,
	});
	/** @param toggle on to have alpha on (change requires page reload) */
	alpha = ParamConfig.BOOLEAN(1);
	/** @param toggle on to have antialias on (change requires page reload) */
	antialias = ParamConfig.BOOLEAN(1);
	/** @param tiles */
	tiles = ParamConfig.VECTOR2([2, 2]);
	/** @param force update */
	generate = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			PathTracingRendererRopNode.PARAM_CALLBACK_generate(node as PathTracingRendererRopNode);
		},
	});
	/** @param reset */
	reset = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			PathTracingRendererRopNode.PARAM_CALLBACK_reset(node as PathTracingRendererRopNode);
		},
	});
	recording = ParamConfig.FOLDER();
	/** @param samples */
	samplesPerAnimationFrame = ParamConfig.INTEGER(20, {
		range: [1, 1000],
		rangeLocked: [true, false],
	});
	/** @param this can remain off if only the camera is moving, but needs to be ON if other objects are animated */
	// rebuild = ParamConfig.BOOLEAN(1);
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

	private _lastRenderer: PathTracingRendererContainer | undefined;

	protected override initializeNode(): void {
		super.initializeNode();

		Poly.onSceneUpdatedHooks.registerHook(this, this._paramCallbackGenerate.bind(this));
	}
	override dispose() {
		super.dispose();
		Poly.onSceneUpdatedHooks.unregisterHook(this);
	}

	createRenderer(canvas: HTMLCanvasElement, gl: WebGLRenderingContext): PathTracingRendererContainer {
		const params: WebGLRendererParameters = {};
		const keys: Array<keyof WebGLRendererParameters> = Object.keys(DEFAULT_PARAMS) as Array<
			keyof WebGLRendererParameters
		>;
		let k: keyof WebGLRendererParameters;
		for (k of keys) {
			(params[k] as any) = DEFAULT_PARAMS[k];
		}

		params.antialias = isBooleanTrue(this.pv.antialias);
		params.alpha = isBooleanTrue(this.pv.alpha);
		params.canvas = canvas;
		params.context = gl;
		params.preserveDrawingBuffer = false;
		const webGLRenderer = Poly.renderersController.createWebGLRenderer(params);

		if (Poly.renderersController.printDebug()) {
			Poly.renderersController.printDebugMessage(`create renderer from node '${this.path()}'`);
			Poly.renderersController.printDebugMessage({
				params: params,
			});
		}

		const pathTracingRenderer = new PathTracingRenderer(webGLRenderer);
		pathTracingRenderer.material = new PhysicalPathTracingMaterial();

		const fsQuadMat = new MeshBasicMaterial({
			map: pathTracingRenderer.target.texture,
			blending: CustomBlending,
		});
		const fsQuad = new FullScreenQuad(fsQuadMat);
		const pathTracingRendererContainer = new PathTracingRendererContainer(
			webGLRenderer,
			pathTracingRenderer,
			fsQuad,
			fsQuadMat
		);

		this._updateRenderer(pathTracingRendererContainer);

		if (this._lastRenderer) {
			this._lastRenderer.dispose();
		}

		this._lastRenderer = pathTracingRendererContainer;
		return pathTracingRendererContainer;
	}

	override cook() {
		this.cookController.endCook();
	}

	private _updateRenderer(rendererContainer: PathTracingRendererContainer) {
		const {pathTracingRenderer} = rendererContainer;
		rendererContainer.samplesPerFrame = this.pv.samplesPerFrame;
		rendererContainer.samplesPerAnimationFrame = this.pv.samplesPerAnimationFrame;
		rendererContainer.resolutionScale = this.pv.resolutionScale;
		rendererContainer.displayDebug = this.pv.displayDebug;
		pathTracingRenderer.material.bounces = this.pv.bounces;
		pathTracingRenderer.stableNoise = this.pv.stableNoise;
		pathTracingRenderer.material.filterGlossyFactor = this.pv.filterGlossyFactor;
		pathTracingRenderer.material.backgroundBlur = this.pv.backgroundBlur;
		pathTracingRenderer.material.environmentIntensity = this.pv.environmentIntensity;
		pathTracingRenderer.tiles.set(this.pv.tiles.x, this.pv.tiles.y);

		pathTracingRenderer.material.setDefine('FEATURE_MIS', Number(this.pv.multipleImportanceSampling));
	}
	static PARAM_CALLBACK_generate(node: PathTracingRendererRopNode) {
		node._paramCallbackGenerate();
	}
	private _paramCallbackGenerate() {
		const scene = this.scene().threejsScene();
		this._lastRenderer?.generate(scene);
	}
	static PARAM_CALLBACK_reset(node: PathTracingRendererRopNode) {
		node._paramCallbackReset();
	}
	private _paramCallbackReset() {
		this._lastRenderer?.reset();
	}
}
