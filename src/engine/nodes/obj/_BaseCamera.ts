import {Constructor, valueof} from '../../../types/GlobalTypes';
import {Camera} from 'three';
import {CoreTransform} from '../../../core/Transform';
import {ObjNodeRenderOrder} from './_Base';
import {LayersController, LayerParamConfig} from './utils/LayersController';
import {CameraRenderParamConfig} from './utils/cameras/RenderController';
import {TransformedParamConfig, TransformController} from './utils/TransformController';
import {ObjChildrenDisplayController} from './utils/ObjChildrenDisplayController';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {NodeContext} from '../../poly/NodeContext';
import {ThreejsViewer} from '../../viewers/Threejs';
import {FlagsControllerD} from '../utils/FlagsController';
import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../_Base';
import {BaseSopNodeType} from '../sop/_Base';
import {TypedObjNode} from './_Base';
import {BaseViewerType} from '../../viewers/_Base';
import {HierarchyController} from './utils/HierarchyController';
import {GeoNodeChildrenMap} from '../../poly/registers/nodes/Sop';
import {CameraHelper} from '../../../core/helpers/CameraHelper';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {CameraPostProcessParamConfig} from './utils/cameras/PostProcessParamOptions';
import {Poly} from '../../Poly';
import {CORE_CAMERA_DEFAULT} from '../../../core/camera/CoreCamera';
import {CameraControlsSopOperation} from '../../operations/sop/CameraControls';
import {CameraRendererSopOperation} from '../../operations/sop/CameraRenderer';
import {CameraCSSRendererSopOperation} from '../../operations/sop/CameraCSSRenderer';
import {CameraPostProcessSopOperation} from '../../operations/sop/CameraPostProcess';
import {CameraRenderSceneSopOperation} from '../../operations/sop/CameraRenderScene';
import {CameraFrameModeSopOperation} from '../../operations/sop/CameraFrameMode';
import {CoreCameraFrameParamConfig} from '../../../core/camera/CoreCameraFrameMode';
import {CorePath} from '../../../core/geometry/CorePath';
export interface OrthoOrPerspCamera extends Camera {
	near: number;
	far: number;
	updateProjectionMatrix: () => void;
	getFocalLength?: () => void;
}

const EVENT_CHANGE = {type: 'change'};

export function CameraMainCameraParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		setMainCamera = ParamConfig.BUTTON(null, {
			callback: (node: BaseNodeType, param: BaseParamType) => {
				BaseCameraObjNodeClass.PARAM_CALLBACK_setMainCamera(node as BaseCameraObjNodeType);
			},
		});
	};
}

export function ThreejsCameraTransformParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		camera = ParamConfig.FOLDER();
		/** @param controls node to allow the camera to be moved by user input */
		controls = ParamConfig.NODE_PATH('', {
			nodeSelection: {
				context: NodeContext.EVENT,
			},
			dependentOnFoundNode: true,
		});

		/** @param near */
		near = ParamConfig.FLOAT(CORE_CAMERA_DEFAULT.near, {
			range: [0.1, 100],
			cook: false,
			computeOnDirty: true,
			callback: (node: BaseNodeType, param: BaseParamType) => {
				BaseThreejsCameraObjNodeClass.PARAM_CALLBACK_update_near_far_from_param(
					node as BaseThreejsCameraObjNodeType,
					param
				);
			},
		});
		/** @param far */
		far = ParamConfig.FLOAT(CORE_CAMERA_DEFAULT.far, {
			range: [0, 100],
			cook: false,
			computeOnDirty: true,
			callback: (node: BaseNodeType, param: BaseParamType) => {
				BaseThreejsCameraObjNodeClass.PARAM_CALLBACK_update_near_far_from_param(
					node as BaseThreejsCameraObjNodeType,
					param
				);
			},
		});
		// aspect = ParamConfig.FLOAT(1);
		// lock_width = ParamConfig.BOOLEAN(1);
		// look_at = ParamConfig.OPERATOR_PATH('');
		/** @param display */
		display = ParamConfig.BOOLEAN(1);
		/** @param show helper */
		showHelper = ParamConfig.BOOLEAN(0);
	};
}

export class BaseCameraObjParamsConfig extends CameraMainCameraParamConfig(NodeParamsConfig) {}
export class BaseThreejsCameraObjParamsConfig extends CameraPostProcessParamConfig(
	CameraRenderParamConfig(
		CoreCameraFrameParamConfig(
			TransformedParamConfig(
				LayerParamConfig(ThreejsCameraTransformParamConfig(CameraMainCameraParamConfig(NodeParamsConfig)))
			)
		)
	)
) {}

export interface BaseViewerOptions {
	element?: HTMLElement;
	updateAutoRenderOnIntersectionChange?: boolean;
}

export abstract class TypedCameraObjNode<
	O extends OrthoOrPerspCamera,
	K extends BaseCameraObjParamsConfig
> extends TypedObjNode<O, K> {
	// public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	public override readonly renderOrder: number = ObjNodeRenderOrder.CAMERA;
	protected override _object!: O;
	protected _aspect: number = -1;
	override get object() {
		return this._object;
	}

	override async cook() {
		this.updateCamera();
		this._object.dispatchEvent(EVENT_CHANGE);
		this.cookController.endCook();
	}

	// prepareRaycaster(mouse: Vector2, raycaster: Raycaster) {}

	camera() {
		return this._object;
	}
	updateCamera() {}

	static PARAM_CALLBACK_setMainCamera(node: BaseCameraObjNodeType) {
		node.setAsMainCamera();
	}
	setAsMainCamera() {
		const path = CorePath.objectPath(this.object);
		this.scene().camerasController.setMainCameraPath(path);
	}

	setupForAspectRatio(aspect: number) {}
	// protected _updateForAspectRatio(): void {}

	update_transform_params_from_object() {
		// CoreTransform.set_params_from_matrix(this._object.matrix, this, {scale: false})
		CoreTransform.setParamsFromObject(this._object, this);
	}
	abstract createViewer(options?: BaseViewerOptions | HTMLElement): Promise<BaseViewerType | undefined>;

	static PARAM_CALLBACK_update_from_param(node: BaseCameraObjNodeType, param: BaseParamType) {
		(node.object as any)[param.name()] = (node.pv as any)[param.name()];
	}
}

// interface ThreejsViewerOptions extends BaseViewerOptions {
// 	viewerProperties?: ThreejsViewerProperties;
// }
export class TypedThreejsCameraObjNode<
	O extends OrthoOrPerspCamera,
	K extends BaseThreejsCameraObjParamsConfig
> extends TypedCameraObjNode<O, K> {
	public override readonly flags: FlagsControllerD = new FlagsControllerD(this);
	override readonly hierarchyController: HierarchyController = new HierarchyController(this);
	override readonly transformController: TransformController = new TransformController(this);
	// protected _controlsController: ThreejsCameraControlsController | undefined;
	// controlsController(): ThreejsCameraControlsController {
	// 	return (this._controlsController = this._controlsController || new ThreejsCameraControlsController(this));
	// }
	protected __layersController__: LayersController | undefined;
	private _layersController() {
		return (this.__layersController__ = this.__layersController__ || new LayersController(this));
	}
	// protected _renderController: RenderController | undefined;
	// renderController(): RenderController {
	// 	return (this._renderController = this._renderController || new RenderController(this));
	// }
	// protected _postProcessController: PostProcessController | undefined;
	// postProcessController(): PostProcessController {
	// 	return (this._postProcessController = this._postProcessController || new PostProcessController(this));
	// }

	// display_node and children_display controllers
	public override readonly childrenDisplayController: ObjChildrenDisplayController = new ObjChildrenDisplayController(
		this
	);
	public override readonly displayNodeController: DisplayNodeController = new DisplayNodeController(
		this,
		this.childrenDisplayController.displayNodeControllerCallbacks()
	);
	//
	protected override _childrenControllerContext = NodeContext.SOP;

	override initializeBaseNode() {
		super.initializeBaseNode();
		this.io.outputs.setHasOneOutput();
		this.hierarchyController.initializeNode();
		this.transformController.initializeNode();

		this.childrenDisplayController.initializeNode();
		this.initHelperHook();
	}

	override createNode<S extends keyof GeoNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): GeoNodeChildrenMap[S];
	override createNode<K extends valueof<GeoNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<GeoNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseSopNodeType[];
	}
	override nodesByType<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][] {
		return super.nodesByType(type) as GeoNodeChildrenMap[K][];
	}

	// override prepareRaycaster(mouse: Vector2, raycaster: Raycaster) {
	// 	raycaster.setFromCamera(mouse, this._object);
	// }

	override async cook() {
		this.transformController.update();
		this._layersController().update();
		// await this.background_controller.update();

		this.updateNearFar();

		// this.renderController().update();
		this.updateCamera();
		this._updateHelper();
		// this.controlsController().update_controls();

		const objects = [this._object];
		const node = this;
		const hierachyParams = {
			group: '',
		};
		CameraControlsSopOperation.updateObject({
			objects,
			params: {
				node: this.pv.controls,
				...hierachyParams,
			},
			node,
			active: true,
			errorIfNodeNotFound: false,
		});
		CameraRendererSopOperation.updateObject({
			objects,
			params: {
				node: this.pv.renderer,
				...hierachyParams,
			},
			node,
			active: this.pv.setRenderer,
		});
		CameraCSSRendererSopOperation.updateObject({
			objects,
			params: {
				node: this.pv.CSSRenderer,
				...hierachyParams,
			},
			node,
			active: this.pv.setCSSRenderer,
		});
		CameraPostProcessSopOperation.updateObject({
			objects,
			params: {
				node: this.pv.postProcessNode,
				useOtherNode: false,
				...hierachyParams,
			},
			node,
			active: this.pv.doPostProcess,
		});
		CameraRenderSceneSopOperation.updateObject({
			objects,
			params: {
				node: this.pv.scene,
				...hierachyParams,
			},
			node,
			active: this.pv.setScene,
		});
		CameraFrameModeSopOperation.updateObject({
			objects,
			params: {
				frameMode: this.pv.frameMode,
				expectedAspectRatio: this.pv.expectedAspectRatio,
				...hierachyParams,
			},
		});

		// TODO: ideally the update transform and update camera
		// can both return if the camera has changed
		// and we can run this here instead of inside the update_transform and update_camera
		// this._object.dispatchEvent( EVENT_CHANGE )
		this._object.dispatchEvent(EVENT_CHANGE);
		this.scene().camerasController.updateFromChangeInObject(this.object);
		this.cookController.endCook();
	}

	static PARAM_CALLBACK_update_near_far_from_param(node: BaseThreejsCameraObjNodeType, param: BaseParamType) {
		node.updateNearFar();
	}
	updateNearFar() {
		if (this._object.near != this.pv.near || this._object.far != this.pv.far) {
			this._object.near = this.pv.near;
			this._object.far = this.pv.far;
			this._object.updateProjectionMatrix();
			this._updateHelper();
		}
	}

	// override setupForAspectRatio(aspect: number) {
	// 	if (CoreType.isNaN(aspect)) {
	// 		return;
	// 	}
	// 	if (aspect && this._aspect != aspect) {
	// 		this._aspect = aspect;
	// 		this._updateForAspectRatio();
	// 	}
	// }

	async createViewer(options?: BaseViewerOptions | HTMLElement): Promise<ThreejsViewer<Camera> | undefined> {
		if (this.isDirty()) {
			// make sure that every parameter is cooked,
			// so that the camera object has all the attributes required
			await this.compute();
		}

		const viewer = Poly.camerasRegister.createViewer({camera: this.object, scene: this.scene()}) as
			| ThreejsViewer<Camera>
			| undefined;
		let element: HTMLElement | undefined;

		let updateAutoRenderOnIntersectionChange: boolean | undefined;
		if (options && options instanceof HTMLElement) {
			element = options;
		} else {
			element = options?.element;
			updateAutoRenderOnIntersectionChange = options?.updateAutoRenderOnIntersectionChange;
		}
		if (viewer) {
			if (element) {
				viewer.mount(element, {
					updateAutoRenderOnIntersectionChange,
				});
			}
		}
		return viewer;
	}

	//
	//
	// HELPER
	//
	//
	private _helper: CameraHelper | undefined;

	initHelperHook() {
		this.flags.display.onUpdate(() => {
			this._updateHelper();
		});
	}

	helperVisible() {
		return this.flags.display.active() && isBooleanTrue(this.pv.showHelper);
	}

	private _createHelper(): CameraHelper {
		const helper = new CameraHelper(this.object);
		helper.update();
		return helper;
	}

	_updateHelper() {
		if (this.helperVisible()) {
			if (!this._helper) {
				this._helper = this._createHelper();
			}
			if (this._helper) {
				this.object.add(this._helper);
				this._helper.update();
			}
		} else {
			if (this._helper) {
				this.object.remove(this._helper);
			}
		}
	}
}

export type BaseCameraObjNodeType = TypedCameraObjNode<OrthoOrPerspCamera, BaseCameraObjParamsConfig>;
export abstract class BaseCameraObjNodeClass extends TypedCameraObjNode<
	OrthoOrPerspCamera,
	BaseCameraObjParamsConfig
> {}

export type BaseThreejsCameraObjNodeType = TypedThreejsCameraObjNode<
	OrthoOrPerspCamera,
	BaseThreejsCameraObjParamsConfig
>;
export class BaseThreejsCameraObjNodeClass extends TypedThreejsCameraObjNode<
	OrthoOrPerspCamera,
	BaseThreejsCameraObjParamsConfig
> {
	PARAM_CALLBACK_update_effects_composer(node: BaseNodeType) {}
}
