import {
	Line,
	LineBasicMaterial,
	Material,
	Matrix4,
	Mesh,
	Object3D,
	Vector2,
	WebGLCapabilities,
	WebGLMultipleRenderTargets,
	WebGLRenderer,
	WebGLRenderTarget,
	Object3DEventMap,
} from 'three';
import {Scene, Camera, MeshBasicMaterial} from 'three';
import {FullScreenQuad} from 'three/examples/jsm/postprocessing/Pass';
import {AbstractRenderer} from '../../../../viewers/Common';
import {CoreType} from '../../../../../core/Type';
import {CoreSleep} from '../../../../../core/Sleep';
import {
	PathTracingRenderer,
	PathTracingSceneWorker,
	PathTracingSceneGenerator,
	BlurredEnvMapGenerator,
	PhysicalCamera,
	DenoiseMaterial,
	GeneratorResult,
} from '../../../../../core/render/PBR/three-gpu-pathtracer';
import type {PathTracingRendererRopNode} from '../../PathTracingRenderer';

interface UpdateOptions {
	//
	resolutionScale: number;
	displayDebug: boolean;
	bounces: number;
	transmissiveBounces: number;
	stableNoise: boolean;
	filterGlossyFactor: number;
	backgroundBlur: number;
	environmentIntensity: number;
	tiles: Vector2;
	multipleImportanceSampling: boolean;
	//
	denoise: boolean;
	denoiseSigma: number;
	denoiseThreshold: number;
	denoiseKSigma: number;
	//
	maxSamplesCount: number;
	samplesPerAnimationFrame: number;
	f: Vector2;
	//
	useWorker: boolean;
}

interface PathtracingRendererContainerOptions {
	node: PathTracingRendererRopNode;
	webGLRenderer: WebGLRenderer;
	pathTracingRenderer: PathTracingRenderer;
	fsQuad: FullScreenQuad;
	fsQuadMat: MeshBasicMaterial;
	denoiseQuad: FullScreenQuad;
	denoiseMat: DenoiseMaterial;
}
export class PathTracingRendererContainer implements AbstractRenderer {
	public displayDebug = true;
	public backgroundBlur = 0.1;
	public maxSamplesCount = 1;
	public samplesPerAnimationFrame = 1;
	public frameRange = new Vector2();
	public resolutionScale = 0.5;
	private _useWorker: boolean = false;
	public domElement: HTMLCanvasElement;
	private _generated = false;
	private _generating = false;
	public readonly isPathTracingRendererContainer = true;
	private _denoiseActive: boolean = false;

	public readonly node: PathTracingRendererRopNode;
	public readonly webGLRenderer: WebGLRenderer;
	public readonly pathTracingRenderer: PathTracingRenderer;
	public readonly fsQuad: FullScreenQuad;
	public readonly fsQuadMat: MeshBasicMaterial;
	public readonly denoiseQuad: FullScreenQuad;
	public readonly denoiseMat: DenoiseMaterial;
	constructor(options: PathtracingRendererContainerOptions) {
		this.node = options.node;
		this.webGLRenderer = options.webGLRenderer;
		this.pathTracingRenderer = options.pathTracingRenderer;
		this.fsQuad = options.fsQuad;
		this.fsQuadMat = options.fsQuadMat;
		this.denoiseQuad = options.denoiseQuad;
		this.denoiseMat = options.denoiseMat;
		this.domElement = this.webGLRenderer.domElement;
	}
	private _multipleImportanceSampling: boolean = true;
	update(options: UpdateOptions) {
		const {pathTracingRenderer} = this;

		let resetRequired = false;
		let generateRequired = false;

		if (this.resolutionScale != options.resolutionScale) {
			this.resolutionScale = options.resolutionScale;
			resetRequired = true;
		}
		if (this.displayDebug != options.displayDebug) {
			this.displayDebug = options.displayDebug;
			resetRequired = true;
		}
		if (pathTracingRenderer.material.bounces != options.bounces) {
			pathTracingRenderer.material.bounces = options.bounces;
			resetRequired = true;
		}
		if (pathTracingRenderer.material.transmissiveBounces != options.transmissiveBounces) {
			pathTracingRenderer.material.transmissiveBounces = options.transmissiveBounces;
			resetRequired = true;
		}
		if (pathTracingRenderer.stableNoise != options.stableNoise) {
			pathTracingRenderer.stableNoise = options.stableNoise;
			resetRequired = true;
		}
		if (pathTracingRenderer.material.filterGlossyFactor != options.filterGlossyFactor) {
			pathTracingRenderer.material.filterGlossyFactor = options.filterGlossyFactor;
			resetRequired = true;
		}
		if (this.backgroundBlur != options.backgroundBlur) {
			this.backgroundBlur = options.backgroundBlur;
			generateRequired = true;
		}
		if (pathTracingRenderer.material.environmentIntensity != options.environmentIntensity) {
			pathTracingRenderer.material.environmentIntensity = options.environmentIntensity;
			resetRequired = true;
		}
		if (!pathTracingRenderer.tiles.equals(options.tiles)) {
			pathTracingRenderer.tiles.set(options.tiles.x, options.tiles.y);
			resetRequired = true;
		}
		if (this._multipleImportanceSampling != options.multipleImportanceSampling) {
			this._multipleImportanceSampling = options.multipleImportanceSampling;
			pathTracingRenderer.material.setDefine('FEATURE_MIS', Number(options.multipleImportanceSampling));
			resetRequired = true;
		}
		//
		this._denoiseActive = options.denoise;
		this.denoiseMat.sigma = options.denoiseSigma;
		this.denoiseMat.threshold = options.denoiseThreshold;
		this.denoiseMat.kSigma = options.denoiseKSigma;
		//
		this._useWorker = options.useWorker;

		// for progressive render only, no reset/generate required
		if (this.maxSamplesCount > options.maxSamplesCount) {
			// do a reset if the new max samples count is lower than the current one
			resetRequired = true;
		}
		this.maxSamplesCount = options.maxSamplesCount;

		// for sequence render only, no reset/generate required
		this.samplesPerAnimationFrame = options.samplesPerAnimationFrame;
		this.frameRange.copy(options.f);

		// reset/generate if required
		if (generateRequired) {
			this.markAsNotGenerated();
		} else if (resetRequired) {
			this.reset();
		}
	}

	render(scene: Scene, camera: PhysicalCamera) {
		this.renderRealtime(scene, camera);
	}

	pbrRenderAllowed() {
		return this._generating == false && this._generated == true;
	}
	markAsNotGenerated() {
		this._generated = false;
	}
	renderRealtime(scene: Scene, camera: PhysicalCamera) {
		if (!this.pbrRenderAllowed()) {
			this.webGLRenderer.render(scene, camera);

			return;
		}
		const maxSamplesCount = this.maxSamplesCount;
		if (this.pathTracingRenderer.samples >= maxSamplesCount) {
			return;
		}

		this.pathTracingRenderer.material.physicalCamera.updateFrom(camera);
		this._preRender(camera);

		this.pathTracingRenderer.update();

		if (this.pathTracingRenderer.samples < 1) {
			this.webGLRenderer.render(scene, camera);
		}

		this._postRender();
	}
	private _preRender(camera: Camera) {
		this.pathTracingRenderer.camera = camera;
		camera.updateMatrixWorld();
		this._resetIfCameraUpdated(camera);
	}
	private _postRender() {
		this.webGLRenderer.autoClear = false;
		const quad = this._denoiseActive ? this.denoiseQuad : this.fsQuad;
		const mat = this._denoiseActive ? this.denoiseMat : this.fsQuadMat;
		mat.map = this.pathTracingRenderer.target.texture;
		quad.render(this.webGLRenderer);
		this.webGLRenderer.autoClear = true;
	}
	samplesCount() {
		return Math.floor(this.pathTracingRenderer.samples);
	}
	getPixelRatio() {
		return this.webGLRenderer.getPixelRatio();
	}
	compile(scene: Object3D<Object3DEventMap>, camera: Camera, targetScene: Scene | null | undefined) {
		return this.webGLRenderer.compile(scene, camera, targetScene);
	}
	dispose(): void {
		// Note:
		// it's best NOT to dispose the renderers here,
		// so that we can switch from one camera to the other in the editor.
		// If we were to dispose, re-using the renderers would fail.
		// this.webGLRenderer.dispose();
		// this.pathTracingRenderer.dispose();
		// this.fsQuadMat.dispose();
	}
	setSize(w: number, h: number, setStyle: boolean) {
		this.webGLRenderer.setSize(w, h, setStyle);

		this.pathTracingRenderer.setSize(
			w * this.resolutionScale * window.devicePixelRatio,
			h * this.resolutionScale * window.devicePixelRatio
		);
		this.pathTracingRenderer.reset();
	}
	setRenderTarget(
		renderTarget: WebGLRenderTarget | WebGLMultipleRenderTargets | null,
		activeCubeFace?: number | undefined,
		activeMipmapLevel?: number | undefined
	) {
		this.webGLRenderer.setRenderTarget(renderTarget, activeCubeFace, activeMipmapLevel);
	}
	readRenderTargetPixels(
		renderTarget: WebGLRenderTarget | WebGLMultipleRenderTargets,
		x: number,
		y: number,
		width: number,
		height: number,
		buffer: Float32Array,
		activeCubeFaceIndex?: number | undefined
	) {
		return this.webGLRenderer.readRenderTargetPixels(
			renderTarget,
			x,
			y,
			width,
			height,
			buffer,
			activeCubeFaceIndex
		);
	}
	get capabilities(): WebGLCapabilities {
		return this.webGLRenderer.capabilities;
	}

	private _generator = new PathTracingSceneGenerator();
	private _workerGenerator: PathTracingSceneWorker | undefined;
	private _generateRequired = false;
	async generate(scene: Scene) {
		if (this._generating) {
			this._generateRequired = true;
			return;
		}
		console.warn('GENERATOR START');
		this._generated = false;
		this._generating = true;
		const timeStart = performance.now();

		const _restartIfRequired = () => {
			if (this._generateRequired) {
				this._generateRequired = false;
				this._generating = false;
				console.log('GENERATOR RESTART...');
				const _this = this;
				function generate() {
					_this.generate(scene);
				}
				setTimeout(generate, 20);
				return true;
			}
		};

		const bgTexture = scene.environment;
		if (bgTexture) {
			const generator = new BlurredEnvMapGenerator(this.webGLRenderer);
			const blurredTex = generator.generate(bgTexture, this.backgroundBlur);
			this.pathTracingRenderer.material.envMapInfo.updateFrom(blurredTex);
			await CoreSleep.sleep(20);
		}

		if (_restartIfRequired()) {
			return;
		}

		// update matrices
		scene.updateMatrixWorld(true);

		prepareScene(scene);

		const generateInThread = () => {
			this._generator = this._generator || new PathTracingSceneGenerator();
			return this._generator.generate(scene);
		};
		const generateInWorker = async () => {
			this._workerGenerator = this._workerGenerator || new PathTracingSceneWorker();
			const result = await this._workerGenerator.generate(scene, {
				onProgress: (progress: number) => {},
			});
			return result;
		};
		let result: GeneratorResult | undefined;
		try {
			result = this._useWorker ? await generateInWorker() : generateInThread();
		} catch (err) {
			console.error(err);
			this._generating = false;
			return;
		}

		restoreScene(scene);
		await CoreSleep.sleep(20);
		if (_restartIfRequired()) {
			return;
		}
		const {bvh, textures, materials, lights} = result;
		const geometry = bvh.geometry;
		const material = this.pathTracingRenderer.material;

		material.bvh.updateFrom(bvh);
		material.attributesArray.updateFrom(
			geometry.attributes.normal,
			geometry.attributes.tangent,
			geometry.attributes.uv,
			geometry.attributes.color
		);
		material.materialIndexAttribute.updateFrom(geometry.attributes.materialIndex);
		material.textures.setTextures(this.webGLRenderer, 1024, 1024, textures);
		material.materials.updateFrom(materials, textures);
		// lights
		const iesTextures = lights.map((light) => light.iesTexture);
		material.iesProfiles.updateFrom(this.webGLRenderer, iesTextures);
		material.lights.updateFrom(lights, iesTextures);
		await CoreSleep.sleep(20);

		if (_restartIfRequired()) {
			return;
		}
		this._generating = false;
		this._generated = true;
		this.reset();
		console.log('GENERATOR DONE', performance.now() - timeStart);
	}
	reset() {
		if (!this._generated) {
			return;
		}

		//
		// in order to avoid too frequent .reset() calls,
		// make sure to toggle damping off on the camera orbit controls
		//
		this.pathTracingRenderer.reset();
	}

	private _previousCameraProjectionMatrix: Matrix4 = new Matrix4();
	private _previousCameraWorldMatrix: Matrix4 = new Matrix4();
	private _resetIfCameraUpdated(camera: Camera) {
		if (
			this._previousCameraProjectionMatrix.equals(camera.projectionMatrix) &&
			this._previousCameraWorldMatrix.equals(camera.matrixWorld)
		) {
			return;
		}
		this._previousCameraProjectionMatrix.copy(camera.projectionMatrix);
		this._previousCameraWorldMatrix.copy(camera.matrixWorld);
		this.reset();
	}
}

const previousParent: Map<Object3D, Object3D> = new Map();
function prepareScene(scene: Scene) {
	function _saveAndSetObjectState(object: Object3D) {
		if (!object.parent) {
			return;
		}

		previousParent.set(object, object.parent);
		object.parent.remove(object);
	}
	function _isValidMaterial(material: Material) {
		if (material instanceof LineBasicMaterial) {
			return false;
		}
		if (material instanceof MeshBasicMaterial) {
			return false;
		}
		return true;
	}
	function _isValidObject(object: Object3D) {
		if (object instanceof Line) {
			return false;
		}
		const material = (object as Mesh).material;
		if (CoreType.isArray(material)) {
			for (const mat of material) {
				if (!_isValidMaterial(mat)) {
					return false;
				}
			}
		} else {
			if (!_isValidMaterial(material)) {
				return false;
			}
		}
		return true;
	}

	const objectsToRemoveFromHierarchy: Object3D[] = [];
	scene.traverse((object) => {
		if (!_isValidObject(object)) {
			objectsToRemoveFromHierarchy.push(object);
		}
	});
	for (const object of objectsToRemoveFromHierarchy) {
		_saveAndSetObjectState(object);
	}
}

function restoreScene(scene: Scene) {
	previousParent.forEach((parent, object) => {
		parent.add(object);
	});

	previousParent.clear();
}
