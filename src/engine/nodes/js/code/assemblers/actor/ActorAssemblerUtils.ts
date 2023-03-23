import {MapUtils} from '../../../../../../core/MapUtils';
import {NodeContext} from '../../../../../poly/NodeContext';
import {ActorJsSopNode} from '../../../../sop/ActorJs';
import {JsConnectionPointType} from '../../../../utils/io/connections/Js';
import {BaseJsNodeType, TRIGGER_CONNECTION_NAME} from '../../../_Base';

function isTriggeringNode(node: BaseJsNodeType): boolean {
	const cp = node.io.outputs.namedOutputConnectionPointsByName(TRIGGER_CONNECTION_NAME);
	return cp != null && cp.type() == JsConnectionPointType.TRIGGER;
}
function isTriggerableNode(node: BaseJsNodeType): boolean {
	const cp = node.io.inputs.namedInputConnectionPointsByName(TRIGGER_CONNECTION_NAME);
	return cp != null && cp.type() == JsConnectionPointType.TRIGGER;
}
function evalChildren(
	parent: ActorJsSopNode,
	nodes: Set<BaseJsNodeType>,
	testFunction: (node: BaseJsNodeType) => boolean
): void {
	nodes.clear();
	parent.childrenController?.traverseChildren((child) => {
		if (child.context() == NodeContext.JS) {
			const jsChild = child as BaseJsNodeType;
			if (testFunction(jsChild)) {
				nodes.add(jsChild);
			}
		}
	});
}
export function findTriggeringNodes(parent: ActorJsSopNode, nodes: Set<BaseJsNodeType>): void {
	evalChildren(parent, nodes, isTriggeringNode);
}
export function findTriggeringNodesNonTriggerable(parent: ActorJsSopNode, nodes: Set<BaseJsNodeType>): void {
	const _func = (node: BaseJsNodeType) => isTriggeringNode(node) && !isTriggerableNode(node);
	evalChildren(parent, nodes, _func);
}
// export function findTriggerableNodes(parent: ActorJsSopNode, nodes: Set<BaseJsNodeType>) {
// 	evalChildren(parent, nodes, isTriggerableNode);
// }

export function groupNodesByType(nodes: Set<BaseJsNodeType>, nodesByType: Map<string, Set<BaseJsNodeType>>) {
	nodesByType.clear();
	nodes.forEach((node) => {
		MapUtils.addToSetAtEntry(nodesByType, node.type(), node);
	});
}

interface ConnectedTriggerableNodesOptions {
	triggerNodes: Set<BaseJsNodeType>;
	triggerableNodes: Set<BaseJsNodeType>;
}
export function connectedTriggerableNodes(options: ConnectedTriggerableNodesOptions) {
	const {triggerNodes, triggerableNodes} = options;
	triggerableNodes.clear();
	triggerNodes.forEach((node) => {
		// get output connection points with type trigger
		let triggerOutputIndices: number[] = [];
		const outputConnectionPoints = node.io.outputs.namedOutputConnectionPoints();
		let i = 0;
		for (let outputConnectionPoint of outputConnectionPoints) {
			if (outputConnectionPoint.type() == JsConnectionPointType.TRIGGER) {
				triggerOutputIndices.push(i);
			}
			i++;
		}
		// get connected nodes
		for (let triggerOutputIndex of triggerOutputIndices) {
			const triggerConnections = node.io.connections.outputConnectionsByOutputIndex(triggerOutputIndex);
			if (triggerConnections) {
				triggerConnections.forEach((triggerConnection) => {
					triggerableNodes.add(triggerConnection.node_dest);
				});
			}
		}
	});
}
