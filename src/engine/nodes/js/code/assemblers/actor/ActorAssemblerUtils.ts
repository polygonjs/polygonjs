import {MapUtils} from '../../../../../../core/MapUtils';
import {SetUtils} from '../../../../../../core/SetUtils';
import {sanitizeName} from '../../../../../../core/String';
import {NodeContext} from '../../../../../poly/NodeContext';
import {ActorJsSopNode} from '../../../../sop/ActorJs';
import {BaseJsConnectionPoint, JsConnectionPointType} from '../../../../utils/io/connections/Js';
import {BaseJsNodeType} from '../../../_Base';

type ConnectionPointCallback = (connectionPoint: BaseJsConnectionPoint) => boolean;

export function nodeMethodName(node: BaseJsNodeType): string {
	const functionNode = node.functionNode();
	if (functionNode == null) {
		return node.name();
	}
	if (functionNode == node.parent()) {
		return node.name();
	}
	return sanitizeName(node.path().replace(functionNode.path(), ''));
}

function isTriggeringNode(node: BaseJsNodeType): boolean {
	return node.isTriggering() && _hasTriggerOutputConnected(node);
	// if(!node.isTriggering()){
	// 	return false
	// }
	// const cp = node.io.outputs.namedOutputConnectionPointsByName(TRIGGER_CONNECTION_NAME);
	// return cp != null && cp.type() == JsConnectionPointType.TRIGGER;
}
function _hasTriggerOutputConnected(node: BaseJsNodeType): boolean {
	const outputConnectionPoints = node.io.outputs.namedOutputConnectionPoints();
	let i = 0;
	let triggerOutputIndices: number[] = [];
	for (let outputConnectionPoint of outputConnectionPoints) {
		if (outputConnectionPoint.type() == JsConnectionPointType.TRIGGER) {
			triggerOutputIndices.push(i);
		}
		i++;
	}
	for (let triggerOutputIndex of triggerOutputIndices) {
		const triggerConnections = node.io.connections.outputConnectionsByOutputIndex(triggerOutputIndex);
		if (triggerConnections) {
			return true;
		}
	}
	return false;
}

// function isTriggerableNode(node: BaseJsNodeType): boolean {
// 	const cp = node.io.inputs.namedInputConnectionPointsByName(TRIGGER_CONNECTION_NAME);
// 	return cp != null && cp.type() == JsConnectionPointType.TRIGGER;
// }
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
export function findTriggeringNodes(parent: ActorJsSopNode): Set<BaseJsNodeType> {
	const nodes: Set<BaseJsNodeType> = new Set();
	evalChildren(parent, nodes, isTriggeringNode);
	return nodes;
}
// export function findTriggeringNodesNonTriggerable(parent: ActorJsSopNode): Set<BaseJsNodeType> {
// 	const nodes: Set<BaseJsNodeType> = new Set();
// 	const _func = (node: BaseJsNodeType) => isTriggeringNode(node) && !isTriggerableNode(node);
// 	evalChildren(parent, nodes, _func);
// 	return nodes;
// }
// export function findTriggerableNodes(triggeringNodes:Set<BaseJsNodeType> ):Set<BaseJsNodeType>{
// 	const nodes:Set<BaseJsNodeType> = new Set()

// 	triggeringNodes.forEach(triggeringNode=>{

// 	})

// 	return nodes
// }
// export function findTriggerableNodes(parent: ActorJsSopNode, nodes: Set<BaseJsNodeType>) {
// 	evalChildren(parent, nodes, isTriggerableNode);
// }

export function groupNodesByType(nodes: Set<BaseJsNodeType>, nodesByType: Map<string, Set<BaseJsNodeType>>) {
	nodesByType.clear();
	nodes.forEach((node) => {
		MapUtils.addToSetAtEntry(nodesByType, node.type(), node);
	});
}

export function getOutputIndices(node: BaseJsNodeType, callback: ConnectionPointCallback) {
	let triggerOutputIndices: number[] = [];
	const outputConnectionPoints = node.io.outputs.namedOutputConnectionPoints();
	let i = 0;
	for (let outputConnectionPoint of outputConnectionPoints) {
		if (callback(outputConnectionPoint) == true) {
			triggerOutputIndices.push(i);
		}
		i++;
	}
	return triggerOutputIndices;
}
export function getInputIndices(node: BaseJsNodeType, callback: ConnectionPointCallback) {
	let triggerInputIndices: number[] = [];
	const inputConnectionPoints = node.io.inputs.namedInputConnectionPoints();
	let i = 0;
	for (let inputConnectionPoint of inputConnectionPoints) {
		if (callback(inputConnectionPoint) == true) {
			triggerInputIndices.push(i);
		}
		i++;
	}
	return triggerInputIndices;
}
interface GetConnectedOutputNodesOptions {
	node: BaseJsNodeType;
	triggerOutputIndices: number[];
	triggerableNodes: Set<BaseJsNodeType>;
	recursive: boolean;
}

export function getConnectedOutputNodes(options: GetConnectedOutputNodesOptions) {
	const {node, triggerOutputIndices, triggerableNodes, recursive} = options;
	for (let triggerOutputIndex of triggerOutputIndices) {
		const triggerConnections = node.io.connections.outputConnectionsByOutputIndex(triggerOutputIndex);
		if (triggerConnections) {
			triggerConnections.forEach((triggerConnection) => {
				triggerableNodes.add(triggerConnection.node_dest);
				if (recursive) {
					connectedTriggerableNodes({
						triggeringNodes: new Set([triggerConnection.node_dest]),
						triggerableNodes,
						recursive,
					});
				}
			});
		}
	}
}

interface ConnectedTriggerableNodesOptions {
	triggeringNodes: Set<BaseJsNodeType>;
	triggerableNodes: Set<BaseJsNodeType>;
	recursive: boolean;
}
export function connectedTriggerableNodes(options: ConnectedTriggerableNodesOptions) {
	const {triggeringNodes, triggerableNodes, recursive} = options;
	triggeringNodes.forEach((node) => {
		const triggerOutputIndices = getOutputIndices(node, (c) => c.type() == JsConnectionPointType.TRIGGER);
		// get output connection points with type trigger
		// let triggerOutputIndices: number[] = [];
		// const outputConnectionPoints = node.io.outputs.namedOutputConnectionPoints();
		// let i = 0;
		// for (let outputConnectionPoint of outputConnectionPoints) {
		// 	if (outputConnectionPoint.type() == JsConnectionPointType.TRIGGER) {
		// 		triggerOutputIndices.push(i);
		// 	}
		// 	i++;
		// }
		getConnectedOutputNodes({node, triggerOutputIndices, triggerableNodes, recursive});
		// get connected nodes
		// for (let triggerOutputIndex of triggerOutputIndices) {
		// 	const triggerConnections = node.io.connections.outputConnectionsByOutputIndex(triggerOutputIndex);
		// 	if (triggerConnections) {
		// 		triggerConnections.forEach((triggerConnection) => {
		// 			triggerableNodes.add(triggerConnection.node_dest);
		// 			if (recursive) {
		// 				connectedTriggerableNodes({
		// 					triggeringNodes: new Set([triggerConnection.node_dest]),
		// 					triggerableNodes,
		// 					recursive,
		// 				});
		// 			}
		// 		});
		// 	}
		// }
	});
}

export function inputNodesFromConnectionWithCallback(node: BaseJsNodeType, callback: ConnectionPointCallback) {
	const nonTriggerInputNodes: Set<BaseJsNodeType> = new Set();
	let nonTriggerInputIndices: number[] = [];
	const inputConnectionPoints = node.io.inputs.namedInputConnectionPoints();
	let i = 0;
	for (let outputConnectionPoint of inputConnectionPoints) {
		if (callback(outputConnectionPoint)) {
			nonTriggerInputIndices.push(i);
		}
		i++;
	}
	for (let nonTriggerInputIndex of nonTriggerInputIndices) {
		const connection = node.io.connections.inputConnection(nonTriggerInputIndex);
		if (connection) {
			nonTriggerInputNodes.add(connection.node_src);
		}
	}
	return SetUtils.toArray(nonTriggerInputNodes);
}
export function inputNodesExceptTrigger(node: BaseJsNodeType) {
	return inputNodesFromConnectionWithCallback(node, (c) => c.type() != JsConnectionPointType.TRIGGER);
	// const nonTriggerInputNodes: Set<BaseJsNodeType> = new Set();
	// let nonTriggerInputIndices: number[] = [];
	// const inputConnectionPoints = node.io.inputs.namedInputConnectionPoints();
	// let i = 0;
	// for (let outputConnectionPoint of inputConnectionPoints) {
	// 	if (outputConnectionPoint.type() != JsConnectionPointType.TRIGGER) {
	// 		nonTriggerInputIndices.push(i);
	// 	}
	// 	i++;
	// }
	// for (let nonTriggerInputIndex of nonTriggerInputIndices) {
	// 	const connection = node.io.connections.inputConnection(nonTriggerInputIndex);
	// 	if (connection) {
	// 		nonTriggerInputNodes.add(connection.node_src);
	// 	}
	// }
	// return SetUtils.toArray(nonTriggerInputNodes);
}

export function triggerInputIndex(triggeringNode: BaseJsNodeType, triggeredNode: BaseJsNodeType): number | null {
	const triggerOutputIndices = getOutputIndices(triggeringNode, (c) => c.type() == JsConnectionPointType.TRIGGER);

	let index: number | null = null;
	for (let triggerOutputIndex of triggerOutputIndices) {
		const triggerConnections = triggeringNode.io.connections.outputConnectionsByOutputIndex(triggerOutputIndex);
		if (triggerConnections) {
			triggerConnections.forEach((triggerConnection) => {
				if (triggerConnection.node_dest == triggeredNode) {
					index = triggerConnection.input_index;
				}
			});
		}
	}
	return index;
}

export function triggerableMethodCalls(triggeringNode: BaseJsNodeType) {
	const triggerableNodesSet = new Set<BaseJsNodeType>();
	connectedTriggerableNodes({
		triggeringNodes: new Set([triggeringNode]),
		triggerableNodes: triggerableNodesSet,
		recursive: false,
	});
	const triggerableNodes = SetUtils.toArray(triggerableNodesSet);
	// const triggerableMethodNames = SetUtils.toArray(currentTriggerableNodes).map((n) =>
	// 	nodeMethodName(n)
	// );
	// const triggerableMethodNames = SetUtils.toArray(currentTriggerableNodes).map((n) =>
	// 	nodeMethodName(n)
	// );
	const methodCalls: string[] = [];
	for (let triggerableNode of triggerableNodes) {
		const methodName = nodeMethodName(triggerableNode);
		const argIndex = triggerInputIndex(triggeringNode, triggerableNode);
		// argIndex is used to highlight the connection
		const methodCall = `this.${methodName}(${argIndex});`;
		methodCalls.push(methodCall);
	}
	return methodCalls.join('\n');
	// const triggerableMethodCalls = triggerableMethodNames
	// 	.map((methodName) => `this.${methodName}(${})`)
	// 	.join('\n');
}
