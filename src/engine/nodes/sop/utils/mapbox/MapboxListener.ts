import {CameraController} from '../../../../../core/CameraController';
import {NodeContext} from '../../../../poly/NodeContext';
import {MapboxCameraObjNode} from '../../../obj/MapboxCamera';
import {TypedSopNode} from '../../_Base';

import {NodeParamsConfig, ParamConfig} from '../../../utils/params/ParamsConfig';
import {BaseNodeType} from '../../../_Base';
export function MapboxListenerParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		// if use bounds
		use_bounds = ParamConfig.BOOLEAN(0, {hidden: true});
		south_west = ParamConfig.VECTOR2([-0.11, 51.51], {
			visible_if: {use_bounds: 1},
		});
		north_east = ParamConfig.VECTOR2([-0.1, 51.52], {
			visible_if: {use_bounds: 1},
		});
		// if use zoom
		use_zoom = ParamConfig.BOOLEAN(0, {hidden: true});
		zoom = ParamConfig.FLOAT(0, {
			visible_if: {use_zoom: 1},
		});
		// always
		mapbox_camera = ParamConfig.OPERATOR_PATH('/mapbox_camera1', {
			node_selection: {
				context: NodeContext.OBJ,
				types: [MapboxCameraObjNode.type()],
			},
			callback: (node: BaseNodeType) => {
				MapboxListenerSopNode.PARAM_CALLBACK_update_mapbox_camera(
					node as MapboxListenerSopNode<MapboxListenerParamsConfig>
				);
			},
		});
		zoom_range = ParamConfig.VECTOR2([0, 24]);
		// if update_always_allowed
		update_always_allowed = ParamConfig.BOOLEAN(0, {hidden: true});
		update_always = ParamConfig.BOOLEAN(0, {
			visible_if: {update_always_allowed: 1},
		});
	};
}

class MapboxListenerParamsConfig extends MapboxListenerParamConfig(NodeParamsConfig) {}
export abstract class MapboxListenerSopNode<M extends MapboxListenerParamsConfig> extends TypedSopNode<M> {
	// params_config = new MapboxListenerParamsConfig();
	protected _mapbox_listener: MapboxListener = new MapboxListener(this as MapboxListenerSopNodeWithParams);
	protected _camera_node: MapboxCameraObjNode | undefined;

	static PARAM_CALLBACK_update_mapbox_camera(node: MapboxListenerSopNode<MapboxListenerParamsConfig>) {
		node.update_mapbox_camera();
	}
	update_mapbox_camera() {
		this._camera_node = this.find_camera_node();
	}
	get camera_node() {
		return this._camera_node;
	}
	get camera_object() {
		return this._camera_node?.object;
	}
	find_camera_node(): MapboxCameraObjNode | undefined {
		const node = this.p.mapbox_camera.found_node_with_context(NodeContext.OBJ);
		if (node) {
			if (node.type == MapboxCameraObjNode.type()) {
				return node as MapboxCameraObjNode;
			} else {
				this.states.error.set('found node is not a mapbox camera');
			}
		}
	}
	abstract _post_init_controller(): void;
}

class MapboxListenerSopNodeWithParams extends MapboxListenerSopNode<MapboxListenerParamsConfig> {
	params_config = new MapboxListenerParamsConfig();
	_post_init_controller() {}
}

export class MapboxListener {
	private _current_camera_path: string | undefined;
	private _camera_controller: CameraController;
	constructor(private _node: MapboxListenerSopNodeWithParams) {
		this._camera_controller = new CameraController(this._update_from_camera.bind(this));
	}

	// _init_mapbox_listener() {
	// 	// POLY.register_map_listener(this);
	// }
	// init_camera_controller() {

	// }
	async cook() {
		if (!this._node.camera_node) {
			this._node.update_mapbox_camera();
			this._update_camera_controller();
		}
		if (!this._node.camera_node) {
			this._node.set_objects([]);
			return;
		}

		let zoom = this._node.camera_node.zoom();
		// is_camera_node_valid = @_camera_node?
		const is_mapbox_active = this._node.camera_node != null;
		const is_zoom_in_range = zoom != null && zoom > this._node.pv.zoom_range.x && zoom < this._node.pv.zoom_range.y;

		// still run if the mapbox is not active (good for debugging)
		// do_post_init_controller = is_camera_node_valid && (!is_mapbox_active || is_zoom_in_range)
		const do_post_init_controller = !is_mapbox_active || is_zoom_in_range;

		if (do_post_init_controller) {
			this._node._post_init_controller();
		} else {
			this._node.set_objects([]);
		}
	}

	_update_camera_controller() {
		this._camera_controller.set_update_always(this._node.pv.update_always || false);

		if (this._current_camera_path == null || this._current_camera_path !== this._node.pv.camera) {
			if (this._node.camera_object) {
				// if (this._is_mapbox_camera(this._camera_object)) {
				this._camera_controller.set_target(this._node.camera_object);
				// } else {
				// 	this.set_error("camera must be a mapbox camera");
				// 	this._camera_controller.remove_target();
				// }
			} else {
				this._camera_controller.remove_target();
			}

			this._current_camera_path = this._node.pv.mapbox_camera;
		}
	}

	_update_from_camera() {
		if (this._node.cook_controller.is_cooking) {
			// TODO: this should be added to a queue instead
			// or once the params are safer, simple run now
			setTimeout(this._update_from_camera.bind(this), 1000);
		} else {
			const has_zoom_param = this._node.pv.use_zoom;
			const has_bounds_params = this._node.pv.use_bounds;

			const cooker = this._node.scene.cooker;
			if (has_bounds_params || has_zoom_param) {
				cooker.block();
			}
			const camera_node = this._node.camera_node;

			if (has_bounds_params) {
				const sw_param = this._node.p.south_west;
				const ne_param = this._node.p.north_east;
				if (camera_node) {
					const bounds = camera_node.bounds();
					if (camera_node != null && bounds != null) {
						const sw = bounds.getSouthWest();
						const ne = bounds.getNorthEast();

						sw_param.set([sw.lng, sw.lat]);
						ne_param.set([ne.lng, ne.lat]);
					}
				}
			}
			if (has_zoom_param) {
				if (camera_node) {
					const zoom = camera_node.zoom();
					if (zoom) {
						this._node.p.zoom.set(zoom);
					}
				}
			}

			if (has_bounds_params || has_zoom_param) {
				cooker.unblock();
			}

			if (!has_bounds_params && !has_zoom_param) {
				this._node.set_dirty();
			}
		}
	}

	// update_mapbox_camera() {
	// 	this._node.camera_node = this._found_camera_node();
	// }
	// private _found_camera_node() {
	// 	const node = this._node.p.mapbox_camera.found_node();
	// 	if (node) {
	// 		if (
	// 			node.node_context() == NodeContext.OBJ &&
	// 			node.type == MapboxCameraObjNode.type()
	// 		) {
	// 			return node as MapboxCameraObjNode;
	// 		}
	// 	}
	// }

	// private _found_camera_object() {
	// 	return this._camera_node?.object;
	// }

	// _is_mapbox_camera() {
	// 	// TODO
	// 	return true;
	// }
}
