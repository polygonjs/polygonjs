import {OperatorPathParam} from '../../../params/OperatorPath';
import {ParamOptionToAdd} from '../params/ParamsController';
import {ParamType} from '../../../poly/ParamType';
import {NodeJsonExporterData, NodeJsonExporterUIData} from '../../../io/json/export/Node';
import {BaseNodeType, TypedNode} from '../../_Base';
import {NodeContext} from '../../../poly/NodeContext';
import {SceneJsonImporter} from '../../../io/json/import/Scene';
import {NodeJsonImporter} from '../../../io/json/import/Node';
import {JsonExportDispatcher} from '../../../io/json/export/Dispatcher';
import {createPolySopNode} from '../../sop/Poly';
import {createPolyObjNode} from '../../obj/Poly';
import {PolyDictionary} from '../../../../types/GlobalTypes';

export interface PolyNodeDefinition {
	nodeContext: NodeContext;
	inputs?: [number, number];
	params?: ParamOptionToAdd<ParamType>[];
	nodes?: PolyDictionary<NodeJsonExporterData>;
	ui?: PolyDictionary<NodeJsonExporterUIData>;
}

export class PolyNodeController {
	constructor(private node: BaseNodeType, private _definition: PolyNodeDefinition) {}

	initialize_node() {
		this.init_inputs();

		// add hooks
		this.node.params.on_params_created('poly_node_init', () => {
			this.create_params_from_definition();
		});

		this.node.lifecycle.add_on_create_hook(() => {
			this.create_params_from_definition();
			this.createChildNodesFromDefinition();
		});
	}

	private init_inputs() {
		const inputs_data = this._definition.inputs;
		if (!inputs_data) {
			return;
		}
		this.node.io.inputs.set_count(inputs_data[0], inputs_data[1]);
	}

	create_params_from_definition() {
		const params_data = this._definition.params;
		if (!params_data) {
			return;
		}
		for (let param_data of params_data) {
			param_data.options = param_data.options || {};
			param_data.options.spare = true;
		}
		this.node.params.update_params({to_add: params_data});
	}

	createChildNodesFromDefinition() {
		const nodes_data = this._definition.nodes;
		if (!nodes_data) {
			return;
		}
		// TODO: this is to avoid creating gl globals and output nodes
		// but there should be a better way, on a per-node basis.
		// Especially since it can create problem when loading a scene with gl builders
		// as those may trigger the creation of globals and output nodes too early, resulting in a broken load
		const current_scene_loaded_state: boolean = this.node.scene().loadingController.loaded();
		if (current_scene_loaded_state) {
			this.node.scene().loadingController.markAsLoading();
		}

		const scene_importer = new SceneJsonImporter({});
		const node_importer = new NodeJsonImporter(this.node as TypedNode<NodeContext, any>);
		node_importer.create_nodes(scene_importer, nodes_data);

		const ui_data = this._definition.ui;
		if (ui_data) {
			node_importer.process_nodes_ui_data(scene_importer, ui_data);
		}

		if (current_scene_loaded_state) {
			this.node.scene().loadingController.markAsLoaded();
		}
	}

	debug(param: OperatorPathParam) {
		const node = param.found_node();
		if (node) {
			const root_exporter = JsonExportDispatcher.dispatch_node(node);
			const nodes_data = root_exporter.data({showPolyNodesData: true});
			const ui_data = root_exporter.ui_data({showPolyNodesData: true});
			const data: PolyNodeDefinition = {
				nodeContext: node.nodeContext(),
				inputs: [0, 0],
				params: [],
				nodes: nodes_data.nodes,
				ui: ui_data.nodes,
			};
			console.log(JSON.stringify(data));
		}
	}

	static createNodeClass(node_type: string, node_context: NodeContext, definition: PolyNodeDefinition) {
		switch (node_context) {
			case NodeContext.SOP:
				return createPolySopNode(node_type, definition);
			case NodeContext.OBJ:
				return createPolyObjNode(node_type, definition);
		}
	}
}
