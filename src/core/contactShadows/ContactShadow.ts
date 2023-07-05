import {
	WebGLRenderer,
	Mesh,
	Scene,
	MeshDepthMaterial,
	OrthographicCamera,
	Vector2,
	Object3D,
	WebGLRenderTarget,
	MeshBasicMaterial,
	RepeatWrapping,
	Vector3,
} from 'three';
// import {BufferGeometry} from 'three';
import {CameraHelper} from '../helpers/CameraHelper';
import {CoreRenderBlur} from '../render/Blur';
import {isBooleanTrue} from '../Type';
import {PolyScene} from '../../engine/scene/PolyScene';
import {CoreObjectType} from '../geometry/ObjectContent';
import {IUniformN} from '../../engine/nodes/utils/code/gl/Uniforms';

interface ContactShadowOptions {
	scene: PolyScene;
	mesh: Mesh;
	//
	dist: number;
	renderTargetSize: Vector2;
	darkness: number;
	//
	blur: number;
	tblur2: boolean;
	blur2: number;
	//
	renderAllObjects: boolean;
	objectsMask: string;
	showHelper: boolean;
}

function _createRenderTarget(res: Vector2) {
	const renderTarget = new WebGLRenderTarget(res.x, res.y);
	renderTarget.texture.generateMipmaps = false;
	renderTarget.texture.repeat.set(1, -1);
	renderTarget.texture.wrapS = renderTarget.texture.wrapT = RepeatWrapping;
	return renderTarget;
}
function _createCoreRenderBlur(res: Vector2) {
	return new CoreRenderBlur(res);
}
const _center = new Vector3();
const _size = new Vector3();

export class ContactShadowController {
	// camera
	private _shadowCamera: OrthographicCamera;
	// materials
	private _planeMaterial: MeshBasicMaterial;
	private _depthMaterial: MeshDepthMaterial;
	private _darknessUniform: IUniformN;
	// render
	public readonly renderTarget: WebGLRenderTarget;
	private _coreRenderBlur: CoreRenderBlur;
	// hooks
	private _emptyOnBeforeRender = () => {};
	// utils
	private _helper: CameraHelper;
	private _initialVisibilityState: WeakMap<Object3D, boolean> = new WeakMap();
	private _includedObjects: Set<Object3D> = new Set();
	// shorthands
	private _mesh: Mesh;
	private _scene: Scene;

	constructor(protected _options: ContactShadowOptions) {
		this._mesh = this._options.mesh;
		this._scene = this._options.scene.threejsScene();
		this._darknessUniform = {value: this._options.darkness};
		this.renderTarget = _createRenderTarget(this._options.renderTargetSize);
		this._coreRenderBlur = _createCoreRenderBlur(this._options.renderTargetSize);

		this._planeMaterial = new MeshBasicMaterial({
			map: this.renderTarget.texture,
			opacity: 1,
			transparent: true,
			depthWrite: false,
		});
		this._mesh.material = this._planeMaterial;

		const cameraObjects = this._createDepthCamera();
		this._shadowCamera = cameraObjects.camera;
		this._helper = cameraObjects.helper;
		this._mesh.add(this._shadowCamera);
		this._depthMaterial = this._createMaterials();

		this._mesh.onBeforeRender = this.renderShadow.bind(this);
	}

	renderShadow(renderer: WebGLRenderer, scene: Scene) {
		if (this._options.showHelper) {
			// update is required,
			// otherwise the helper is not displayed
			this._helper.update();
		}

		// save current state
		const previousOnBeforeRender = this._options.mesh.onBeforeRender;
		const initialBackground = scene.background;
		const helperVisible = this._helper.visible;

		// prepare scene
		scene.background = null;
		this._options.mesh.onBeforeRender = this._emptyOnBeforeRender;
		this._helper.visible = false;
		scene.overrideMaterial = this._depthMaterial;
		this._initVisibility(scene);

		// set renderer clear alpha
		const initialClearAlpha = renderer.getClearAlpha();
		renderer.setClearAlpha(0);

		// render to the render target to get the depths
		renderer.setRenderTarget(this.renderTarget);
		renderer.render(scene, this._shadowCamera);

		this._coreRenderBlur.applyBlur(this.renderTarget, renderer, this._options.blur, this._options.blur);

		if (isBooleanTrue(this._options.tblur2)) {
			this._coreRenderBlur.applyBlur(this.renderTarget, renderer, this._options.blur2, this._options.blur2);
		}

		// reset and render the normal scene
		this._restoreVisibility(scene);
		scene.overrideMaterial = null;
		this._helper.visible = helperVisible;
		renderer.setRenderTarget(null);
		renderer.setClearAlpha(initialClearAlpha);
		scene.background = initialBackground;
		this._mesh.onBeforeRender = previousOnBeforeRender;
	}

	private _createMaterials() {
		// like MeshDepthMaterial, but goes from black to transparent
		const depthMaterial = new MeshDepthMaterial();
		depthMaterial.onBeforeCompile = (shader) => {
			shader.uniforms.darkness = this._darknessUniform;
			shader.fragmentShader = /* glsl */ `
			uniform float darkness;
			${shader.fragmentShader.replace(
				'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
				'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'
			)}
		`;
		};
		depthMaterial.depthTest = false;
		depthMaterial.depthWrite = false;
		return depthMaterial;
	}
	private _createDepthCamera() {
		this._mesh.geometry.computeBoundingBox();
		if (this._mesh.geometry.boundingBox) {
			this._mesh.geometry.boundingBox.getCenter(_center);
			this._mesh.geometry.boundingBox.getSize(_size);
		} else {
			_center.set(0, 0, 0);
			_size.set(10, 0, 10);
		}

		const w = _size.x;
		const h = _size.z;
		const dist = this._options.dist;
		// the camera to render the depth material from
		const camera = new OrthographicCamera();
		camera.left = -w / 2;
		camera.right = w / 2;
		camera.bottom = -h / 2;
		camera.top = h / 2;
		camera.far = dist;
		camera.rotation.x = Math.PI / 2; // get the camera to look up
		camera.position.copy(_center);

		const helper = new CameraHelper(camera);
		helper.visible = this._options.showHelper;
		camera.add(helper);
		return {camera, helper};
	}

	/**
	 *
	 * VISIBILITY
	 *
	 */
	private _initVisibility(scene: Scene) {
		if (isBooleanTrue(this._options.renderAllObjects)) {
			return;
		}
		this._includedObjects.clear();
		// this._includedAncestors.clear()
		this._scene.traverse((object) => {
			this._initialVisibilityState.set(object, object.visible);
			object.visible = false;
		});
		this._options.scene.objectsController.traverseObjectsWithMask<CoreObjectType.THREEJS>(
			this._options.objectsMask,
			(object) => {
				object.visible = true;
				this._includedObjects.add(object as Object3D);
			},
			undefined
		);

		this._includedObjects.forEach((object) => {
			object.traverseAncestors((parent) => {
				parent.visible = true;
			});
		});
	}

	private _restoreVisibility(scene: Scene) {
		if (isBooleanTrue(this._options.renderAllObjects)) {
			return;
		}
		scene.traverse((object) => {
			const state = this._initialVisibilityState.get(object);
			if (state != null) object.visible = state;
		});
	}
}
