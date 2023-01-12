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
	PhysicalCamera,
	ShapedAreaLight,
	PhysicalSpotLight,
	IESLoader,
	// @ts-ignore
} from 'three-gpu-pathtracer';
import {PathTracingRendererContainer} from './utils/pathTracing/PathTracingRendererContainer';
import {BaseNodeType} from '../_Base';
import {CoreSceneObjectsFactory} from '../../../core/CoreSceneObjectsFactory';
import {IES_PROFILE_LM_63_1995} from '../../../core/lights/spotlight/ies/lm_63_1995';

class PathTracingRendererRopParamsConfig extends NodeParamsConfig {
	/** @param samples */
	samplesPerFrame = ParamConfig.INTEGER(5, {
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
	stableNoise = ParamConfig.BOOLEAN(false);
	/** @param multipleImportanceSampling */
	multipleImportanceSampling = ParamConfig.BOOLEAN(0);
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
}
const ParamsConfig = new PathTracingRendererRopParamsConfig();

export class PathTracingRendererRopNode extends TypedRopNode<PathTracingRendererRopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<RopType.PATH_TRACING> {
		return RopType.PATH_TRACING;
	}

	private _lastRenderer: PathTracingRendererContainer | undefined;

	protected override initializeNode(): void {
		super.initializeNode();

		CoreSceneObjectsFactory.generators.perspectiveCamera = (fov, aspect, near, far) =>
			new PhysicalCamera(fov, aspect, near, far);
		CoreSceneObjectsFactory.generators.areaLight = (color, intensity, width, height) =>
			new ShapedAreaLight(color, intensity, width, height);
		CoreSceneObjectsFactory.generators.spotLight = () => new PhysicalSpotLight();
		CoreSceneObjectsFactory.generators.spotLightUpdate = (spotLight: PhysicalSpotLight, textureName: string) => {
			spotLight.iesTexture = new IESLoader().parse(IES_PROFILE_LM_63_1995);
		};
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
		const webGLRenderer = Poly.renderersController.createWebGLRenderer(params);

		if (Poly.renderersController.printDebug()) {
			Poly.renderersController.printDebugMessage(`create renderer from node '${this.path()}'`);
			Poly.renderersController.printDebugMessage({
				params: params,
			});
		}

		const pathTracingRenderer = new PathTracingRenderer(webGLRenderer);
		pathTracingRenderer.material = new PhysicalPathTracingMaterial();

		const blitQuadMat = new MeshBasicMaterial({
			map: pathTracingRenderer.target.texture,
			blending: CustomBlending,
		});
		const blitQuad = new FullScreenQuad(blitQuadMat);
		const pathTracingRendererContainer = new PathTracingRendererContainer(
			webGLRenderer,
			pathTracingRenderer,
			blitQuad,
			blitQuadMat
		);

		this._updateRenderer(pathTracingRendererContainer);

		this._lastRenderer = pathTracingRendererContainer;
		return pathTracingRendererContainer;
	}

	override cook() {
		this.cookController.endCook();
	}

	private _updateRenderer(rendererContainer: PathTracingRendererContainer) {
		const {pathTracingRenderer} = rendererContainer;
		rendererContainer.samplesPerFrame = this.pv.samplesPerFrame;
		rendererContainer.resolutionScale = this.pv.resolutionScale;
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
		this._lastRenderer?.generate(this.scene().threejsScene());
	}
	static PARAM_CALLBACK_reset(node: PathTracingRendererRopNode) {
		node._paramCallbackReset();
	}
	private _paramCallbackReset() {
		this._lastRenderer?.reset();
	}
}
