import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Scene} from 'three/src/scenes/Scene';
import {RGBAFormat} from 'three/src/constants';
import {PlaneBufferGeometry} from 'three/src/geometries/PlaneGeometry';
import {OrthographicCamera} from 'three/src/cameras/OrthographicCamera';
import {Mesh} from 'three/src/objects/Mesh';
import {LinearFilter} from 'three/src/constants';
import {BokehShader, BokehDepthShader} from '../../three/examples/jsm/shaders/BokehShader2';
import {TransformControls} from 'three/examples/jsm/controls/TransformControls';
// import {CoreScene} from '../../../core/geometry/Scene';
// import DepthInstanceVertex from './BokehPass2/DepthInstance.vert.glsl';
import {IUniformN, IUniformTexture, IUniformV2} from '../../../engine/nodes/utils/code/gl/Uniforms';
import {Vector2} from 'three/src/math/Vector2';
import {Color} from 'three/src/math/Color';
import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
import {DepthOfFieldPostNode} from '../../../engine/nodes/post/DepthOfField';
import {Object3D} from 'three/src/core/Object3D';
import {ObjectWithCustomMaterials} from '../../../core/geometry/Material';
import {Material} from 'three/src/materials/Material';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {MeshDepthMaterial} from 'three/src/materials/MeshDepthMaterial';

interface BokehUniforms {
	tColor: IUniformTexture;
	tDepth: IUniformTexture;
	textureWidth: IUniformN;
	textureHeight: IUniformN;
	// public
	fstop: IUniformN;
	maxblur: IUniformN;
	threshold: IUniformN;
	gain: IUniformN;
	bias: IUniformN;
	fringe: IUniformN;
	dithering: IUniformN;
	// camera
	focalLength: IUniformN;
	znear: IUniformN;
	zfar: IUniformN;
	focalDepth: IUniformN;
	// booleans
	noise: IUniformN;
	pentagon: IUniformN;
	vignetting: IUniformN;
	depthblur: IUniformN;

	// debug
	shaderFocus: IUniformN;
	showFocus: IUniformN;
	manualdof: IUniformN;
	focusCoords: IUniformV2;

	[uniform: string]: IUniform;
}
// interface CameraUniforms {
// 	mNear: IUniformN;
// 	mFar: IUniformN;
// 	[propName: string]: IUniform;
// }

interface BokehShaderMaterial extends ShaderMaterial {
	uniforms: BokehUniforms;
	defines: {
		RINGS: number;
		SAMPLES: number;
	};
}

export class BokehPass2 {
	// private _coreScene: CoreScene;
	private static materialDepth = new MeshDepthMaterial(); //ShaderMaterial;
	// private materialDepthInstance: ShaderMaterial;
	// private _cameraUniforms: CameraUniforms = {mNear: {value: 0}, mFar: {value: 0}};
	// pass attributes
	public enabled: boolean = true;
	public needsSwap: boolean = true;
	public clear: boolean = true;
	public renderToScreen: boolean = true;
	// processing
	private _processingScene: Scene = new Scene();
	private _processingCamera: OrthographicCamera;
	private _rtTextureDepth: WebGLRenderTarget;
	private _rtTextureColor: WebGLRenderTarget;
	public bokehUniforms: BokehUniforms;
	public bokehMaterial: BokehShaderMaterial;
	private _quad: Mesh;
	public clearColor = new Color(1, 1, 1);
	public displayDepth = false;

	constructor(
		private _depthIfFieldNode: DepthOfFieldPostNode,
		private _scene: Scene,
		private _camera: PerspectiveCamera,
		private _resolution: Vector2
	) {
		// this._coreScene = new CoreScene(this._scene);
		const shaderSettings = {
			rings: 3,
			samples: 4,
		};

		this._processingCamera = new OrthographicCamera(
			this._resolution.x / -2,
			this._resolution.x / 2,
			this._resolution.y / 2,
			this._resolution.y / -2,
			-10000,
			10000
		);
		this._processingCamera.position.z = 100;

		this._processingScene.add(this._processingCamera);

		var pars = {minFilter: LinearFilter, magFilter: LinearFilter, format: RGBAFormat};
		this._rtTextureDepth = new WebGLRenderTarget(this._resolution.x, this._resolution.y, pars);
		this._rtTextureColor = new WebGLRenderTarget(this._resolution.x, this._resolution.y, pars);

		const bokehShader = BokehShader;
		if (!bokehShader) {
			console.error('BokehPass relies on BokehShader');
		}

		this.bokehUniforms = UniformsUtils.clone(bokehShader.uniforms);

		this.bokehUniforms['tColor'].value = this._rtTextureColor.texture;
		this.bokehUniforms['tDepth'].value = this._rtTextureDepth.texture;
		this.bokehUniforms['textureWidth'].value = this._resolution.x;
		this.bokehUniforms['textureHeight'].value = this._resolution.y;

		this.bokehMaterial = new ShaderMaterial({
			uniforms: this.bokehUniforms,
			vertexShader: bokehShader.vertexShader,
			fragmentShader: bokehShader.fragmentShader,
			defines: {
				RINGS: shaderSettings.rings,
				SAMPLES: shaderSettings.samples,
			},
		}) as BokehShaderMaterial;

		this._quad = new Mesh(new PlaneBufferGeometry(this._resolution.x, this._resolution.y), this.bokehMaterial);
		this._quad.position.z = -500;
		this._processingScene.add(this._quad);

		// depth shader
		var depthShader = BokehDepthShader;
		if (!depthShader) {
			console.error('BokehPass relies on BokehDepthShader');
		}

		// this.materialDepth = new ShaderMaterial({
		// 	uniforms: depthShader.uniforms,
		// 	vertexShader: depthShader.vertexShader,
		// 	fragmentShader: depthShader.fragmentShader,
		// });

		// add a shader similar to this.materialDepth, but that works with instances
		// this.materialDepthInstance = new ShaderMaterial({
		// 	uniforms: depthShader.uniforms,
		// 	vertexShader: DepthInstanceVertex,
		// 	fragmentShader: depthShader.fragmentShader,
		// });

		this.updateCameraUniformsWithNode(this._depthIfFieldNode, this._camera);
	}

	setSize(width: number, height: number) {
		this._rtTextureDepth.setSize(width, height);
		this._rtTextureColor.setSize(width, height);

		this.bokehUniforms['textureWidth'].value = width;
		this.bokehUniforms['textureHeight'].value = height;
	}

	dispose() {
		this._rtTextureDepth.dispose();
		this._rtTextureColor.dispose();
	}

	private _prevClearColor = new Color();
	render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget) {
		renderer.getClearColor(this._prevClearColor);
		renderer.setClearColor(this.clearColor);

		// TODO: try and make this work so it can be combined with other POST nodes
		// check how ShaderPass.js has implemented it
		renderer.clear();

		// render scene into texture

		renderer.setRenderTarget(this._rtTextureColor);
		renderer.clear();
		renderer.render(this._scene, this._camera);
		renderer.setClearColor(0x000000); // cancels the bg color

		this._withRemovedTransformControls(() => {
			// render depth into texture
			// this._coreScene.withOverridenMaterial(
			// 	this.materialDepth,
			// 	this.materialDepthInstance,
			// 	this._cameraUniforms,
			// 	() => {
			// 		if (this.displayDepth) {
			// 			renderer.setRenderTarget(null);
			// 		} else {
			// 			renderer.setRenderTarget(this._rtTextureDepth);
			// 		}
			// 		renderer.clear();
			// 		renderer.render(this._scene, this._camera);
			// 	}
			// );
			BokehPass2.updateObjectsWithDepthMaterial(this._scene, () => {
				if (this.displayDepth) {
					renderer.setRenderTarget(null);
				} else {
					renderer.setRenderTarget(this._rtTextureDepth);
				}
				renderer.clear();
				renderer.render(this._scene, this._camera);
			});
			// render bokeh composite

			if (!this.displayDepth) {
				renderer.setRenderTarget(null);
				renderer.clear();
				renderer.render(this._processingScene, this._processingCamera);
			}
		});

		renderer.setClearColor(this._prevClearColor);
	}

	private static _originalMaterialByObjectId: Map<Mesh, Material | Material[]> = new Map();
	static updateObjectsWithDepthMaterial(scene: Scene, callback: () => void) {
		// let assignedMaterial: MaterialWithUniforms;
		// this._originalMaterialByObjectId.clear()

		scene.traverse((object3d: Object3D) => {
			const object = object3d as ObjectWithCustomMaterials;
			if (object.material) {
				const geometry = object.geometry as BufferGeometry;
				if (geometry) {
					const customMaterial = object.customDepthDOFMaterial || this.materialDepth;
					// if (customMaterial) {
					this._originalMaterialByObjectId.set(object as Mesh, object.material);
					object.material = customMaterial;
					// assignedMaterial = customMaterial as MaterialWithUniforms;
					// if (assignedMaterial.uniforms) {
					// 	for (let k of Object.keys(uniforms)) {
					// 		assignedMaterial.uniforms[k].value = uniforms[k].value;
					// 	}
					// }
					// }
					// } else {
					// 	if (CoreGeometry.markedAsInstance(geometry)) {
					// 		assignedMaterial = instanceMaterial as MaterialWithUniforms;
					// 	} else {
					// 		assignedMaterial = baseMaterial as MaterialWithUniforms;
					// 	}
					// }

					// if (assignedMaterial) {
					// 	this._originalMaterialByObjectId.set(object.uuid, object.material);
					// 	object.material = assignedMaterial;
					// }

					// if( CoreGeometry.markedAsInstance(geometry) ){
					// 	object.material = instance_material
					// } else {
					// 	object.material = base_material
					// }
				}
			}
		});

		callback();

		this._originalMaterialByObjectId.forEach((material, object) => {
			object.material = material;
		});

		// this._scene.traverse((object3d: Object3D) => {
		// 	const object = object3d as Mesh;
		// 	if (object.material) {
		// 		const geometry = object.geometry;
		// 		if (geometry) {
		// 			const mat = this._originalMaterialByObjectId.get(object.uuid);
		// 			if (mat) {
		// 				object.material = mat;
		// 			}
		// 		}
		// 	}
		// });

		this._originalMaterialByObjectId.clear();
	}

	updateCameraUniformsWithNode(node: DepthOfFieldPostNode, camera: PerspectiveCamera) {
		// from camera
		this.bokehUniforms['focalLength'].value = camera.getFocalLength();
		this.bokehUniforms['znear'].value = camera.near;
		this.bokehUniforms['zfar'].value = camera.far;

		// focal length
		var sdistance = DepthOfFieldPostNode.smoothstep(camera.near, camera.far, node.pv.focalDepth);
		var ldistance = DepthOfFieldPostNode.linearize(1 - sdistance, camera.near, camera.far);
		this.bokehUniforms['focalDepth'].value = ldistance; //this._param_focal_depth

		// depth materials
		// this._cameraUniforms = {
		// 	mNear: {value: camera.near},
		// 	mFar: {value: camera.far},
		// };
		// for (let material of [this.materialDepth, this.materialDepthInstance]) {
		// 	material.uniforms['mNear'].value = this._cameraUniforms['mNear'].value;
		// 	material.uniforms['mFar'].value = this._cameraUniforms['mFar'].value;
		// }
	}

	// private _hiddenObjects: Set<Object3D> = new Set();
	private _previousParent: Map<Object3D, Object3D> = new Map();
	// private _previousMatrixAutoUpdate: WeakMap<Object3D, boolean> = new WeakMap();
	private _withRemovedTransformControls(callback: () => void) {
		this._scene.traverse((object) => {
			if (object instanceof TransformControls) {
				const parent = object.parent;
				if (parent) {
					this._previousParent.set(object, parent);
				}
			}
		});
		this._previousParent.forEach((parent, object) => {
			parent.remove(object);
		});

		callback();

		this._previousParent.forEach((parent, object) => {
			parent.add(object);
		});
		this._previousParent.clear();
	}

	// private _removeTransformControlsFromScene() {
	// }
	// private _restoreTransformControls() {

	// 	// this._hiddenObjects.forEach((object) => {
	// 	// 	object.visible = true;
	// 	// 	const previousMatrixAutoUpdate = this._previousMatrixAutoUpdate.get(object);
	// 	// 	if (previousMatrixAutoUpdate != null) {
	// 	// 		object.matrixAutoUpdate = previousMatrixAutoUpdate;
	// 	// 	}
	// 	// });
	// 	this._previousParent.clear();
	// }
}
