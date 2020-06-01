import {PolyScene} from '../PolyScene';
import {BaseNodeType} from '../../nodes/_Base';
import {OperatorPathParam} from '../../params/OperatorPath';
import {MapUtils} from '../../../core/MapUtils';
import {ParamType} from '../../poly/ParamType';
import {BaseParamType} from '../../params/_Base';

export class ReferencesController {
	private _referenced_nodes_by_src_param_id: Map<string, BaseNodeType> = new Map();
	private _referencing_params_by_referenced_node_id: Map<string, OperatorPathParam[]> = new Map();
	private _referencing_params_by_all_named_node_ids: Map<string, OperatorPathParam[]> = new Map();
	constructor(protected scene: PolyScene) {}

	set_reference_from_param(src_param: OperatorPathParam, referenced_node: BaseNodeType) {
		this._referenced_nodes_by_src_param_id.set(src_param.graph_node_id, referenced_node);
		MapUtils.push_on_array_at_entry(
			this._referencing_params_by_referenced_node_id,
			referenced_node.graph_node_id,
			src_param
		);
	}
	set_named_nodes_from_param(src_param: OperatorPathParam) {
		const named_nodes: BaseNodeType[] = src_param.decomposed_path.named_nodes();
		for (let named_node of named_nodes) {
			MapUtils.push_on_array_at_entry(
				this._referencing_params_by_all_named_node_ids,
				named_node.graph_node_id,
				src_param
			);
		}
	}
	reset_reference_from_param(src_param: OperatorPathParam) {
		const referenced_node = this._referenced_nodes_by_src_param_id.get(src_param.graph_node_id);
		if (referenced_node) {
			MapUtils.pop_from_array_at_entry(
				this._referencing_params_by_referenced_node_id,
				referenced_node.graph_node_id,
				src_param
			);
			const named_nodes: BaseNodeType[] = src_param.decomposed_path.named_nodes();
			for (let named_node of named_nodes) {
				MapUtils.pop_from_array_at_entry(
					this._referencing_params_by_all_named_node_ids,
					named_node.graph_node_id,
					src_param
				);
			}
			this._referenced_nodes_by_src_param_id.delete(src_param.graph_node_id);
		}
	}

	referencing_params(node: BaseNodeType) {
		return this._referencing_params_by_referenced_node_id.get(node.graph_node_id);
	}
	referencing_nodes(node: BaseNodeType) {
		const params = this._referencing_params_by_referenced_node_id.get(node.graph_node_id);
		if (params) {
			const node_by_node_id: Map<string, BaseNodeType> = new Map();
			for (let param of params) {
				const node = param.node;
				node_by_node_id.set(node.graph_node_id, node);
			}
			const nodes: BaseNodeType[] = [];
			node_by_node_id.forEach((node) => {
				nodes.push(node);
			});
			return nodes;
		}
	}
	nodes_referenced_by(node: BaseNodeType) {
		const operator_paths: OperatorPathParam[] = [];
		for (let param of node.params.all) {
			if (param.type == ParamType.OPERATOR_PATH) {
				operator_paths.push(param as OperatorPathParam);
			}
		}
		const nodes_by_id: Map<string, BaseNodeType> = new Map();
		const params: BaseParamType[] = [];
		for (let operator_path of operator_paths) {
			const found_node = operator_path.found_node();
			const found_param = operator_path.found_param();
			if (found_node) {
				nodes_by_id.set(found_node.graph_node_id, found_node);
			}
			if (found_param) {
				params.push(found_param);
			}
		}
		for (let param of params) {
			nodes_by_id.set(param.node.graph_node_id, param.node);
		}
		const nodes: BaseNodeType[] = [];
		nodes_by_id.forEach((node) => {
			nodes.push(node);
		});
		return nodes;
	}

	//
	//
	// TRACK NAME CHANGES
	//
	//
	notify_name_updated(node: BaseNodeType) {
		const referencing_params = this._referencing_params_by_all_named_node_ids.get(node.graph_node_id);
		if (referencing_params) {
			for (let referencing_param of referencing_params) {
				referencing_param.notify_path_rebuild_required(node);
			}
		}
	}

	//
	//
	// TRACK NODE DELETIONS/ADDITIONS
	//
	//

	//
	//
	// TRACK PARAM DELETIONS/ADDITIONS
	//
	//
	notify_params_updated(node: BaseNodeType) {
		const referencing_params = this._referencing_params_by_all_named_node_ids.get(node.graph_node_id);
		if (referencing_params) {
			for (let referencing_param of referencing_params) {
				if (referencing_param.options.is_selecting_param()) {
					referencing_param.notify_target_param_owner_params_updated(node);
				}
			}
		}
	}
}
