import {MapUtils} from '../../../../../../core/MapUtils';
import {SetUtils} from '../../../../../../core/SetUtils';
import {sanitizeName} from '../../../../../../core/String';
import {NodeContext} from '../../../../../poly/NodeContext';
import {ActorJsSopNode} from '../../../../sop/ActorJs';
import {JsConnectionPointType} from '../../../../utils/io/connections/Js';
import {BaseJsNodeType} from '../../../_Base';

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

interface ConnectedTriggerableNodesOptions {
	triggeringNodes: Set<BaseJsNodeType>;
	triggerableNodes: Set<BaseJsNodeType>;
	recursive: boolean;
}
export function connectedTriggerableNodes(options: ConnectedTriggerableNodesOptions) {
	const {triggeringNodes, triggerableNodes, recursive} = options;
	triggeringNodes.forEach((node) => {
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
	});
}

export function inputNodesExceptTrigger(node: BaseJsNodeType) {
	const nonTriggerInputNodes: Set<BaseJsNodeType> = new Set();
	let nonTriggerInputIndices: number[] = [];
	const inputConnectionPoints = node.io.inputs.namedInputConnectionPoints();
	let i = 0;
	for (let outputConnectionPoint of inputConnectionPoints) {
		if (outputConnectionPoint.type() != JsConnectionPointType.TRIGGER) {
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
