/**
 * Creates smooth shadows
 *
 *
 */

// https://github.com/mrdoob/three.js/blob/master/examples/webgl_shadow_contact.html
import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
import {FlagsControllerD} from '../utils/FlagsController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {HierarchyController} from './utils/HierarchyController';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Scene} from 'three/src/scenes/Scene';
import {Camera} from 'three/src/cameras/Camera';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Geometry} from '../../../modules/three/examples/jsm/deprecated/Geometry';
import {Material} from 'three/src/materials/Material';
import {Mesh} from 'three/src/objects/Mesh';
import {RenderHook} from '../../../core/geometry/Material';
import {TypeAssert} from '../../poly/Assert';
import {CameraHelper} from './utils/helpers/CameraHelper';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {MeshDepthMaterial} from 'three/src/materials/MeshDepthMaterial';
import {OrthographicCamera} from 'three/src/cameras/OrthographicCamera';
import {PlaneBufferGeometry} from 'three/src/geometries/PlaneGeometry';
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {Vector2} from 'three/src/math/Vector2';
import {Poly} from '../../Poly';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {TransformController, TransformedParamConfig} from './utils/TransformController';
import {Object3D} from 'three/src/core/Object3D';
import {CoreRenderBlur} from '../../../core/render/Blur';

enum ContactShadowUpdateMode {
	ON_RENDER = 'On Every Render',
	MANUAL = 'Manual',
}
const UPDATE_MODES: ContactShadowUpdateMode[] = [ContactShadowUpdateMode.ON_RENDER, ContactShadowUpdateMode.MANUAL];

class ContactShadowObjParamConfig extends TransformedParamConfig(NodeParamsConfig) {
	shadow = ParamConfig.FOLDER();
	/** @param distance from the ground up to which shadows are visible */
	dist = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param size of the plane on which shadows are rendered */
	planeSize = ParamConfig.VECTOR2([1, 1]);
	/** @param shadow resolution */
	shadowRes = ParamConfig.VECTOR2([256, 256]);
	/** @param blur amount */
	blur = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param toggle on to add a secondary blur, which may be useful to get rid of artefacts */
	tblur2 = ParamConfig.BOOLEAN(1);
	/** @param secondary blur amount */
	blur2 = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
		visibleIf: {tblur2: 1},
	});
	/** @param shadow darkness */
	darkness = ParamConfig.FLOAT(1);
	/** @param shadow opacity */
	opacity = ParamConfig.FLOAT(1);
	/** @param show helper */
	showHelper = ParamConfig.BOOLEAN(0);

	/** @param set update mode, which can be to update on every frame, or manually only */
	updateMode = ParamConfig.INTEGER(UPDATE_MODES.indexOf(ContactShadowUpdateMode.ON_RENDER), {
		callback: (node: BaseNodeType) => {
			ContactShadowObjNode.PARAM_CALLBACK_update_updateMode(node as ContactShadowObjNode);
		},
		menu: {
			entries: UPDATE_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param click to update shadow, when mode is manual */
	update = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			ContactShadowObjNode.PARAM_CALLBACK_updateManual(node as ContactShadowObjNode);
		},
		visibleIf: {updateMode: UPDATE_MODES.indexOf(ContactShadowUpdateMode.MANUAL)},
	});

	scene = ParamConfig.FOLDER();
	include = ParamConfig.STRING('');
	exclude = ParamConfig.STRING('');
	updateObjectsList = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			ContactShadowObjNode.PARAM_CALLBACK_updateObjectsList(node as ContactShadowObjNode);
		},
	});
	printResolveObjectsList = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			ContactShadowObjNode.PARAM_CALLBACK_printResolveObjectsList(node as ContactShadowObjNode);
		},
	});
}
const ParamsConfig = new ContactShadowObjParamConfig();

const PLANE_WIDTH = 1;
const PLANE_HEIGHT = 1;
const CAMERA_HEIGHT = 1;
const DARKNESS = 1;
const DEFAULT_RENDER_TARGET_RES = new Vector2(256, 256);

export class ContactShadowObjNode extends TypedObjNode<Group, ContactShadowObjParamConfig> {
	paramsConfig = ParamsConfig;
	static type(): Readonly<'contactShadow'> {
		return 'contactShadow';
	}
	readonly hierarchyController: HierarchyController = new HierarchyController(this);
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	private _helper: CameraHelper | undefined;

	private _renderTarget = this._createRenderTarget(DEFAULT_RENDER_TARGET_RES);
	private _coreRenderBlur: CoreRenderBlur = this._createCoreRenderBlur(DEFAULT_RENDER_TARGET_RES);
	private _createRenderTarget(res: Vector2) {
		const renderTarget = new WebGLRenderTarget(res.x, res.y);
		renderTarget.texture.generateMipmaps = false;
		return renderTarget;
	}
	private _createCoreRenderBlur(res: Vector2) {
		return new CoreRenderBlur(res);
	}

	private _shadowGroup: Group | undefined;
	private _plane: Mesh | undefined;
	private _planeMaterial: MeshBasicMaterial | undefined;
	// private _fillPlaneMaterial: MeshBasicMaterial | undefined;

	private _includedObjects: Object3D[] = [];
	private _includedAncestors: Object3D[] = [];
	private _excludedObjects: Object3D[] = [];

	createObject() {
		const group = new Group();
		this._shadowGroup = new Group();
		group.add(this._shadowGroup);
		this._shadowGroup.name = 'shadowGroup';

		const planeGeometry = new PlaneBufferGeometry(PLANE_WIDTH, PLANE_HEIGHT).rotateX(-Math.PI / 2);
		// update uvs
		const uvArray = planeGeometry.getAttribute('uv').array as number[];
		for (let index of [1, 3, 5, 7]) {
			uvArray[index] = 1 - uvArray[index];
		}
		this._planeMaterial = new MeshBasicMaterial({
			map: this._renderTarget.texture,
			opacity: 1,
			transparent: true,
			depthWrite: false,
		});
		// this._renderTarget.texture.flipY = true;
		this._plane = new Mesh(planeGeometry, this._planeMaterial);
		// make sure it's rendered after the fillPlane
		this._plane.renderOrder = 1;
		// the y from the texture is flipped!
		// this._plane.scale.y = -1;

		this._plane.matrixAutoUpdate = false;
		this._shadowGroup.add(this._plane);

		// the plane with the color of the ground
		// this._fillPlaneMaterial = new MeshBasicMaterial({
		// 	color: 0xffffff,
		// 	opacity: OPACITY,
		// 	transparent: true,
		// 	depthWrite: false,
		// });
		// const fillPlane = new Mesh(planeGeometry, this._fillPlaneMaterial);
		// fillPlane.rotateX(Math.PI);
		// this._shadowGroup.add(fillPlane);

		this._createDepthCamera(this._shadowGroup);
		this._createMaterials();

		return group;
	}
	readonly transformController: TransformController = new TransformController(this);
	initializeNode() {
		this.hierarchyController.initializeNode();
		this.transformController.initializeNode();

		this._updateShadowGroupVisibility();
		this._updateHelperVisibility();
		this.flags.display.onUpdate(() => {
			this._updateShadowGroupVisibility();
			this._updateHelperVisibility();
		});
	}
	async cook() {
		this.transformController.update();
		this._updateRenderHook();
		this._updateHelperVisibility();
		this._updateObjectsList();

		if (this._planeMaterial) {
			this._planeMaterial.opacity = this.pv.opacity;
		}
		this._darknessUniform.value = this.pv.darkness;

		// update planes size
		if (this._plane && this._shadowCamera && this._helper) {
			this._plane.scale.x = this.pv.planeSize.x;
			this._plane.scale.z = this.pv.planeSize.y;
			this._plane.updateMatrix();

			this._shadowCamera.left = -this.pv.planeSize.x / 2;
			this._shadowCamera.right = this.pv.planeSize.x / 2;
			this._shadowCamera.bottom = -this.pv.planeSize.y / 2;
			this._shadowCamera.top = this.pv.planeSize.y / 2;
			this._shadowCamera.far = this.pv.dist;
			this._shadowCamera.updateProjectionMatrix();
			this._helper.update();
		}
		// update renderTargets if needed
		if (this._renderTarget.width != this.pv.shadowRes.x || this._renderTarget.height != this.pv.shadowRes.y) {
			if (this._planeMaterial) {
				this._renderTarget = this._createRenderTarget(this.pv.shadowRes);
				this._coreRenderBlur = this._createCoreRenderBlur(this.pv.shadowRes);
				this._planeMaterial.map = this._renderTarget.texture;
			}
		}

		this.cookController.endCook();
	}

	private _shadowCamera: OrthographicCamera | undefined;
	private _createDepthCamera(group: Group) {
		// the camera to render the depth material from
		this._shadowCamera = new OrthographicCamera(
			-PLANE_WIDTH / 2,
			PLANE_WIDTH / 2,
			PLANE_HEIGHT / 2,
			-PLANE_HEIGHT / 2,
			0,
			CAMERA_HEIGHT
		);
		// this._shadowCamera.rotation.z = Math.PI / 2;
		this._shadowCamera.rotation.x = Math.PI / 2; // get the camera to look up
		// this._shadowCamera.position.y = 0.1;
		group.add(this._shadowCamera);

		this._helper = new CameraHelper(this._shadowCamera);
		this._helper.visible = false;
		this._shadowCamera.add(this._helper);
	}

	private _depthMaterial: MeshDepthMaterial | undefined;
	private _darknessUniform = {value: DARKNESS};
	private _createMaterials() {
		// like MeshDepthMaterial, but goes from black to transparent
		this._depthMaterial = new MeshDepthMaterial();
		this._depthMaterial.onBeforeCompile = (shader) => {
			shader.uniforms.darkness = this._darknessUniform;
			shader.fragmentShader = /* glsl */ `
			uniform float darkness;
			${shader.fragmentShader.replace(
				'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
				'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'
			)}
		`;
		};
		this._depthMaterial.depthTest = false;
		this._depthMaterial.depthWrite = false;
	}

	private _emptyOnBeforeRender = () => {};
	private _renderShadow(renderer: WebGLRenderer, scene: Scene) {
		if (!this._helper) {
			return;
		}
		if (!this._depthMaterial) {
			return;
		}
		if (!this._shadowCamera) {
			return;
		}
		if (!this._helper) {
			return;
		}
		if (!this._plane) {
			return;
		}

		// save current state
		const previousOnBeforeRender = this._plane.onBeforeRender;
		const initialBackground = scene.background;
		const helperVisible = this._helper.visible;

		// prepare scene
		scene.background = null;
		this._plane.onBeforeRender = this._emptyOnBeforeRender;
		this._helper.visible = false;
		scene.overrideMaterial = this._depthMaterial;
		this._initVisibility(scene);

		// render to the render target to get the depths
		renderer.setRenderTarget(this._renderTarget);
		renderer.render(scene, this._shadowCamera);

		this._coreRenderBlur.applyBlur(this._renderTarget, renderer, this.pv.blur, this.pv.blur);

		if (isBooleanTrue(this.pv.tblur2)) {
			this._coreRenderBlur.applyBlur(this._renderTarget, renderer, this.pv.blur2, this.pv.blur2);
		}

		// reset and render the normal scene
		this._restoreVisibility(scene);
		scene.overrideMaterial = null;
		this._helper.visible = helperVisible;
		renderer.setRenderTarget(null);
		scene.background = initialBackground;
		this._plane.onBeforeRender = previousOnBeforeRender;
	}

	private _updateShadowGroupVisibility() {
		if (!this._shadowGroup) {
			return;
		}
		if (this.flags.display.active()) {
			this._shadowGroup.visible = true;
		} else {
			this._shadowGroup.visible = false;
		}
	}

	private _updateHelperVisibility() {
		if (!this._helper) {
			return;
		}
		if (this.flags.display.active() && isBooleanTrue(this.pv.showHelper)) {
			this._helper.visible = true;
		} else {
			this._helper.visible = false;
		}
	}

	private _updateRenderHook() {
		const mode = UPDATE_MODES[this.pv.updateMode];
		switch (mode) {
			case ContactShadowUpdateMode.ON_RENDER: {
				return this._addRenderHook();
			}
			case ContactShadowUpdateMode.MANUAL: {
				return this._removeRenderHook();
			}
		}
		TypeAssert.unreachable(mode);
	}

	private _addRenderHook() {
		if (!this._plane) {
			return;
		}
		if (this._plane.onBeforeRender != this._on_object_before_render_bound) {
			this._plane.onBeforeRender = this._on_object_before_render_bound;
		}
	}
	private _emptyRenderHook = () => {};
	private _removeRenderHook() {
		if (!this._plane) {
			return;
		}
		if (this._plane.onBeforeRender != this._emptyRenderHook) {
			this._plane.onBeforeRender = this._emptyRenderHook;
		}
	}
	private _on_object_before_render_bound: RenderHook = this._update.bind(this);
	// private _previous_on_before_render: RenderHook | undefined;
	private _update(
		renderer?: WebGLRenderer,
		scene?: Scene,
		camera?: Camera,
		geometry?: BufferGeometry | Geometry,
		material?: Material,
		group?: Group | null
	) {
		if (!renderer || !scene) {
			console.log('no renderer or scene');
			return;
		}
		this._renderShadow(renderer, scene);
	}
	private _updateManual() {
		const renderer = Poly.renderersController.firstRenderer();
		if (!renderer) {
			console.log('no renderer found');
			return;
		}
		const scene = this.scene().threejsScene();
		this._renderShadow(renderer, scene);
	}

	//
	//
	// ACTIVE
	//
	//
	static PARAM_CALLBACK_update_updateMode(node: ContactShadowObjNode) {
		node._updateRenderHook();
	}

	//
	//
	// UPDATE
	//
	//
	static PARAM_CALLBACK_updateManual(node: ContactShadowObjNode) {
		node._updateManual();
	}

	//
	//
	// UPDATE OBJECTS LIST
	//
	//
	static PARAM_CALLBACK_updateObjectsList(node: ContactShadowObjNode) {
		node._updateObjectsList();
	}
	private _updateObjectsList() {
		if (this.pv.include != '') {
			this._includedObjects = this.scene().objectsByMask(this.pv.include);
		} else {
			this._includedObjects = [];
		}
		// we also need to add the parents of this._includedObjects,
		// as otherwise those will be hidden, indirectly hidding this._includedObjects
		const parentsMap: Map<string, Object3D> = new Map();
		for (let object of this._includedObjects) {
			object.traverseAncestors((parent) => {
				parentsMap.set(parent.uuid, parent);
			});
		}
		this._includedAncestors = [];
		parentsMap.forEach((parent, uuid) => {
			this._includedAncestors.push(parent);
		});

		// add excluded
		if (this.pv.exclude != '') {
			this._excludedObjects = this.scene().objectsByMask(this.pv.exclude);
		} else {
			this._excludedObjects = [];
		}
	}

	static PARAM_CALLBACK_printResolveObjectsList(node: ContactShadowObjNode) {
		node._printResolveObjectsList();
	}
	private _printResolveObjectsList() {
		console.log('included objects:');
		console.log(this._includedObjects);
		console.log('included parents:');
		console.log(this._includedAncestors);
		console.log('excluded objects:');
		console.log(this._excludedObjects);
	}

	private _initialVisibilityState: WeakMap<Object3D, boolean> = new WeakMap();
	private _initVisibility(scene: Scene) {
		// if at least one object is included,
		// this means those which are not are to be hidden.
		// Therefore, we then have to traverse the whole scene.
		// If none is specified in included, we do not need to traverse
		if (this._includedObjects.length > 0) {
			scene.traverse((object) => {
				this._initialVisibilityState.set(object, object.visible);
				object.visible = false;
			});
		} else {
			this._storeObjectsVisibility(this._includedObjects);
			this._storeObjectsVisibility(this._includedAncestors);
			this._storeObjectsVisibility(this._excludedObjects);
		}

		this._setObjectsVisibility(this._includedObjects, true);
		this._setObjectsVisibility(this._includedAncestors, true);
		this._setObjectsVisibility(this._excludedObjects, false);
	}
	private _storeObjectsVisibility(objects: Object3D[]) {
		for (let object of objects) {
			this._initialVisibilityState.set(object, object.visible);
		}
	}
	private _setObjectsVisibility(objects: Object3D[], visible: boolean) {
		for (let object of objects) {
			object.visible = visible;
		}
	}

	private _restoreVisibility(scene: Scene) {
		if (this._includedObjects.length > 0) {
			scene.traverse((object) => {
				const state = this._initialVisibilityState.get(object);
				if (state) object.visible = state;
			});
		} else {
			this._restoreObjectsVisibility(this._includedObjects);
			this._restoreObjectsVisibility(this._includedAncestors);
			this._restoreObjectsVisibility(this._excludedObjects);
		}
	}
	private _restoreObjectsVisibility(objects: Object3D[]) {
		for (let object of objects) {
			const state = this._initialVisibilityState.get(object);
			if (state) {
				object.visible = state;
			}
		}
	}
}
