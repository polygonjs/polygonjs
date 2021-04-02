import {PolyScene} from '../PolyScene';
import {BaseNodeType} from '../../nodes/_Base';
import {TypedPathParam} from '../../params/_BasePath';
import {MapUtils} from '../../../core/MapUtils';
import {ParamType} from '../../poly/ParamType';
import {BaseParamType} from '../../params/_Base';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';
import {OperatorPathParam} from '../../params/OperatorPath';

type BasePathParam = TypedPathParam<any>;
// class BasePathParam extends Typ

export class ReferencesController {
	private _referenced_nodes_by_src_param_id: Map<CoreGraphNodeId, BaseNodeType | BaseParamType> = new Map();
	private _referencing_params_by_referenced_node_id: Map<CoreGraphNodeId, BasePathParam[]> = new Map();
	private _referencing_params_by_all_named_node_ids: Map<CoreGraphNodeId, BasePathParam[]> = new Map();
	constructor(protected scene: PolyScene) {}

	set_reference_from_param(src_param: BasePathParam, referenced_node: BaseNodeType | BaseParamType) {
		this._referenced_nodes_by_src_param_id.set(src_param.graphNodeId(), referenced_node);
		MapUtils.pushOnArrayAtEntry(
			this._referencing_params_by_referenced_node_id,
			referenced_node.graphNodeId(),
			src_param
		);
	}
	set_named_nodes_from_param(src_param: BasePathParam) {
		const named_nodes: BaseNodeType[] = src_param.decomposed_path.named_nodes();
		for (let named_node of named_nodes) {
			MapUtils.pushOnArrayAtEntry(
				this._referencing_params_by_all_named_node_ids,
				named_node.graphNodeId(),
				src_param
			);
		}
	}
	reset_reference_from_param(src_param: BasePathParam) {
		const referenced_node = this._referenced_nodes_by_src_param_id.get(src_param.graphNodeId());
		if (referenced_node) {
			MapUtils.popFromArrayAtEntry(
				this._referencing_params_by_referenced_node_id,
				referenced_node.graphNodeId(),
				src_param
			);
			const named_nodes: BaseNodeType[] = src_param.decomposed_path.named_nodes();
			for (let named_node of named_nodes) {
				MapUtils.popFromArrayAtEntry(
					this._referencing_params_by_all_named_node_ids,
					named_node.graphNodeId(),
					src_param
				);
			}
			this._referenced_nodes_by_src_param_id.delete(src_param.graphNodeId());
		}
	}

	referencing_params(node: BaseNodeType) {
		return this._referencing_params_by_referenced_node_id.get(node.graphNodeId());
	}
	referencing_nodes(node: BaseNodeType) {
		const params = this._referencing_params_by_referenced_node_id.get(node.graphNodeId());
		if (params) {
			const node_by_node_id: Map<CoreGraphNodeId, BaseNodeType> = new Map();
			for (let param of params) {
				const node = param.node;
				node_by_node_id.set(node.graphNodeId(), node);
			}
			const nodes: BaseNodeType[] = [];
			node_by_node_id.forEach((node) => {
				nodes.push(node);
			});
			return nodes;
		}
	}
	nodes_referenced_by(node: BaseNodeType) {
		const path_param_types: Readonly<Set<ParamType>> = new Set([ParamType.OPERATOR_PATH, ParamType.NODE_PATH]);
		const path_params: BasePathParam[] = [];
		for (let param of node.params.all) {
			if (path_param_types.has(param.type())) {
				path_params.push(param as BasePathParam);
			}
		}
		const nodes_by_id: Map<CoreGraphNodeId, BaseNodeType> = new Map();
		const params: BaseParamType[] = [];
		for (let path_param of path_params) {
			this._check_param(path_param, nodes_by_id, params);
		}
		for (let param of params) {
			nodes_by_id.set(param.node.graphNodeId(), param.node);
		}
		const nodes: BaseNodeType[] = [];
		nodes_by_id.forEach((node) => {
			nodes.push(node);
		});
		return nodes;
	}
	private _check_param(
		param: BasePathParam,
		nodes_by_id: Map<CoreGraphNodeId, BaseNodeType>,
		params: BaseParamType[]
	) {
		if (param instanceof OperatorPathParam) {
			const found_node = param.found_node();
			const found_param = param.found_param();
			if (found_node) {
				nodes_by_id.set(found_node.graphNodeId(), found_node);
			}
			if (found_param) {
				params.push(found_param);
			}
			return;
		}
	}

	//
	//
	// TRACK NAME CHANGES
	//
	//
	notify_name_updated(node: BaseNodeType) {
		const referencing_params = this._referencing_params_by_all_named_node_ids.get(node.graphNodeId());
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
		const referencing_params = this._referencing_params_by_all_named_node_ids.get(node.graphNodeId());
		if (referencing_params) {
			for (let referencing_param of referencing_params) {
				if (referencing_param.options.isSelectingParam()) {
					referencing_param.notify_target_param_owner_params_updated(node);
				}
			}
		}
	}
}
