//
// adapted from https://threejs.org/examples/?q=light#webgl_shadowmap_progressive
//
import {
	Quaternion,
	Vector3,
	Light,
	Camera,
	WebGLRenderer,
	Object3D,
	Mesh,
	WebGLRenderTarget,
	Scene,
	BackSide,
	FrontSide,
	DoubleSide,
	// Color,
} from 'three';
import {
	LightMapControllerParams,
	ObjectState,
	LightHierarchyState,
	LightMatrixState,
	RENDER_TARGET_DEFAULT_SIZE,
	renderTargetFormat,
	renderTargetType,
} from './lightMap/Common';
import {BlurMaterial, setBlurMaterial} from './lightMap/BlurMaterial';
import {createBlurPlane} from './lightMap/BlurPlane';
import {RenderTargetsCombineMaterial, setRenderTargetsCombineMaterial} from './lightMap/RenderTargetsCombineMaterial';
import {createRenderTargetsCombinePlane} from './lightMap/RenderTargetsCombinePlane';
import {createLightMapMaterial, LightMapMaterial, setLightMapMaterial} from './lightMap/LightMapMaterial';
import {invertNormals} from './lightMap/LightMapUtils';
import {RenderTargetPair} from './lightMap/RenderTargetPair';

export class LightMapController {
	private objectTargets: Mesh[] = [];
	private lights: Light[] = [];
	private _scene = new Scene();
	private renderFlippedUvs = false;
	private nonFlippedRenderTargetPair: RenderTargetPair = new RenderTargetPair();
	private flippedRenderTargetPair: RenderTargetPair = new RenderTargetPair();
	private lightMapMaterial: LightMapMaterial;
	private blurMaterial: BlurMaterial;
	private blurPlane: Mesh;
	private renderTargetsCombineMaterial: RenderTargetsCombineMaterial;
	private renderTargetsCombinePlane: Mesh;
	private finalRenderTarget = new WebGLRenderTarget(RENDER_TARGET_DEFAULT_SIZE, RENDER_TARGET_DEFAULT_SIZE, {
		type: renderTargetType,
		format: renderTargetFormat,
	});
	private _params: LightMapControllerParams = {
		resolution: 1,
		lightRadius: 1,
		totalIterationsCount: 1,
		blur: false,
		blurAmount: 0,
	};
	constructor(private renderer: WebGLRenderer) {
		this.lightMapMaterial = createLightMapMaterial();

		const blurPlaneData = createBlurPlane();
		this.blurPlane = blurPlaneData.plane;
		this.blurMaterial = blurPlaneData.mat;

		const renderTargetsCombinePlaneData = createRenderTargetsCombinePlane();
		this.renderTargetsCombinePlane = renderTargetsCombinePlaneData.plane;
		this.renderTargetsCombineMaterial = renderTargetsCombinePlaneData.mat;
	}
	private setSize(w: number, h: number) {
		this.nonFlippedRenderTargetPair.setSize(w, h);
		this.flippedRenderTargetPair.setSize(w, h);
		this.finalRenderTarget.setSize(w, h);
	}

	renderTargetPair() {
		return this.renderFlippedUvs ? this.flippedRenderTargetPair : this.nonFlippedRenderTargetPair;
	}
	textureRenderTarget() {
		return this.finalRenderTarget;
	}

	setParams(params: LightMapControllerParams) {
		this._params.resolution = params.resolution;
		this._params.lightRadius = params.lightRadius;
		this._params.totalIterationsCount = params.totalIterationsCount;
		this._params.blur = params.blur;
		this._params.blurAmount = params.blurAmount;
		this.setSize(params.resolution, params.resolution);
	}

	setState(objects: Mesh[], lights: Light[]) {
		this._clearScene();

		this._scene.add(this.blurPlane);

		this._previousRenderTarget = this.renderer.getRenderTarget();
		this._setObjects(objects);
		this._setLights(lights);
	}
	private _clearScene() {
		let child: Object3D | undefined;
		while ((child = this._scene.children[0])) {
			this._scene.remove(child);
		}
	}
	private _setObjects(objects: Array<Mesh>) {
		this.objectTargets = [...objects];
		this._saveObjectsState();
	}
	private _setLights(lights: Array<Light>) {
		this.lights = lights;
		for (const light of lights) {
			this._saveLightHierarchyState(light);
			this._scene.attach(light);
			this._saveLightMatrixState(light);
		}
	}

	private _objectStateByObject: WeakMap<Object3D, ObjectState> = new WeakMap();
	private _previousRenderTarget: WebGLRenderTarget | null = null;
	private _lightHierarchyStateByLight: WeakMap<Light, LightHierarchyState> = new WeakMap();
	private _lightMatrixStateByLight: WeakMap<Light, LightMatrixState> = new WeakMap();

	private _saveLightHierarchyState(light: Light) {
		this._lightHierarchyStateByLight.set(light, {
			parent: light.parent,
			matrixAutoUpdate: light.matrixAutoUpdate,
		});
		light.matrixAutoUpdate = true;
	}
	private _t = new Vector3();
	private _q = new Quaternion();
	private _s = new Vector3();
	private _saveLightMatrixState(light: Light) {
		light.updateMatrix();
		light.matrix.decompose(this._t, this._q, this._s);
		this._lightMatrixStateByLight.set(light, {
			matrix: light.matrix.clone(),
			position: this._t.clone(),
		});
	}
	private _saveObjectsState() {
		let i = 0;
		for (const object of this.objectTargets) {
			this._objectStateByObject.set(object, {
				frustumCulled: object.frustumCulled,
				material: object.material,
				parent: object.parent,
				renderOrder: object.renderOrder,
			});
			object.material = this.lightMapMaterial;
			object.frustumCulled = false;
			object.renderOrder = 1000 + i;
			this._scene.attach(object);

			i++;
		}
	}
	private _moveLights() {
		const lightRadius = this._params.lightRadius;
		for (const light of this.lights) {
			const state = this._lightMatrixStateByLight.get(light);
			if (state) {
				const position = state.position;
				light.position.x = position.x + lightRadius * (Math.random() - 0.5);
				light.position.y = position.y + lightRadius * (Math.random() - 0.5);
				light.position.z = position.z + lightRadius * (Math.random() - 0.5);
			}
		}
	}
	restoreState() {
		this._restoreObjectsState();
		this._restoreLightsState();
		this.renderer.setRenderTarget(this._previousRenderTarget);
	}
	private _invertObjects() {
		for (const object of this.objectTargets) {
			invertNormals(object);
		}
	}
	private _restoreObjectsState() {
		for (const object of this.objectTargets) {
			const state = this._objectStateByObject.get(object);
			if (state) {
				object.frustumCulled = state.frustumCulled;
				object.renderOrder = state.renderOrder;
				object.material = state.material;
				const parent = state.parent;
				if (parent) {
					parent.add(object);
				}
			}
		}
	}

	private _restoreLightsState() {
		for (const light of this.lights) {
			const stateH = this._lightHierarchyStateByLight.get(light);
			const stateM = this._lightMatrixStateByLight.get(light);
			if (stateH && stateM) {
				light.matrixAutoUpdate = stateH.matrixAutoUpdate;
				light.matrix.copy(stateM.matrix);
				light.matrix.decompose(light.position, light.quaternion, light.scale);
				light.updateMatrix();
				stateH.parent?.attach(light);
			}
		}
	}

	runUpdates(camera: Camera) {
		const totalIterationsCount = this._params.totalIterationsCount;

		// set up blur material
		this.blurMaterial.uniforms.pixelOffset.value = this._params.blurAmount / this._params.resolution;
		this.blurPlane.visible = this._params.blur;

		// set up lightmap material
		// this.lightMapMaterial.opacity = 1 / totalIterationsCount;
		this.lightMapMaterial.uniforms.lightMapMult.value = 1 / totalIterationsCount;
		// this.lightMapMaterial.uniforms.flipped.value = false;
		this.lightMapMaterial.side = FrontSide;
		this.lightMapMaterial.shadowSide = null;

		// capture front facing lightmap uvs
		this.renderFlippedUvs = false;
		this._clear(camera);
		for (let i = 0; i < totalIterationsCount; i++) {
			this._moveLights();
			this._update(camera);
		}
		// if (1 + 1) {
		// 	return;
		// }

		// capture back facing lightmap uvs
		this.renderFlippedUvs = true;
		this._clear(camera);
		this._invertObjects();
		// this.lightMapMaterial.uniforms.flipped.value = true;
		this.lightMapMaterial.side = [DoubleSide, BackSide][1];
		this.lightMapMaterial.shadowSide = BackSide;

		for (let i = 0; i < totalIterationsCount; i++) {
			this._moveLights();
			this._update(camera);
		}
		this._invertObjects();

		// combine both flipped and nonFlipped render targets
		this._clearScene();
		this._scene.add(this.renderTargetsCombinePlane);
		setRenderTargetsCombineMaterial(this.renderTargetsCombineMaterial, {
			rt1: this.flippedRenderTargetPair.current(),
			rt2: this.nonFlippedRenderTargetPair.current(),
		});
		this.renderer.setRenderTarget(this.finalRenderTarget);
		this.renderer.render(this._scene, camera);
	}

	private _clear(camera: Camera) {
		this._scene.visible = false;
		this._update(camera);
		this._update(camera);
		this._scene.visible = true;
	}

	private _update(camera: Camera) {
		// Ping-pong two surface buffers for reading/writing
		const rtPair = this.renderTargetPair();
		const activeMap = rtPair.current();
		const inactiveMap = rtPair.previous();

		// Render the object's surface maps
		this.renderer.setRenderTarget(activeMap);
		// this._scene.background = inactiveMap.texture;
		// this.lightMapMaterial.uniforms.previousLightMap.value = inactiveMap.texture;
		setLightMapMaterial(this.lightMapMaterial, {
			lightMap: inactiveMap,
			// lightMapMult:1 / totalIterationsCount,
		});
		// this.blurMaterial.uniforms.previousShadowMap.value = inactiveMap.texture;
		setBlurMaterial(this.blurMaterial, {
			res: this._params.resolution,
			lightMap: inactiveMap,
		});
		// this.buffer1Active = !this.buffer1Active;
		rtPair.toggle();
		this.renderer.render(this._scene, camera);
	}
}
