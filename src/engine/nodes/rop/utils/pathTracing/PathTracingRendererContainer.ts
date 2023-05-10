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
} from 'three';
import {Scene, Camera, MeshBasicMaterial} from 'three';
import {FullScreenQuad} from 'three/examples/jsm/postprocessing/Pass';
import {AbstractRenderer} from '../../../../viewers/Common';
// <<<<<<< HEAD
import {CoreType} from '../../../../../core/Type';
import {CoreSleep} from '../../../../../core/Sleep';
import {
	PathTracingRenderer,
	PathTracingSceneWorker,
	BlurredEnvMapGenerator,
	PhysicalCamera,
} from '../../../../../core/render/PBR/three-gpu-pathtracer';
import type {PathTracingRendererRopNode} from '../../PathTracingRenderer';

// type OnSampleCompleted = () => void;
// type OnFrameCompleted = () => Promise<void>;
// type SleepCallback = (duration: number) => Promise<void>;
// type TimeoutCallback = () => void;
// type SetTimeoutCallback = (callback: TimeoutCallback, duration: number) => void;
// type RequestAnimationFrame = (callback: TimeoutCallback) => number;

// interface RecordingStateOptions {
// 	isRecording: boolean;
// 	// onSampleCompleted?: OnSampleCompleted;
// 	onFrameCompleted?: OnFrameCompleted;
// 	sleepCallback?: SleepCallback;
// 	setTimeout?: SetTimeoutCallback;
// 	requestAnimationFrame?: RequestAnimationFrame;
// }
// const USE_DYNAMIC_GENERATOR = false;
// =======
// import type {PathTracingRenderer} from '../../../../../core/thirdParty/three-gpu-pathtracer';
// import {BlurredEnvMapGenerator, PathTracingSceneWorker} from '../../../../../core/thirdParty/three-gpu-pathtracer';
// >>>>>>> master

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
	maxSamplesCount: number;
	samplesPerAnimationFrame: number;
	f: Vector2;
}
export class PathTracingRendererContainer implements AbstractRenderer {
	public displayDebug = true;
	public backgroundBlur = 0.1;
	public maxSamplesCount = 1;
	public samplesPerAnimationFrame = 1;
	// public sequenceFrameFileName: string = 'frame';
	public frameRange = new Vector2();
	public resolutionScale = 0.5;
	public domElement: HTMLCanvasElement;
	private _generated = false;
	private _generating = false;
	public readonly isPathTracingRendererContainer = true;
	// private _isRecording = false;
	// protected _onSampleCompleted: OnSampleCompleted | undefined;
	// private _onFrameCompleted: OnFrameCompleted | undefined;
	// private _sleepCallback: SleepCallback | undefined;
	// private _setTimeout: SetTimeoutCallback | undefined;
	// private _requestAnimationFrame: RequestAnimationFrame | undefined;

	constructor(
		public readonly node: PathTracingRendererRopNode,
		public readonly webGLRenderer: WebGLRenderer,
		public readonly pathTracingRenderer: PathTracingRenderer,
		public readonly fsQuad: FullScreenQuad,
		public readonly fsQuadMat: MeshBasicMaterial
	) {
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

	// async sleep(duration: number) {
	// 	// console.log('sleep', duration, this._sleepCallback);
	// 	if (this._sleepCallback) {
	// 		await this._sleepCallback(duration);
	// 	} else {
	// 		await CoreSleep.sleep(duration);
	// 	}
	// }
	// setTimeout(callback: TimeoutCallback, duration: number) {
	// 	// console.log('setTimeout', duration, this._setTimeout, callback);
	// 	if (this._setTimeout) {
	// 		const _setTimeout = this._setTimeout;
	// 		_setTimeout(callback, duration);
	// 	} else {
	// 		setTimeout(callback, duration);
	// 	}
	// }
	// requestAnimationFrame(callback: TimeoutCallback) {
	// 	if (this._requestAnimationFrame) {
	// 		const _requestAnimationFrame = this._requestAnimationFrame;
	// 		return _requestAnimationFrame(callback);
	// 	} else {
	// 		return requestAnimationFrame(callback);
	// 	}
	// }
	// setRecordingState(options: RecordingStateOptions) {
	// 	this._isRecording = options.isRecording;
	// 	// this._onSampleCompleted = options.onSampleCompleted;
	// 	this._onFrameCompleted = options.onFrameCompleted;
	// 	this._sleepCallback = options.sleepCallback;
	// 	this._setTimeout = options.setTimeout;
	// 	this._requestAnimationFrame = options.requestAnimationFrame;

	// 	// this.render = this._isRecording ? this.renderRecording.bind(this) : this.renderRealtime.bind(this);
	// 	// console.log('switch', this._isRecording, this.render);
	// }
	// render = this.renderRealtime.bind(this);
	render(scene: Scene, camera: PhysicalCamera) {
		// if (this._isRecording) {
		// 	 this.renderRecording(scene, camera);
		// } else {
		this.renderRealtime(scene, camera);
		// }
	}
	//  renderRecording(scene: Scene, camera: Camera) {
	// 	// while (this._generating) {
	// 	// 	await this.sleep(50);
	// 	// }
	// 	// this.reset();
	// 	//await this.generate(scene, true);

	// 	this._preRender(camera);
	// 	this.pathTracingRenderer.reset();

	// 	const maxCount = 1;//this.samplesPerAnimationFrame;
	// 	for (let i = 0; i < maxCount; i++) {
	// 		this.pathTracingRenderer.update();
	// 		// this._postRender();
	// 		// if (this._onSampleCompleted) {
	// 		// 	this._onSampleCompleted();
	// 		// }
	// 		// if (i % 10 == 0) {
	// 		// await this.sleep(20);
	// 		// }
	// 	}
	// 	this._postRender();

	// 	// if(this.samplesCount()>=this.samplesPerAnimationFrame){
	// 	// 	if (this._onFrameCompleted) {
	// 	// 		//await this._onFrameCompleted();
	// 	// 	}
	// 	// }
	// 	// await CoreSleep.sleep(10);
	// }
	pbrRenderAllowed() {
		return this._generating == false && this._generated == true;
	}
	markAsNotGenerated() {
		this._generated = false;
	}
	renderRealtime(scene: Scene, camera: PhysicalCamera) {
		if (!this.pbrRenderAllowed()) {
			this.webGLRenderer.render(scene, camera);
			// if (!this._generating) {
			// 	this.generate(scene);
			// }
			return;
		}
		const maxSamplesCount = this.maxSamplesCount;
		if (this.pathTracingRenderer.samples >= maxSamplesCount) {
			return;
		}

		this.pathTracingRenderer.material.physicalCamera.updateFrom(camera);
		this._preRender(camera);

		// for (let i = 0; i < maxCount; i++) {

		// console.log(Math.round(this.pathTracingRenderer.samples));
		this.pathTracingRenderer.update();
		// await this.sleep(1);
		// }

		if (this.pathTracingRenderer.samples < 1) {
			this.webGLRenderer.render(scene, camera);
		}

		this._postRender();

		// if (this._onFrameCompleted) {
		// 	this._onFrameCompleted();
		// }
		// console.log('samples:', Math.floor(this.pathTracingRenderer.samples));
	}
	private _preRender(camera: Camera) {
		this.pathTracingRenderer.camera = camera;
		camera.updateMatrixWorld();
		this._resetIfCameraUpdated(camera);
	}
	private _postRender() {
		this.webGLRenderer.autoClear = false;
		this.fsQuadMat.map = this.pathTracingRenderer.target.texture;
		this.fsQuad.render(this.webGLRenderer);
		this.webGLRenderer.autoClear = true;
	}
	samplesCount() {
		return Math.floor(this.pathTracingRenderer.samples);
	}
	getPixelRatio() {
		return this.webGLRenderer.getPixelRatio();
	}
	compile(scene: Scene, camera: Camera) {
		return this.webGLRenderer.compile(scene, camera);
	}
	dispose(): void {
		// console.log('dispose');
		// this.webGLRenderer.dispose();
		this.pathTracingRenderer.dispose();
		this.fsQuadMat.dispose();
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

	// private _dynamicGenerator: DynamicPathTracingSceneGenerator | undefined;
	private _workerGenerator: PathTracingSceneWorker | undefined;
	private _generateRequired = false;
	async generate(scene: Scene) {
		// if (this._isRecording && allowWhileRecording == false) {
		// 	return;
		// }

		if (this._generating) {
			this._generateRequired = true;
			return;
		}
		console.log('GENERATOR START');
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

		// try {
		// if (this._generator) {
		// 	this._generator.reset();
		// 	this._generator.dispose();
		// }
		// this._generator.generate(scene, {
		// 	onProgress: (ratio: number) => {
		// 		console.log(ratio);
		// 	},
		// });
		if (_restartIfRequired()) {
			return;
		}
		// scene.traverse((object) => {
		// 	const nonMeshes: Object3D[] = [];
		// 	for (let child of object.children) {
		// 		if ((child as Light).isLight) {
		// 			nonMeshes.push(child);
		// 		}
		// 	}
		// 	for (let nonMesh of nonMeshes) {
		// 		object.remove(nonMesh);
		// 	}
		// });

		// update matrices
		scene.updateMatrixWorld(true);

		// const result = await this._generator.generate(scene);
		// this._generator.reset();
		prepareScene(scene);
		// if (USE_DYNAMIC_GENERATOR) {
		// 	// this._dynamicGenerator = this._dynamicGenerator || new DynamicPathTracingSceneGenerator(scene);
		// 	// this._dynamicGenerator.reset();
		// } else {
		this._workerGenerator = this._workerGenerator || new PathTracingSceneWorker();
		// this._workerGenerator.reset();
		// }
		const result = await this._workerGenerator.generate(scene, {
			onProgress: (progress: number) => {
				// console.log(progress);
			},
		});
		restoreScene(scene);
		await CoreSleep.sleep(20);
		if (_restartIfRequired()) {
			return;
		}
		const {bvh, textures, materials, lights} = result;
		const geometry = bvh.geometry;
		const material = this.pathTracingRenderer.material;
		// console.log('result', result, this._generator, bvh, material);

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
		// console.log({lights, iesTextures});
		material.iesProfiles.updateFrom(this.webGLRenderer, iesTextures);
		material.lights.updateFrom(lights, iesTextures);
		await CoreSleep.sleep(20);

		// this._generator.dispose();
		// this._generator = undefined;
		if (_restartIfRequired()) {
			return;
		}
		this._generating = false;
		this._generated = true;
		this.reset();
		console.log('GENERATOR DONE', performance.now() - timeStart);
		// } catch (err) {
		// 	console.log(err);
		// 	this._generating = false;
		// }
	}
	reset() {
		if (!this._generated) {
			return;
		}
		// if (this._isRecording) {
		// 	return;
		// }

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
			for (let mat of material) {
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
			// _saveAndSetObjectState(object);
		}
	});
	for (let object of objectsToRemoveFromHierarchy) {
		_saveAndSetObjectState(object);
	}
}

function restoreScene(scene: Scene) {
	previousParent.forEach((parent, object) => {
		parent.add(object);
	});

	previousParent.clear();
}
