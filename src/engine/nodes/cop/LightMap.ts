/**
 * Creates a light map
 *
 *
 */

// https://threejs.org/examples/?q=light#webgl_shadowmap_progressive
import {TypedCopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {Object3D} from 'three/src/core/Object3D';
import {Light} from 'three/src/lights/Light';
import {Poly} from '../../Poly';
import {LightMapController} from './utils/LightMapController';
import {Mesh} from 'three/src/objects/Mesh';

enum LightMapUpdateMode {
	ON_RENDER = 'On Every Render',
	MANUAL = 'Manual',
}
const UPDATE_MODES: LightMapUpdateMode[] = [LightMapUpdateMode.ON_RENDER, LightMapUpdateMode.MANUAL];

class LightMapCopParamConfig extends NodeParamsConfig {
	/** @param set update mode, which can be to update on every frame, or manually only */
	updateMode = ParamConfig.INTEGER(UPDATE_MODES.indexOf(LightMapUpdateMode.ON_RENDER), {
		callback: (node: BaseNodeType) => {
			LightMapCopNode.PARAM_CALLBACK_update_updateMode(node as LightMapCopNode);
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
			LightMapCopNode.PARAM_CALLBACK_updateManual(node as LightMapCopNode);
		},
		visibleIf: {updateMode: UPDATE_MODES.indexOf(LightMapUpdateMode.MANUAL)},
	});
	/** @param shadow resolution */
	lightMapRes = ParamConfig.INTEGER(1024, {range: [1, 2048], rangeLocked: [true, false]});
	/** @param iterations */
	iterations = ParamConfig.INTEGER(512, {range: [1, 2048], rangeLocked: [true, false]});
	/** @param blendWindow */
	blendWindow = ParamConfig.INTEGER(200, {
		range: [1, 500],
		rangeLocked: [true, false],
	});
	/** @param blurEdges */
	blurEdges = ParamConfig.BOOLEAN(1);
	/** @param lightPositionVariation */
	lightPositionVariation = ParamConfig.FLOAT(1, {
		range: [0, 10],
	});

	objectsMask = ParamConfig.STRING('');
	lightsMask = ParamConfig.STRING('*');

	printResolveObjectsList = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			LightMapCopNode.PARAM_CALLBACK_printResolveObjectsList(node as LightMapCopNode);
		},
	});
}
const ParamsConfig = new LightMapCopParamConfig();

export class LightMapCopNode extends TypedCopNode<LightMapCopParamConfig> {
	paramsConfig = ParamsConfig;
	static type(): Readonly<'lightMap'> {
		return 'lightMap';
	}
	private lightMapController: LightMapController | undefined;
	private _includedObjects: Mesh[] = [];
	private _includedLights: Light[] = [];

	async cook() {
		this.lightMapController = this.lightMapController || (await this._createLightMapController());

		if (this.lightMapController) {
			this.setTexture(this.lightMapController.texture());
		} else {
			this.cookController.endCook();
		}
	}

	private async _createLightMapController() {
		const renderer = await Poly.renderersController.firstRenderer();
		if (!renderer) {
			console.warn('no renderer found');
			return;
		}
		const progressiveSurfacemap = new LightMapController(renderer, this.pv.lightMapRes);
		return progressiveSurfacemap;
	}

	//
	//
	// ACTIVE
	//
	//
	static PARAM_CALLBACK_update_updateMode(node: LightMapCopNode) {
		// node._updateRenderHook();
	}

	//
	//
	// UPDATE
	//
	//
	private async _updateManual() {
		if (!this.lightMapController) {
			return;
		}
		const masterCameraNode = this.scene().masterCameraNode();
		if (!masterCameraNode) {
			return;
		}
		console.log('_updateManual');
		this._updateObjectsAndLightsList();
		this.lightMapController.init(this._includedObjects, this._includedLights);
		const blendWindow = this.pv.blendWindow;
		const blurEdges = this.pv.blurEdges;

		const camera = masterCameraNode.camera();
		this.lightMapController.setParams({positionVariation: this.pv.lightPositionVariation});
		const iterations = this.pv.iterations;
		for (let i = 0; i < iterations; i++) {
			await this.lightMapController.update(camera, blendWindow, blurEdges);
		}
		this.lightMapController.restoreState();
		// this.setTexture(this.lightMapController.progressiveLightMap1.texture);
	}
	static PARAM_CALLBACK_updateManual(node: LightMapCopNode) {
		node._updateManual();
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
					if (!lightsByUuid.has(matchedObject) && matchedObject instanceof Mesh) {
						this._includedObjects.push(matchedObject);
					}
				}
			}
		}
	}

	static PARAM_CALLBACK_printResolveObjectsList(node: LightMapCopNode) {
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