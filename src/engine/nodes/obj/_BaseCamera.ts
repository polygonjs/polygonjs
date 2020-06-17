import lodash_isNaN from 'lodash/isNaN';
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
import {ThreejsViewer} from '../../viewers/Threejs';
import {FlagsControllerD} from '../utils/FlagsController';
import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../_Base';
import {BaseSopNodeType} from '../sop/_Base';
import {TypedObjNode} from './_Base';

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

import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {BaseViewerType} from '../../viewers/_Base';
import {HierarchyController} from './utils/HierarchyController';
import {GeoNodeChildrenMap} from '../../poly/registers/nodes/Sop';
import {ParamInitValueSerialized} from '../../params/types/ParamInitValueSerialized';

export function CameraMasterCameraParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		set_master_camera = ParamConfig.BUTTON(null, {
			callback: (node: BaseNodeType, param: BaseParamType) => {
				BaseCameraObjNodeClass.PARAM_CALLBACK_set_master_camera(node as BaseCameraObjNodeType);
			},
		});
	};
}

export function ThreejsCameraTransformParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		camera = ParamConfig.FOLDER();
		controls = ParamConfig.OPERATOR_PATH('', {
			node_selection: {
				context: NodeContext.EVENT,
			},
		});

		target = ParamConfig.VECTOR3([0, 0, 0], {cook: false});
		near = ParamConfig.FLOAT(BASE_CAMERA_DEFAULT.near, {
			range: [0, 100],
			cook: false,
			compute_on_dirty: true,
			callback: (node: BaseNodeType, param: BaseParamType) => {
				BaseThreejsCameraObjNodeClass.PARAM_CALLBACK_update_near_far_from_param(
					node as BaseThreejsCameraObjNodeType,
					param
				);
			},
		});
		far = ParamConfig.FLOAT(BASE_CAMERA_DEFAULT.far, {
			range: [0, 100],
			cook: false,
			compute_on_dirty: true,
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
		display = ParamConfig.BOOLEAN(1);
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

// export abstract class TypedMinimalCameraObjNode<
// 	O extends OrthoOrPerspCamera,
// 	K extends NodeParamsConfig
// > extends TypedObjNode<O, K> {
// 	setup_for_aspect_ratio(aspect: number) {}
// 	abstract create_viewer(element: HTMLElement): BaseViewer;
// }

export abstract class TypedCameraObjNode<
	O extends OrthoOrPerspCamera,
	K extends BaseCameraObjParamsConfig
> extends TypedObjNode<O, K> {
	// public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	public readonly render_order: number = ObjNodeRenderOrder.CAMERA;
	protected _object!: O;
	protected _aspect: number = -1;
	get object() {
		return this._object;
	}

	// protected _background_controller: BaseBackgroundController | undefined;
	// get background_controller(): BaseBackgroundController {
	// 	return (this._background_controller =
	// 		this._background_controller || new this.background_controller_constructor(this));
	// }
	// protected get background_controller_constructor() {
	// 	return BaseBackgroundController;
	// }

	// protected _used_in_scene: boolean = true;

	// create_common_params() {
	// 	// this.within_param_folder('transform', () => {
	// 	// 	// this.add_param(ParamType.OPERATOR_PATH, 'controls', '', {
	// 	// 	// 	node_selection: {
	// 	// 	// 		context: NodeContext.EVENT,
	// 	// 	// 	},
	// 	// 	// });
	// 	// 	// CoreTransform.create_params(this); // removed since they are now added Persp Camera
	// 	// 	// this.add_param( ParamType.TOGGLE, 'is_updating', 0, {cook: false, hidden: true}); //, hidden: true} )
	// 	// 	// this.add_param(ParamType.VECTOR3, 'target', [0, 0, 0], {cook: false}); //, hidden: true} )
	// 	// });
	// 	// this.within_param_folder('render', () => {
	// 	// this.layers_controller.add_params();
	// 	// this.add_param(ParamType.FLOAT, 'near', BASE_CAMERA_DEFAULT.near, {range: [0, 100]});
	// 	// this.add_param(ParamType.FLOAT, 'far', BASE_CAMERA_DEFAULT.far, {range: [0, 100]});
	// 	// this.add_param(ParamType.BOOLEAN, 'lock_width', 1);
	// 	// });
	// 	// this.background_controller.add_params();
	// 	// this.post_process_controller.add_params();
	// }

	// create_player_camera_params() {
	// 	this.add_param(ParamType.BUTTON, 'set_master_camera', null, {callback: this.set_as_master_camera.bind(this)});
	// }
	// is_updating():boolean{
	// 	return this.param('is_updating').value()
	// }

	// as_code_set_up_custom: ->
	// 	lines = []
	// 	lines.push "#{this.code_var_name()}.set_display_flag(#{this.display_flag_state()})"
	// 	lines

	async cook() {
		this.update_camera();
		this._object.dispatchEvent(EVENT_CHANGE);
		this.cook_controller.end_cook();
	}

	on_create() {}
	on_delete() {}

	camera() {
		return this._object;
	}
	update_camera() {}

	static PARAM_CALLBACK_set_master_camera(node: BaseCameraObjNodeType) {
		node.set_as_master_camera();
	}
	set_as_master_camera() {
		this.scene.cameras_controller.set_master_camera_node_path(this.full_path());
	}

	setup_for_aspect_ratio(aspect: number) {}
	protected _update_for_aspect_ratio(): void {}

	update_transform_params_from_object() {
		// CoreTransform.set_params_from_matrix(this._object.matrix, this, {scale: false})
		CoreTransform.set_params_from_object(this._object, this);
	}
	abstract create_viewer(element: HTMLElement): BaseViewerType;

	static PARAM_CALLBACK_update_from_param(node: BaseCameraObjNodeType, param: BaseParamType) {
		(node.object as any)[param.name] = (node.pv as any)[param.name];
	}
}

export class TypedThreejsCameraObjNode<
	O extends OrthoOrPerspCamera,
	K extends BaseThreejsCameraObjParamsConfig
> extends TypedCameraObjNode<O, K> {
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	readonly hierarchy_controller: HierarchyController = new HierarchyController(this);
	readonly transform_controller: TransformController = new TransformController(this);
	protected _controls_controller: ThreejsCameraControlsController | undefined;
	get controls_controller(): ThreejsCameraControlsController {
		return (this._controls_controller = this._controls_controller || new ThreejsCameraControlsController(this));
	}
	protected _layers_controller: LayersController | undefined;
	get layers_controller() {
		return (this._layers_controller = this._layers_controller || new LayersController(this));
	}
	protected _render_controller: RenderController | undefined;
	get render_controller(): RenderController {
		return (this._render_controller = this._render_controller || new RenderController(this));
	}
	protected _post_process_controller: PostProcessController | undefined;
	get post_process_controller(): PostProcessController {
		return (this._post_process_controller = this._post_process_controller || new PostProcessController(this));
	}

	// display_node and children_display controllers
	public readonly children_display_controller: ChildrenDisplayController = new ChildrenDisplayController(this);
	public readonly display_node_controller: DisplayNodeController = new DisplayNodeController(
		this,
		this.children_display_controller.display_node_controller_callbacks()
	);
	//
	protected _children_controller_context = NodeContext.SOP;

	initialize_base_node() {
		super.initialize_base_node();
		this.io.outputs.set_has_one_output();
		this.hierarchy_controller.initialize_node();
		this.transform_controller.initialize_node();

		this.children_display_controller.initialize_node();
	}

	create_node<K extends keyof GeoNodeChildrenMap>(
		type: K,
		params_init_value_overrides?: Dictionary<ParamInitValueSerialized>
	): GeoNodeChildrenMap[K] {
		return super.create_node(type, params_init_value_overrides) as GeoNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseSopNodeType[];
	}
	nodes_by_type<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as GeoNodeChildrenMap[K][];
	}

	async cook() {
		this.transform_controller.update();
		this.layers_controller.update();
		// await this.background_controller.update();

		this.update_near_far();

		this.render_controller.update();
		this.update_camera();
		this.controls_controller.update_controls();

		// TODO: ideally the update transform and update camera
		// can both return if the camera has changed
		// and we can run this here instead of inside the update_transform and update_camera
		// this._object.dispatchEvent( EVENT_CHANGE )
		this._object.dispatchEvent(EVENT_CHANGE);
		this.cook_controller.end_cook();
	}

	static PARAM_CALLBACK_update_near_far_from_param(node: BaseThreejsCameraObjNodeType, param: BaseParamType) {
		node.update_near_far();
	}
	update_near_far() {
		if (this._object.near != this.pv.near || this._object.far != this.pv.far) {
			this._object.near = this.pv.near;
			this._object.far = this.pv.far;
			this._object.updateProjectionMatrix();
		}
	}

	setup_for_aspect_ratio(aspect: number) {
		if (lodash_isNaN(aspect)) {
			return;
		}
		if (aspect && this._aspect != aspect) {
			this._aspect = aspect;
			this._update_for_aspect_ratio();
		}
	}
	create_viewer(element: HTMLElement): ThreejsViewer {
		return new ThreejsViewer(element, this.scene, this);
	}
	static PARAM_CALLBACK_reset_effects_composer(node: BaseThreejsCameraObjNodeType) {
		node.post_process_controller.reset();
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
