import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
import {BaseNodeType, TypedNode} from '../_Base';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {NodeContext} from '../../poly/NodeContext';
import {BaseSopNodeType} from '../sop/_Base';
import {GeoNodeChildrenMap} from '../../poly/registers/nodes/Sop';
import {FlagsControllerD} from '../utils/FlagsController';
import {HierarchyController} from './utils/HierarchyController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ChildrenDisplayController} from './utils/ChildrenDisplayController';
import {JsonExportDispatcher} from '../../io/json/export/Dispatcher';
import {ParamOptionToAdd} from '../utils/params/ParamsController';
import {ParamType} from '../../poly/ParamType';
import {NodeJsonExporterData} from '../../io/json/export/Node';
import {SceneJsonImporter} from '../../io/json/import/Scene';
import {NodeJsonImporter} from '../../io/json/import/Node';

interface PolyNodeDefinition {
	params: ParamOptionToAdd<ParamType>[];
	nodes: Dictionary<NodeJsonExporterData>;
}

const POLY_NODE_DEFINITION: PolyNodeDefinition = {
	params: [
		{
			name: 'id',
			type: ParamType.INTEGER,
			init_value: 0,
			raw_input: 0,
			options: {
				spare: true,
			},
		},
	],
	nodes: {
		box1: {type: 'box', flags: {display: false}},
		torus_knot1: {type: 'torus_knot', params: {radius: 0.32, radius_tube: 0.18}, flags: {display: false}},
		merge1: {type: 'merge', inputs: ['box1', 'transform1'], flags: {display: true}},
		transform1: {type: 'transform', params: {t: [0, 0.8, 0]}, inputs: ['torus_knot1'], flags: {display: false}},
	},
};

class PolyObjParamConfig extends NodeParamsConfig {
	display = ParamConfig.BOOLEAN(1);
	template = ParamConfig.OPERATOR_PATH('../template');
	debug = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			PolyObjNode.PARAM_CALLBACK_debug(node as PolyObjNode);
		},
	});
}
const ParamsConfig = new PolyObjParamConfig();

export class PolyObjNode extends TypedObjNode<Group, PolyObjParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'poly';
	}
	readonly hierarchy_controller: HierarchyController = new HierarchyController(this);
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	create_object() {
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}

	// display_node and children_display controllers
	public readonly children_display_controller: ChildrenDisplayController = new ChildrenDisplayController(this);
	public readonly display_node_controller: DisplayNodeController = new DisplayNodeController(
		this,
		this.children_display_controller.display_node_controller_callbacks()
	);
	//

	protected _children_controller_context = NodeContext.SOP;

	initialize_node() {
		this.hierarchy_controller.initialize_node();
		this.children_display_controller.initialize_node();

		this._init_poly_hooks();
	}

	is_display_node_cooking(): boolean {
		if (this.flags.display.active) {
			const display_node = this.display_node_controller.display_node;
			return display_node ? display_node.is_dirty : false;
		} else {
			return false;
		}
	}

	create_node<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K] {
		return super.create_node(type) as GeoNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseSopNodeType[];
	}
	nodes_by_type<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as GeoNodeChildrenMap[K][];
	}

	//
	//
	// COOK
	//
	//
	cook() {
		this.object.visible = this.pv.display;
		this.cook_controller.end_cook();
	}

	//
	//
	// POLY
	//
	//
	private _init_poly_hooks() {
		this.params.on_params_created('poly_node_init', () => {
			this.create_params_from_definition();
		});

		this.lifecycle.add_on_create_hook(() => {
			this.create_params_from_definition();
			this.create_child_nodes_from_definition();
		});
	}

	create_params_from_definition() {
		const params_data = POLY_NODE_DEFINITION.params;
		for (let param_data of params_data) {
			param_data.options = param_data.options || {};
			param_data.options.spare = true;
		}
		this.params.update_params({to_add: POLY_NODE_DEFINITION.params});
	}

	create_child_nodes_from_definition() {
		const nodes_data = POLY_NODE_DEFINITION.nodes;
		const scene_importer = new SceneJsonImporter({});
		const node_importer = new NodeJsonImporter(this as TypedNode<NodeContext, any>);
		node_importer.create_nodes(scene_importer, nodes_data);
	}

	//
	//
	// POLY TESTS
	//
	//
	static PARAM_CALLBACK_debug(node: PolyObjNode) {
		node._debug();
	}

	private _debug() {
		const node = this.p.template.found_node();
		if (node) {
			const root_exporter = JsonExportDispatcher.dispatch_node(node);
			const nodes_data = root_exporter.data();
			console.log(JSON.stringify(nodes_data.nodes));
		}
	}
}
