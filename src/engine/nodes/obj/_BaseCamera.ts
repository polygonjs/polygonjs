import {Constructor, valueof} from '../../../types/GlobalTypes';
import {Camera} from 'three/src/cameras/Camera';
import {CoreTransform} from '../../../core/Transform';
import {ObjNodeRenderOrder} from './_Base';
import {ThreejsCameraControlsController} from './utils/cameras/ControlsController';
import {LayersController, LayerParamConfig} from './utils/LayersController';
import {PostProcessController, CameraPostProcessParamConfig} from './utils/cameras/PostProcessController';
import {RenderController, CameraRenderParamConfig} from './utils/cameras/RenderController';
import {TransformedParamConfig, TransformController} from './utils/TransformController';
import {ChildrenDisplayController} from './utils/ChildrenDisplayController';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {NodeContext} from '../../poly/NodeContext';
import {ThreejsViewer, ThreejsViewerProperties} from '../../viewers/Threejs';
import {FlagsControllerD} from '../utils/FlagsController';
import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../_Base';
import {BaseSopNodeType} from '../sop/_Base';
import {TypedObjNode} from './_Base';
import {BaseViewerType} from '../../viewers/_Base';
import {HierarchyController} from './utils/HierarchyController';
import {GeoNodeChildrenMap} from '../../poly/registers/nodes/Sop';
import {ParamsInitData} from '../utils/io/IOController';
import {Raycaster} from 'three/src/core/Raycaster';
import {Vector2} from 'three/src/math/Vector2';
import {CoreType} from '../../../core/Type';
import {CameraHelper} from './utils/helpers/CameraHelper';

export interface OrthoOrPerspCamera extends Camera {
	near: number;
	far: number;
	updateProjectionMatrix: () => void;
	getFocalLength?: () => void;
}

const EVENT_CHANGE = {type: 'change'};

export const BASE_CAMERA_DEFAULT = {
	near: 1.0,
	far: 100.0,
};

export enum UpdateFromControlsMode {
	ON_END = 'on move end',
	ALWAYS = 'always',
	NEVER = 'never',
}
export const UPDATE_FROM_CONTROLS_MODES: UpdateFromControlsMode[] = [
	UpdateFromControlsMode.ON_END,
	UpdateFromControlsMode.ALWAYS,
	UpdateFromControlsMode.NEVER,
];

import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';

export function CameraMasterCameraParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		setMasterCamera = ParamConfig.BUTTON(null, {
			callback: (node: BaseNodeType, param: BaseParamType) => {
				BaseCameraObjNodeClass.PARAM_CALLBACK_setMasterCamera(node as BaseCameraObjNodeType);
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
		});
		/** @param define when the camera node transform parameters are updated after the controls have moved the internal camera object */
		updateFromControlsMode = ParamConfig.INTEGER(
			UPDATE_FROM_CONTROLS_MODES.indexOf(UpdateFromControlsMode.ON_END),
			{
				menu: {
					entries: UPDATE_FROM_CONTROLS_MODES.map((name, value) => {
						return {name, value};
					}),
				},
			}
		);
		// allowUpdateFromControls = ParamConfig.BOOLEAN(1);

		/** @param near */
		near = ParamConfig.FLOAT(BASE_CAMERA_DEFAULT.near, {
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
		/** @param far */
		far = ParamConfig.FLOAT(BASE_CAMERA_DEFAULT.far, {
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

export class BaseCameraObjParamsConfig extends CameraMasterCameraParamConfig(NodeParamsConfig) {}
export class BaseThreejsCameraObjParamsConfig extends CameraPostProcessParamConfig(
	CameraRenderParamConfig(
		TransformedParamConfig(
			LayerParamConfig(ThreejsCameraTransformParamConfig(CameraMasterCameraParamConfig(NodeParamsConfig)))
		)
	)
) {}

export abstract class TypedCameraObjNode<
	O extends OrthoOrPerspCamera,
	K extends BaseCameraObjParamsConfig
> extends TypedObjNode<O, K> {
	// public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	public readonly renderOrder: number = ObjNodeRenderOrder.CAMERA;
	protected _object!: O;
	protected _aspect: number = -1;
	get object() {
		return this._object;
	}

	async cook() {
		this.update_camera();
		this._object.dispatchEvent(EVENT_CHANGE);
		this.cookController.endCook();
	}

	on_create() {}
	on_delete() {}

	prepareRaycaster(mouse: Vector2, raycaster: Raycaster) {}

	camera() {
		return this._object;
	}
	update_camera() {}

	static PARAM_CALLBACK_setMasterCamera(node: BaseCameraObjNodeType) {
		node.set_as_master_camera();
	}
	set_as_master_camera() {
		this.scene().camerasController.setMasterCameraNodePath(this.path());
	}

	setup_for_aspect_ratio(aspect: number) {}
	protected _update_for_aspect_ratio(): void {}

	update_transform_params_from_object() {
		// CoreTransform.set_params_from_matrix(this._object.matrix, this, {scale: false})
		CoreTransform.set_params_from_object(this._object, this);
	}
	abstract createViewer(element: HTMLElement): BaseViewerType;

	static PARAM_CALLBACK_update_from_param(node: BaseCameraObjNodeType, param: BaseParamType) {
		(node.object as any)[param.name()] = (node.pv as any)[param.name()];
	}
}

export class TypedThreejsCameraObjNode<
	O extends OrthoOrPerspCamera,
	K extends BaseThreejsCameraObjParamsConfig
> extends TypedCameraObjNode<O, K> {
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	readonly hierarchyController: HierarchyController = new HierarchyController(this);
	readonly transformController: TransformController = new TransformController(this);
	protected _controls_controller: ThreejsCameraControlsController | undefined;
	get controls_controller(): ThreejsCameraControlsController {
		return (this._controls_controller = this._controls_controller || new ThreejsCameraControlsController(this));
	}
	protected _layers_controller: LayersController | undefined;
	get layers_controller() {
		return (this._layers_controller = this._layers_controller || new LayersController(this));
	}
	protected _render_controller: RenderController | undefined;
	get renderController(): RenderController {
		return (this._render_controller = this._render_controller || new RenderController(this));
	}
	protected _post_process_controller: PostProcessController | undefined;
	get postProcessController(): PostProcessController {
		return (this._post_process_controller = this._post_process_controller || new PostProcessController(this));
	}

	// display_node and children_display controllers
	public readonly childrenDisplayController: ChildrenDisplayController = new ChildrenDisplayController(this);
	public readonly displayNodeController: DisplayNodeController = new DisplayNodeController(
		this,
		this.childrenDisplayController.displayNodeControllerCallbacks()
	);
	//
	protected _children_controller_context = NodeContext.SOP;

	initializeBaseNode() {
		super.initializeBaseNode();
		this.io.outputs.setHasOneOutput();
		this.hierarchyController.initializeNode();
		this.transformController.initializeNode();

		this.childrenDisplayController.initializeNode();
		this.initHelperHook();
	}

	createNode<S extends keyof GeoNodeChildrenMap>(
		node_class: S,
		params_init_value_overrides?: ParamsInitData
	): GeoNodeChildrenMap[S];
	createNode<K extends valueof<GeoNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K;
	createNode<K extends valueof<GeoNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class, params_init_value_overrides) as K;
	}
	children() {
		return super.children() as BaseSopNodeType[];
	}
	nodesByType<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][] {
		return super.nodesByType(type) as GeoNodeChildrenMap[K][];
	}

	prepareRaycaster(mouse: Vector2, raycaster: Raycaster) {
		raycaster.setFromCamera(mouse, this._object);
	}

	async cook() {
		this.transformController.update();
		this.layers_controller.update();
		// await this.background_controller.update();

		this.updateNearFar();

		this.renderController.update();
		this.update_camera();
		this._updateHelper();
		this.controls_controller.update_controls();

		// TODO: ideally the update transform and update camera
		// can both return if the camera has changed
		// and we can run this here instead of inside the update_transform and update_camera
		// this._object.dispatchEvent( EVENT_CHANGE )
		this._object.dispatchEvent(EVENT_CHANGE);
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

	setup_for_aspect_ratio(aspect: number) {
		if (CoreType.isNaN(aspect)) {
			return;
		}
		if (aspect && this._aspect != aspect) {
			this._aspect = aspect;
			this._update_for_aspect_ratio();
		}
	}

	createViewer(element: HTMLElement, viewer_properties?: ThreejsViewerProperties): ThreejsViewer {
		return new ThreejsViewer(element, this.scene(), this, viewer_properties);
	}
	static PARAM_CALLBACK_reset_effects_composer(node: BaseThreejsCameraObjNodeType) {
		node.postProcessController.reset();
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
