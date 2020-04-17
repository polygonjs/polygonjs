import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
import {FlagsControllerD} from '../utils/FlagsController';
import {AxesHelper} from 'three/src/helpers/AxesHelper';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {GeoObjNode} from './Geo';
import {HierarchyController} from './utils/HierarchyController';
import {NodeContext} from '../../poly/NodeContext';
import {Object3DWithGeometry} from '../../../core/geometry/Group';
import {Vector3} from 'three/src/math/Vector3';
import {Object3D} from 'three/src/core/Object3D';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
class RivetObjParamConfig extends NodeParamsConfig {
	object = ParamConfig.OPERATOR_PATH('', {
		node_selection: {
			context: NodeContext.OBJ,
		},
		dependent_on_found_node: false,
		compute_on_dirty: true,
		callback: (node: BaseNodeType) => {
			RivetObjNode.PARAM_CALLBACK_update_object_position(node as RivetObjNode);
		},
	});
	point_index = ParamConfig.INTEGER(0, {
		range: [0, 100],
		callback: (node: BaseNodeType) => {
			RivetObjNode.PARAM_CALLBACK_update_object_position(node as RivetObjNode);
		},
	});
	update = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			RivetObjNode.PARAM_CALLBACK_update_object_position(node as RivetObjNode);
		},
	});
}
const ParamsConfig = new RivetObjParamConfig();

export class RivetObjNode extends TypedObjNode<Group, RivetObjParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'rivet';
	}
	readonly hierarchy_controller: HierarchyController = new HierarchyController(this);
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	private _helper = new AxesHelper(1);

	create_object() {
		return new Group();
	}
	initialize_node() {
		this.hierarchy_controller.initialize_node();
		this.io.inputs.add_on_set_input_hook('on_input_updated:update_object_position', () => {
			this.update_object_position();
		});

		// setup frame dependency to update the matrix
		const graph_node = new CoreGraphNode(this.scene, 'time');
		graph_node.add_graph_input(this.scene.time_controller.graph_node);
		graph_node.add_post_dirty_hook('rivet_on_frame_change', () => {
			setTimeout(() => {
				this.update_object_position();
			}, 0);
		});

		// helper
		this.object.add(this._helper);
		this.flags.display.add_hook(() => {
			this._helper.visible = this.flags.display.active;
		});
	}
	cook() {
		this.cook_controller.end_cook();
	}

	static PARAM_CALLBACK_update_object_position(node: RivetObjNode) {
		node.update_object_position();
	}
	private _found_point_post = new Vector3();
	update_object_position() {
		const node = this.p.object.found_node();
		if (node) {
			if (node.node_context() == NodeContext.OBJ && node.type == GeoObjNode.type()) {
				const geo_node = node as GeoObjNode;
				const sop_group = geo_node.sop_group;
				const first_child = sop_group.children[0] as Object3DWithGeometry;
				if (first_child) {
					this.update_object_position_from_object(first_child);
				}
			} else {
				this.states.error.set('found node is not a geo node');
			}
		}
	}
	update_object_position_from_object(observed_object: Object3D) {
		const geometry = (observed_object as Object3DWithGeometry).geometry;
		if (geometry) {
			const position_array = geometry.attributes['position'].array;
			this._found_point_post.fromArray(position_array, this.pv.point_index * 3);
			observed_object.updateMatrixWorld(true);
			observed_object.localToWorld(this._found_point_post);
			this.object.position.copy(this._found_point_post);
			this.object.updateMatrix();
			this.object.updateMatrixWorld(true);
		}
	}
}
