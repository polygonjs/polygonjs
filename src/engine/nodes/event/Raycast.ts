import {TypedEventNode} from './_Base';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';

import {BaseCameraObjNodeType} from '../obj/_BaseCamera';

import {Object3D} from 'three/src/core/Object3D';
import {Vector2} from 'three/src/math/Vector2';
import {Raycaster} from 'three/src/core/Raycaster';
import {NodeContext} from '../../poly/NodeContext';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {BaseObjNodeType} from '../obj/_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GeoObjNode} from '../obj/Geo';
import {Mesh, BufferGeometry} from 'three';
class RaycastParamsConfig extends NodeParamsConfig {
	use_camera = ParamConfig.BOOLEAN(1);
	// camera = ParamConfig.OPERATOR_PATH('/perspective_camera1', {
	// 	node_selection: {
	// 		context: NodeContext.OBJ,
	// 	},
	// 	dependent_on_found_node: false,
	// })
	target = ParamConfig.OPERATOR_PATH('/geo1', {
		node_selection: {
			context: NodeContext.OBJ,
		},
		dependent_on_found_node: false,
		callback: (node: BaseNodeType, param: BaseParamType) => {
			RaycastEventNode.PARAM_CALLBACK_update_target(node as RaycastEventNode);
		},
	});
	traverse_children = ParamConfig.BOOLEAN(0, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			RaycastEventNode.PARAM_CALLBACK_update_target(node as RaycastEventNode);
		},
	});
	sep = ParamConfig.SEPARATOR();
	mouse = ParamConfig.VECTOR2([0, 0], {cook: false});
	position = ParamConfig.VECTOR3([0, 0, 0], {cook: false});
	geo_attribute = ParamConfig.BOOLEAN(0);
	geo_attribute_name = ParamConfig.STRING('id', {
		visible_if: {do_geo_attribute: 1},
		cook: false,
	});
	geo_attribute_value = ParamConfig.FLOAT(0, {
		visible_if: {do_geo_attribute: 1},
		cook: false,
	});
}
const ParamsConfig = new RaycastParamsConfig();

export class RaycastEventNode extends TypedEventNode<RaycastParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'raycast';
	}
	private _mouse: Vector2 = new Vector2();
	private _mouse_array: Number2 = [0, 0];
	private _raycaster = new Raycaster();
	private _resolved_target: Object3D | undefined;
	private _intersection_position: Number3 = [0, 0, 0];

	initialize_node() {
		// TODO: do not use GL connection Types here
		this.io.inputs.set_named_input_connection_points([
			new TypedNamedConnectionPoint('trigger', ConnectionPointType.BOOL),
		]);
		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint('next', ConnectionPointType.BOOL),
		]);
	}

	process_event(event: Event, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType) {
		if (event instanceof MouseEvent) {
			this._mouse.x = (event.offsetX / canvas.offsetWidth) * 2 - 1;
			this._mouse.y = -(event.offsetY / canvas.offsetHeight) * 2 + 1;
			this._mouse.toArray(this._mouse_array);
			this.p.mouse.set(this._mouse_array);
		}
		if (this.pv.use_camera) {
			this._raycaster.setFromCamera(this._mouse, camera_node.object);
		} else {
			// this._raycaster.ray.origin.copy(this.pv.ray_origin)
			// this._raycaster.ray.direction.copy(this.pv.ray_direction)
		}
		if (this._resolved_target) {
			const intersections = this._raycaster.intersectObject(this._resolved_target, true);
			const intersection = intersections[0];
			if (intersection) {
				intersection.point.toArray(this._intersection_position);
				this.p.position.set(this._intersection_position);

				if (this.pv.do_geo_attribute) {
					const geometry = (intersection.object as Mesh).geometry as BufferGeometry;
					if (geometry) {
						const attribute = geometry.getAttribute(this.pv.geo_attribute_name);
						if (attribute) {
							const val = attribute.array[0];
							if (val) {
								console.log('set val', val);
								this.p.geo_attribute_value.set(val);
							}
						}
					}
				}
			}
		}
	}

	update_target() {
		const node = this.p.target.found_node() as BaseObjNodeType;
		if (node) {
			if (node.node_context() == NodeContext.OBJ) {
				this._resolved_target = this.pv.traverse_children ? node.object : (node as GeoObjNode).sop_group;
			} else {
				this.states.error.set('target is not an obj');
			}
		} else {
			this.states.error.set('no target found');
		}
	}

	static PARAM_CALLBACK_update_target(node: RaycastEventNode) {
		node.update_target();
	}
}
