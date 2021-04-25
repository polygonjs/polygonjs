/**
 * Creates a light map
 *
 *
 */

// https://threejs.org/examples/?q=light#webgl_shadowmap_progressive
import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {Object3D} from 'three/src/core/Object3D';
import {Light} from 'three/src/lights/Light';
import {ProgressiveLightMap} from '../../../modules/three/examples/jsm/misc/ProgressiveLightMap';
import {Poly} from '../../Poly';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {Matrix4} from 'three/src/math/Matrix4';
import {Vector3} from 'three/src/math/Vector3';
import {Quaternion} from 'three';

enum LightMapUpdateMode {
	ON_RENDER = 'On Every Render',
	MANUAL = 'Manual',
}
const UPDATE_MODES: LightMapUpdateMode[] = [LightMapUpdateMode.ON_RENDER, LightMapUpdateMode.MANUAL];

interface LightHierarchyState {
	parent: Object3D | null;
	matrixAutoUpdate: boolean;
}
interface LightMatrixState {
	matrix: Matrix4;
	position: Vector3;
}

class LightMapObjParamConfig extends NodeParamsConfig {
	/** @param set update mode, which can be to update on every frame, or manually only */
	updateMode = ParamConfig.INTEGER(UPDATE_MODES.indexOf(LightMapUpdateMode.ON_RENDER), {
		callback: (node: BaseNodeType) => {
			LightMapObjNode.PARAM_CALLBACK_update_updateMode(node as LightMapObjNode);
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
			LightMapObjNode.PARAM_CALLBACK_updateManual(node as LightMapObjNode);
		},
		visibleIf: {updateMode: UPDATE_MODES.indexOf(LightMapUpdateMode.MANUAL)},
	});
	/** @param shadow resolution */
	lightMapRes = ParamConfig.INTEGER(1024);
	/** @param iterations */
	iterations = ParamConfig.INTEGER(1024);
	/** @param blendWindow */
	blendWindow = ParamConfig.INTEGER(200, {
		range: [1, 500],
		rangeLocked: [true, false],
	});
	/** @param blurEdges */
	blurEdges = ParamConfig.BOOLEAN(1);
	/** @param lightVariation */
	lightVariation = ParamConfig.FLOAT(1, {
		range: [0, 10],
	});

	objectsMask = ParamConfig.STRING('');
	lightsMask = ParamConfig.STRING('*');

	printResolveObjectsList = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			LightMapObjNode.PARAM_CALLBACK_printResolveObjectsList(node as LightMapObjNode);
		},
	});
}
const ParamsConfig = new LightMapObjParamConfig();

export class LightMapObjNode extends TypedObjNode<Group, LightMapObjParamConfig> {
	paramsConfig = ParamsConfig;
	static type(): Readonly<'lightMap'> {
		return 'lightMap';
	}
	private _progressiveLightMap: ProgressiveLightMap | undefined;
	private _includedObjects: Object3D[] = [];
	private _includedLights: Light[] = [];
	private _lightHierarchyStateByLight: WeakMap<Light, LightHierarchyState> = new WeakMap();
	private _lightMatrixStateByLight: WeakMap<Light, LightMatrixState> = new WeakMap();

	createObject() {
		const group = new Group();
		group.matrixAutoUpdate = false;

		return group;
	}
	initializeNode() {}
	async cook() {
		this._progressiveLightMap = this._progressiveLightMap || (await this._createProgressiveLightMap());
		this._setupProgressiveLightMap();

		this.cookController.endCook();
	}

	private async _createProgressiveLightMap() {
		const renderer = await Poly.renderersController.firstRenderer();
		if (!renderer) {
			console.warn('no renderer found');
			return;
		}
		const progressiveSurfacemap = new ProgressiveLightMap(renderer, this.pv.lightMapRes);
		return progressiveSurfacemap;
	}
	private _setupProgressiveLightMap() {
		if (this._progressiveLightMap) {
			const objects: Object3D[] = [];
			for (let object of this._includedObjects) {
				objects.push(object);
			}
			for (let light of this._includedLights) {
				objects.push(light);
			}
			this._progressiveLightMap.addObjectsToLightMap(objects);
		}
	}

	//
	//
	// ACTIVE
	//
	//
	static PARAM_CALLBACK_update_updateMode(node: LightMapObjNode) {
		// node._updateRenderHook();
	}

	//
	//
	// UPDATE
	//
	//
	private async _updateManual() {
		if (!this._progressiveLightMap) {
			return;
		}
		const masterCameraNode = this.scene().masterCameraNode();
		if (!masterCameraNode) {
			return;
		}
		this._updateObjectsAndLightsList();
		this._initLights();
		this._setupProgressiveLightMap();
		this._initLights2();
		const blendWindow = this.pv.blendWindow;
		const blurEdges = this.pv.blurEdges;

		const camera = masterCameraNode.camera();
		for (let i = 0; i < this.pv.iterations; i++) {
			this._moveLights();
			await this._progressiveLightMap.update(camera, blendWindow, blurEdges);
			if (!isBooleanTrue(this._progressiveLightMap.firstUpdate)) {
				this._progressiveLightMap.showDebugLightmap(true);
			}
		}
		this._restoreLights();
		console.log('updated');
	}
	static PARAM_CALLBACK_updateManual(node: LightMapObjNode) {
		node._updateManual();
	}

	private _initLights() {
		for (let light of this._includedLights) {
			this._lightHierarchyStateByLight.set(light, {
				parent: light.parent,
				matrixAutoUpdate: light.matrixAutoUpdate,
			});
			console.log('add state for', light, light.parent);
			light.matrixAutoUpdate = true;
		}
	}
	private _t = new Vector3();
	private _q = new Quaternion();
	private _s = new Vector3();
	private _initLights2() {
		for (let light of this._includedLights) {
			light.updateMatrix();
			light.matrix.decompose(this._t, this._q, this._s);
			this._lightMatrixStateByLight.set(light, {
				matrix: light.matrix.clone(),
				position: this._t.clone(),
			});
			console.log('add state for', light, light.parent);
		}
	}
	private _moveLights() {
		const lightVariation = this.pv.lightVariation;
		for (let light of this._includedLights) {
			const state = this._lightMatrixStateByLight.get(light);
			if (state) {
				const position = state.position;
				light.position.x = lightVariation * position.x + (Math.random() - 0.5);
				light.position.y = lightVariation * position.y + (Math.random() - 0.5);
				light.position.z = lightVariation * position.z + (Math.random() - 0.5);
				// light.lookAt(new Vector3(0, 0, 0));
			}
		}
	}
	private _restoreLights() {
		if (1) return;
		console.log('restore this._includedLights', this._includedLights);
		for (let light of this._includedLights) {
			const stateM = this._lightMatrixStateByLight.get(light);
			const stateH = this._lightHierarchyStateByLight.get(light);
			if (stateM && stateH) {
				// light.matrix.copy(stateM.matrix);
				// light.matrix.decompose(light.position, light.quaternion, light.scale);
				stateH.parent?.attach(light);
				light.matrixAutoUpdate = stateH.matrixAutoUpdate;
			} else {
				console.log('no state found for', light);
			}
		}
	}

	//
	//
	// UPDATE OBJECTS LIST
	//
	//
	private _updateObjectsAndLightsList() {
		let matchedObjects: Object3D[] = [];
		let matchedLights: Object3D[] = [];
		this._includedLights = [];
		this._includedObjects = [];
		const lightsByUuid: WeakSet<Object3D> = new WeakSet();
		if (this.pv.lightsMask != '') {
			matchedLights = this.scene().objectsByMask(this.pv.lightsMask);
			for (let matchedLight of matchedLights) {
				if (matchedLight instanceof Light) {
					this._includedLights.push(matchedLight);
					lightsByUuid.add(matchedLight);
				}
			}
		}
		if (this.pv.objectsMask != '') {
			matchedObjects = this.scene().objectsByMask(this.pv.objectsMask);
			for (let matchedObject of matchedObjects) {
				if (!(matchedObject instanceof Light)) {
					if (!lightsByUuid.has(matchedObject)) {
						this._includedObjects.push(matchedObject);
					}
				}
			}
		}
	}

	static PARAM_CALLBACK_printResolveObjectsList(node: LightMapObjNode) {
		node._printResolveObjectsList();
	}
	private _printResolveObjectsList() {
		this._updateObjectsAndLightsList();
		console.log('included objects:');
		console.log(this._includedObjects);
		console.log('included lights:');
		console.log(this._includedLights);
	}
}
