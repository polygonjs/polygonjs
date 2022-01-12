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
import {LightMapController, DEFAULT_ITERATION_BLEND} from './utils/LightMapController';
import {Mesh} from 'three/src/objects/Mesh';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DataTextureController, DataTextureControllerBufferType} from './utils/DataTextureController';
import {CopRendererController} from './utils/RendererController';

class LightMapCopParamConfig extends NodeParamsConfig {
	/** @param click to update shadow, when mode is manual */
	update = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			LightMapCopNode.PARAM_CALLBACK_updateManual(node as LightMapCopNode);
		},
	});
	/** @param defines if the shader is rendered via the same camera used to render the scene */
	useCameraRenderer = ParamConfig.BOOLEAN(1);
	/** @param shadow resolution */
	lightMapRes = ParamConfig.INTEGER(1024, {range: [1, 2048], rangeLocked: [true, false]});
	/** @param iterations */
	iterations = ParamConfig.INTEGER(512, {range: [1, 2048], rangeLocked: [true, false]});
	/** @param blendWindow */
	iterationBlend = ParamConfig.FLOAT(DEFAULT_ITERATION_BLEND, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
	/** @param blurEdges */
	blur = ParamConfig.BOOLEAN(1);
	/** @param blurAmount */
	blurAmount = ParamConfig.FLOAT(1, {
		visibleIf: {blur: 1},
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param lightPositionVariation */
	lightRadius = ParamConfig.FLOAT(1, {
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
	private _data_texture_controller: DataTextureController | undefined;
	private _renderer_controller: CopRendererController | undefined;

	async cook() {
		this._updateManual();
	}

	private async _createLightMapController() {
		const renderer = await Poly.renderersController.waitForRenderer();
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
		this.lightMapController = this.lightMapController || (await this._createLightMapController());
		if (!this.lightMapController) {
			return;
		}
		const mainCameraNode = this.scene().mainCameraNode();
		if (!mainCameraNode) {
			return;
		}
		this._updateObjectsAndLightsList();
		this.lightMapController.init(this._includedObjects, this._includedLights);

		const camera = mainCameraNode.camera();
		this.lightMapController.setParams({
			lightRadius: this.pv.lightRadius,
			iterations: this.pv.iterations,
			iterationBlend: this.pv.iterationBlend,
			blur: this.pv.blur,
			blurAmount: this.pv.blurAmount,
		});
		this.lightMapController.runUpdates(camera);
		this.lightMapController.restoreState();
		// this.setTexture();

		const renderTarget = this.lightMapController.textureRenderTarget();
		if (isBooleanTrue(this.pv.useCameraRenderer)) {
			this.setTexture(renderTarget.texture);
		} else {
			this._data_texture_controller =
				this._data_texture_controller ||
				new DataTextureController(DataTextureControllerBufferType.Float32Array);
			this._renderer_controller = this._renderer_controller || new CopRendererController(this);
			const renderer = await this._renderer_controller.renderer();
			const texture = this._data_texture_controller.from_render_target(renderer, renderTarget);
			this.setTexture(texture);
		}
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
