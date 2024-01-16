import {PolyScene} from '../PolyScene';
import {BaseNodeType} from '../../nodes/_Base';
import {TypedPathParam} from '../../params/_BasePath';
import {pushOnArrayAtEntry, popFromArrayAtEntry} from '../../../core/MapUtils';
import {ParamType} from '../../poly/ParamType';
import {BaseParamType} from '../../params/_Base';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';
import {arrayShallowClone} from '../../../core/ArrayUtils';
import {NodePathParam} from '../../params/NodePath';

type BasePathParam = TypedPathParam<any>;
const _pathParams: BasePathParam[] = [];
// class BasePathParam extends Typ
const _nodes: BaseNodeType[] = [];

export class ReferencesController {
	private _referenced_nodes_by_src_param_id: Map<CoreGraphNodeId, BaseNodeType | BaseParamType> = new Map();
	private _referencing_params_by_referenced_node_id: Map<CoreGraphNodeId, BasePathParam[]> = new Map();
	private _referencing_params_by_all_named_node_ids: Map<CoreGraphNodeId, BasePathParam[]> = new Map();
	constructor(protected scene: PolyScene) {}

	setReferenceFromParam(src_param: BasePathParam, referencedGraphNode: BaseNodeType | BaseParamType) {
		this._referenced_nodes_by_src_param_id.set(src_param.graphNodeId(), referencedGraphNode);
		pushOnArrayAtEntry(
			this._referencing_params_by_referenced_node_id,
			referencedGraphNode.graphNodeId(),
			src_param
		);
	}
	setNamedNodesFromParam(src_param: BasePathParam) {
		src_param.decomposedPath.namedNodes(_nodes);

		for (const namedNode of _nodes) {
			pushOnArrayAtEntry(this._referencing_params_by_all_named_node_ids, namedNode.graphNodeId(), src_param);
		}
	}
	resetReferenceFromParam(src_param: BasePathParam) {
		const referenced_node = this._referenced_nodes_by_src_param_id.get(src_param.graphNodeId());
		if (referenced_node) {
			popFromArrayAtEntry(
				this._referencing_params_by_referenced_node_id,
				referenced_node.graphNodeId(),
				src_param
			);
			src_param.decomposedPath.namedNodes(_nodes);
			for (const namedNode of _nodes) {
				popFromArrayAtEntry(this._referencing_params_by_all_named_node_ids, namedNode.graphNodeId(), src_param);
			}

			this._referenced_nodes_by_src_param_id.delete(src_param.graphNodeId());
		}
	}

	referencing_params(node: BaseNodeType) {
		return this._referencing_params_by_referenced_node_id.get(node.graphNodeId());
	}
	referencingNodes(node: BaseNodeType, target: BaseNodeType[]) {
		const params = this._referencing_params_by_referenced_node_id.get(node.graphNodeId());
		target.length = 0;
		if (params) {
			const node_by_node_id: Map<CoreGraphNodeId, BaseNodeType> = new Map();
			for (const param of params) {
				const node = param.node;
				node_by_node_id.set(node.graphNodeId(), node);
			}
			node_by_node_id.forEach((node) => {
				target.push(node);
			});
		}
		return target;
	}
	nodesReferencedBy(node: BaseNodeType, target: BaseNodeType[]) {
		const path_param_types: Readonly<Set<ParamType>> = new Set([ParamType.NODE_PATH]);
		_pathParams.length = 0;
		for (const param of node.params.all) {
			if (path_param_types.has(param.type())) {
				_pathParams.push(param as BasePathParam);
			}
		}
		const nodes_by_id: Map<CoreGraphNodeId, BaseNodeType> = new Map();
		const params: BaseParamType[] = [];
		for (const pathParam of _pathParams) {
			this._check_param(pathParam, nodes_by_id, params);
		}
		for (const param of params) {
			nodes_by_id.set(param.node.graphNodeId(), param.node);
		}
		target.length = 0;
		nodes_by_id.forEach((node) => {
			target.push(node);
		});
		return target;
	}
	private _check_param(
		param: BasePathParam,
		nodes_by_id: Map<CoreGraphNodeId, BaseNodeType>,
		params: BaseParamType[]
	) {
		if (param instanceof NodePathParam) {
			const found_node = param.value.node();
			// const found_param = param.found_param();
			if (found_node) {
				nodes_by_id.set(found_node.graphNodeId(), found_node);
			}
			// if (found_param) {
			// 	params.push(found_param);
			// }
			return;
		}
	}

	//
	//
	// TRACK NAME CHANGES
	//
	//
	notifyNameUpdated(node: BaseNodeType) {
		const referencingParams = this._referencing_params_by_all_named_node_ids.get(node.graphNodeId());
		if (referencingParams) {
			// make sure to do a cloned copy, since the list will change as the params are notified to rebuild
			const referencingParamsCloned = arrayShallowClone(referencingParams);
			for (const referencingParam of referencingParamsCloned) {
				referencingParam.notifyPathRebuildRequired(node);
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
	notifyParamsUpdated(node: BaseNodeType) {
		const referencingParams = this._referencing_params_by_all_named_node_ids.get(node.graphNodeId());

		if (referencingParams) {
			// make sure to do a cloned copy, since the list will change as the params are notified to rebuild
			const referencingParamsCloned = arrayShallowClone(referencingParams);
			for (const referencingParam of referencingParamsCloned) {
				if (referencingParam.options.isSelectingParam()) {
					referencingParam.notifyTargetParamOwnerParamsUpdated(node);
				}
			}
		}
	}
}
