import {Scene} from 'three/src/scenes/Scene';
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {HalfFloatType, FloatType} from 'three/src/constants';
import {MeshPhongMaterial} from 'three/src/materials/MeshPhongMaterial';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {Material} from 'three/src/materials/Material';
import {PlaneBufferGeometry} from 'three/src/geometries/PlaneGeometry';
import {Mesh} from 'three/src/objects/Mesh';
import {Object3D} from 'three/src/core/Object3D';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Camera} from 'three/src/cameras/Camera';
import {Light} from 'three/src/lights/Light';
import {Texture} from 'three/src/textures/Texture';
import {RenderTarget} from 'three/src/renderers/webgl/WebGLRenderLists';
import {Matrix4} from 'three/src/math/Matrix4';
import {Vector3} from 'three/src/math/Vector3';
import {Vector2} from 'three/src/math/Vector2';
import {Quaternion} from 'three/src/math/Quaternion';
import {CoreRenderBlur} from '../../../../core/render/Blur';

//
// adapted from https://threejs.org/examples/?q=light#webgl_shadowmap_progressive
//

interface MeshPhongMaterialWithUniforms extends MeshPhongMaterial {
	uniforms: {
		previousShadowMap: {value: Texture | null};
		iterationBlend: {value: number};
	};
}
interface MeshBasicMaterialWithUniforms extends MeshBasicMaterial {
	uniforms: {
		previousShadowMap: {value: Texture | null};
		pixelOffset: {value: number};
	};
}
interface ObjectState {
	material: Material | Material[];
	frustumCulled: boolean;
	parent: Object3D | null;
	castShadow: boolean;
	receiveShadow: boolean;
}
interface LightHierarchyState {
	matrixAutoUpdate: boolean;
	parent: Object3D | null;
}
interface LightMatrixState {
	matrix: Matrix4;
	position: Vector3;
}

interface Params {
	lightRadius: number;
	iterations: number;
	iterationBlend: number;
	blur: boolean;
	blurAmount: number;
}
export const DEFAULT_ITERATION_BLEND = 1 / 200;
export class LightMapController {
	private objectTargets: Mesh[] = [];
	private lights: Light[] = [];
	private scene = new Scene();
	private tinyTarget = new WebGLRenderTarget(1, 1);
	private buffer1Active = false;
	private firstUpdate = false;
	private progressiveLightMap1: WebGLRenderTarget;
	private progressiveLightMap2: WebGLRenderTarget;
	private uvMat: MeshPhongMaterialWithUniforms;
	private blurMaterial: MeshBasicMaterialWithUniforms | undefined;
	private blurringPlane: Mesh | undefined;
	private _params: Params = {
		lightRadius: 1,
		iterations: 1,
		iterationBlend: DEFAULT_ITERATION_BLEND,
		blur: false,
		blurAmount: 0,
	};
	constructor(private renderer: WebGLRenderer, private res: number = 1024) {
		// Create the Progressive LightMap Texture
		const format = /(Android|iPad|iPhone|iPod)/g.test(navigator.userAgent) ? HalfFloatType : FloatType;
		this.progressiveLightMap1 = new WebGLRenderTarget(this.res, this.res, {type: format});
		this.progressiveLightMap2 = new WebGLRenderTarget(this.res, this.res, {type: format});
		this._coreRenderBlur = this._createCoreRenderBlur(new Vector2(this.res, this.res));

		this.uvMat = this._createUVMat();
	}

	private _textureRenderTarget() {
		return this.progressiveLightMap2;
	}
	texture() {
		return this._textureRenderTarget().texture;
	}

	setParams(params: Params) {
		this._params.lightRadius = params.lightRadius;
		this._params.iterations = params.iterations;
		this._params.iterationBlend = params.iterationBlend;
		this._params.blur = params.blur;
		this._params.blurAmount = params.blurAmount;
	}

	/**
	 * Sets these objects' materials' lightmaps and modifies their uv2's.
	 * @param {Object3D} objects An array of objects and lights to set up your lightmap.
	 */
	init(objects: Mesh[], lights: Light[]) {
		this._reset();
		this._setObjects(objects);
		this._setLights(lights);
	}
	private _setObjects(objects: Array<Mesh>) {
		this.objectTargets = [];
		for (let mesh of objects) {
			if (this.blurringPlane == null) {
				this._initializeBlurPlane(this.res, this.progressiveLightMap1);
			}
			this.objectTargets.push(mesh);
		}
		this._saveObjectsState();
	}
	private _setLights(lights: Array<Light>) {
		this.lights = lights;
		for (let light of lights) {
			this._saveLightHierarchyState(light);
			this.scene.attach(light);
			this._saveLightMatrixState(light);
		}
	}

	/**
	 * This function renders each mesh one at a time into their respective surface maps
	 * @param {Camera} camera Standard Rendering Camera
	 * @param {number} iterationBlend When >1, samples will accumulate over time.
	 * @param {boolean} blurEdges  Whether to fix UV Edges via blurring
	 */
	private _objectStateByObject: WeakMap<Object3D, ObjectState> = new WeakMap();
	private _previousRenderTarget: RenderTarget | null = null;
	private _lightHierarchyStateByLight: WeakMap<Light, LightHierarchyState> = new WeakMap();
	private _lightMatrixStateByLight: WeakMap<Light, LightMatrixState> = new WeakMap();
	private _reset() {
		this.firstUpdate = false;
	}
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
		for (let object of this.objectTargets) {
			this._objectStateByObject.set(object, {
				frustumCulled: object.frustumCulled,
				material: object.material,
				parent: object.parent,
				castShadow: object.castShadow,
				receiveShadow: object.receiveShadow,
			});
			object.material = this.uvMat;
			object.frustumCulled = false;
			object.castShadow = true;
			object.receiveShadow = true;
			object.renderOrder = 1000 + i;
			this.scene.attach(object);
			i++;
		}
		this._previousRenderTarget = this.renderer.getRenderTarget();
	}
	private _moveLights() {
		const lightRadius = this._params.lightRadius;
		// const lightRotationVariation = this.pv.lightRotationVariation;
		for (let light of this.lights) {
			const state = this._lightMatrixStateByLight.get(light);
			if (state) {
				const position = state.position;
				// const rotation = state.rotation;
				light.position.x = lightRadius * position.x + (Math.random() - 0.5);
				light.position.y = lightRadius * position.y + (Math.random() - 0.5);
				light.position.z = lightRadius * position.z + (Math.random() - 0.5);
				// light.rotation.y = lightRotationVariation * rotation.y + (Math.random() - 0.5);
				// light.lookAt(new Vector3(0, 0, 0));
			}
		}
	}
	restoreState() {
		this._restoreObjectsState();
		this._restoreLightsState();
		this.renderer.setRenderTarget(this._previousRenderTarget);
	}
	private _restoreObjectsState() {
		for (let object of this.objectTargets) {
			const state = this._objectStateByObject.get(object);
			if (state) {
				object.frustumCulled = state.frustumCulled;
				object.castShadow = state.castShadow;
				object.receiveShadow = state.receiveShadow;
				object.material = state.material;
				const parent = state.parent;
				if (parent) {
					parent.add(object);
				}
			}
		}
	}
	private _restoreLightsState() {
		for (let light of this.lights) {
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
		if (!this.blurMaterial) {
			return;
		}
		if (this.blurringPlane == null) {
			return;
		}
		const iterations = this._params.iterations;
		this.blurMaterial.uniforms.pixelOffset.value = this._params.blurAmount / this.res;
		this.blurringPlane.visible = this._params.blur;
		this.uvMat.uniforms.iterationBlend.value = this._params.iterationBlend;

		for (let i = 0; i < iterations; i++) {
			this._moveLights();
			this._update(camera);
		}

		if (0)
			if (this._coreRenderBlur) {
				this._coreRenderBlur.applyBlur(this._textureRenderTarget(), this.renderer, 0.1, 0.1);
			}
	}

	private _update(camera: Camera) {
		if (!this.blurMaterial) {
			return;
		}

		const oldRenderTarget = this.renderer.getRenderTarget();
		// The blurring plane applies blur to the seams of the lightmap

		// Render once normally to initialize everything
		if (this.firstUpdate && 0) {
			this.renderer.setRenderTarget(this.tinyTarget); // Tiny for Speed
			this.renderer.render(this.scene, camera);
			this.firstUpdate = false;
		}

		// Ping-pong two surface buffers for reading/writing
		const activeMap = this.buffer1Active ? this.progressiveLightMap1 : this.progressiveLightMap2;
		const inactiveMap = this.buffer1Active ? this.progressiveLightMap2 : this.progressiveLightMap1;

		// Render the object's surface maps
		this.renderer.setRenderTarget(activeMap);
		this.uvMat.uniforms.previousShadowMap.value = inactiveMap.texture;
		this.blurMaterial.uniforms.previousShadowMap.value = inactiveMap.texture;
		this.buffer1Active = !this.buffer1Active;
		this.renderer.render(this.scene, camera);

		this.renderer.setRenderTarget(oldRenderTarget);
	}

	private _initializeBlurPlane(res: number, lightMap: WebGLRenderTarget) {
		this.blurMaterial = this._createBlurPlaneMaterial(res, lightMap);

		this.blurringPlane = new Mesh(new PlaneBufferGeometry(1, 1), this.blurMaterial);
		this.blurringPlane.name = 'Blurring Plane';
		this.blurringPlane.frustumCulled = false;
		this.blurringPlane.renderOrder = 0;
		this.blurMaterial.depthWrite = false;
		this.scene.add(this.blurringPlane);
	}

	private _createBlurPlaneMaterial(res: number, lightMap: WebGLRenderTarget) {
		const blurMaterial = new MeshBasicMaterial() as MeshBasicMaterialWithUniforms;
		blurMaterial.uniforms = {
			previousShadowMap: {value: null},
			pixelOffset: {value: 1.0 / res},
			// TODO: make sure this is not important
			// polygonOffset: true,
			// polygonOffsetFactor: -1,
			// polygonOffsetUnits: 3.0,
		};
		blurMaterial.onBeforeCompile = (shader) => {
			// Vertex Shader: Set Vertex Positions to the Unwrapped UV Positions
			shader.vertexShader =
				'#define USE_UV\n' +
				shader.vertexShader.slice(0, -2) +
				'	gl_Position = vec4((uv - 0.5) * 2.0, 1.0, 1.0); }';
			// Fragment Shader: Set Pixels to 9-tap box blur the current frame's Shadows
			const bodyStart = shader.fragmentShader.indexOf('void main() {');
			shader.fragmentShader =
				'#define USE_UV\n' +
				shader.fragmentShader.slice(0, bodyStart) +
				'	uniform sampler2D previousShadowMap;\n	uniform float pixelOffset;\n' +
				shader.fragmentShader.slice(bodyStart - 1, -2) +
				`	gl_FragColor.rgb = (
									texture2D(previousShadowMap, vUv + vec2( pixelOffset,  0.0        )).rgb +
									texture2D(previousShadowMap, vUv + vec2( 0.0        ,  pixelOffset)).rgb +
									texture2D(previousShadowMap, vUv + vec2( 0.0        , -pixelOffset)).rgb +
									texture2D(previousShadowMap, vUv + vec2(-pixelOffset,  0.0        )).rgb +
									texture2D(previousShadowMap, vUv + vec2( pixelOffset,  pixelOffset)).rgb +
									texture2D(previousShadowMap, vUv + vec2(-pixelOffset,  pixelOffset)).rgb +
									texture2D(previousShadowMap, vUv + vec2( pixelOffset, -pixelOffset)).rgb +
									texture2D(previousShadowMap, vUv + vec2(-pixelOffset, -pixelOffset)).rgb)/8.0;
				}`;

			// Set the LightMap Accumulation Buffer
			const uniforms = {
				previousShadowMap: {value: lightMap.texture},
				pixelOffset: {value: 0.5 / res},
			};
			shader.uniforms.previousShadowMap = uniforms.previousShadowMap;
			shader.uniforms.pixelOffset = uniforms.pixelOffset;
			blurMaterial.uniforms.previousShadowMap = uniforms.previousShadowMap;
			blurMaterial.uniforms.pixelOffset = uniforms.pixelOffset;

			// Set the new Shader to this
			blurMaterial.userData.shader = shader;
		};
		return blurMaterial;
	}

	private _createUVMat() {
		const mat = new MeshPhongMaterial() as MeshPhongMaterialWithUniforms;
		mat.uniforms = {
			previousShadowMap: {value: null},
			iterationBlend: {value: DEFAULT_ITERATION_BLEND},
		};
		mat.name = 'uvMat';
		mat.onBeforeCompile = (shader) => {
			// Vertex Shader: Set Vertex Positions to the Unwrapped UV Positions
			shader.vertexShader =
				'#define USE_LIGHTMAP\n' +
				shader.vertexShader.slice(0, -2) +
				'	gl_Position = vec4((uv2 - 0.5) * 2.0, 1.0, 1.0); }';

			// Fragment Shader: Set Pixels to average in the Previous frame's Shadows
			const bodyStart = shader.fragmentShader.indexOf('void main() {');
			shader.fragmentShader =
				'varying vec2 vUv2;\n' +
				shader.fragmentShader.slice(0, bodyStart) +
				'	uniform sampler2D previousShadowMap;\n	uniform float iterationBlend;\n' +
				shader.fragmentShader.slice(bodyStart - 1, -2) +
				`\nvec3 texelOld = texture2D(previousShadowMap, vUv2).rgb;
				gl_FragColor.rgb = mix(texelOld, gl_FragColor.rgb, iterationBlend);
				// gl_FragColor.rgb = vec3(vUv2,1.0);
			}`;

			// Set the Previous Frame's Texture Buffer and Averaging Window
			const uniforms = {
				previousShadowMap: {value: this.progressiveLightMap1.texture},
				iterationBlend: {value: DEFAULT_ITERATION_BLEND},
			};
			shader.uniforms.previousShadowMap = uniforms.previousShadowMap;
			shader.uniforms.iterationBlend = uniforms.iterationBlend;
			mat.uniforms.previousShadowMap = uniforms.previousShadowMap;
			mat.uniforms.iterationBlend = uniforms.iterationBlend;

			// Set the new Shader to this
			mat.userData.shader = shader;
		};
		return mat;
	}

	//
	//
	// BLUR
	//
	//
	private _coreRenderBlur: CoreRenderBlur | undefined;
	private _createCoreRenderBlur(res: Vector2) {
		return new CoreRenderBlur(res);
	}
}
