import { CoreGraphNodeId } from "../../../../core/graph/CoreGraph";
import { BaseNodeByContextMap, NodeContext } from "../../../poly/NodeContext";
import { TypedNodeTraverser } from "./NodeTraverser";
import { ShaderName, } from "./ShaderName";

export class GlNodeTraverser extends TypedNodeTraverser<NodeContext.GL> {
	leavesFromNodes(nodes: BaseNodeByContextMap[NodeContext.GL][]) {
		this._shaderName = ShaderName.LEAVES_FROM_NODES_SHADER;
		this._graph_ids_by_shader_name.set(this._shaderName, new Map());
		this._leaves_graph_id.set(this._shaderName, new Map());
		for (let node of nodes) {
			this._findLeaves(node);
		}

		const node_ids: CoreGraphNodeId[] = [];
		this._leaves_graph_id.get(this._shaderName)?.forEach((value: boolean, key: CoreGraphNodeId) => {
			node_ids.push(key);
		});
		return this._graph.nodesFromIds(node_ids) as BaseNodeByContextMap[NodeContext.GL][];
	}
}