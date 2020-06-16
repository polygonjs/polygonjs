import {BaseNodeType, TypedNode} from '../_Base';
import {JsonExportDispatcher} from '../../io/json/export/Dispatcher';
import {ParamType} from '../../poly/ParamType';
import {ParamOptionToAdd} from '../utils/params/ParamsController';
import {SubnetSopNodeLike} from './utils/subnet/ChildrenDisplayController';
import {NodeJsonExporterData} from '../../io/json/export/Node';
import {NodeContext} from '../../poly/NodeContext';
import {SceneJsonImporter} from '../../io/json/import/Scene';
import {NodeJsonImporter} from '../../io/json/import/Node';

interface PolyNodeDefinition {
	inputs: [number, number];
	params: ParamOptionToAdd<ParamType>[];
	nodes: Dictionary<NodeJsonExporterData>;
}

const POLY_NODE_DEFINITION: PolyNodeDefinition = {
	inputs: [0, 4], // make it 0,4 for now to have the subnet input hook itself correctly
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
		subnet_input1: {type: 'subnet_input', flags: {display: true}},
		subnet_output1: {type: 'subnet_output', inputs: ['transform1'], flags: {display: false}},
		box1: {type: 'box', flags: {display: false}},
		transform1: {
			type: 'transform',
			params: {r: [0, '$F*ch("../id")', 0]},
			inputs: ['box1'],
			flags: {display: false},
		},
	},
};

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class PolySopParamsConfig extends NodeParamsConfig {
	template = ParamConfig.OPERATOR_PATH('../template');
	debug = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			PolySopNode.PARAM_CALLBACK_debug(node as PolySopNode);
		},
	});
}
const ParamsConfig = new PolySopParamsConfig();

export class PolySopNode extends SubnetSopNodeLike<PolySopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'poly';
	}

	initialize_node() {
		const inputs = POLY_NODE_DEFINITION.inputs;
		this.io.inputs.set_count(inputs[0], inputs[1]);

		this._init_poly_hooks();
	}

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

	static PARAM_CALLBACK_debug(node: PolySopNode) {
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
