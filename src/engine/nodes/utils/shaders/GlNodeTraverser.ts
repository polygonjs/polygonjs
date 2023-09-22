import {CoreGraphNodeId} from '../../../../core/graph/CoreGraph';
import {CoreGraphNode} from '../../../../core/graph/CoreGraphNode';
import {BaseNodeByContextMap, NodeContext} from '../../../poly/NodeContext';
import {TypedNodeTraverser} from './NodeTraverser';
import {ShaderName} from './ShaderName';

const _nodeIds: CoreGraphNodeId[] = [];
export class GlNodeTraverser extends TypedNodeTraverser<NodeContext.GL> {
	leavesFromNodes(nodes: BaseNodeByContextMap[NodeContext.GL][]) {
		this._shaderName = ShaderName.LEAVES_FROM_NODES_SHADER;
		this._graph_ids_by_shader_name.set(this._shaderName, new Map());
		this._leaves_graph_id.set(this._shaderName, new Map());
		for (const node of nodes) {
			this._findLeaves(node);
		}

		_nodeIds.length = 0;
		this._leaves_graph_id.get(this._shaderName)?.forEach((value: boolean, key: CoreGraphNodeId) => {
			_nodeIds.push(key);
		});
		const selectedNodes: CoreGraphNode[] = [];
		this._graph.nodesFromIds(_nodeIds, selectedNodes);
		return selectedNodes as BaseNodeByContextMap[NodeContext.GL][];
	}
}
