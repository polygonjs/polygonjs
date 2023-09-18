import {MapUtils} from '../../../../../../core/MapUtils';
import {SetUtils} from '../../../../../../core/SetUtils';
import {sanitizeName} from '../../../../../../core/String';
import {NodeContext} from '../../../../../poly/NodeContext';
import {ActorBuilderNode} from '../../../../../scene/utils/ActorsManager';
// import {ActorSopNode} from '../../../../sop/Actor';
import {BaseJsConnectionPoint, JsConnectionPointType} from '../../../../utils/io/connections/Js';
import {BaseJsNodeType} from '../../../_Base';

type ConnectionPointCallback = (connectionPoint: BaseJsConnectionPoint) => boolean;

export function nodeMethodName(node: BaseJsNodeType, outputName?: string): string {
	const functionNode = node.functionNode();
	if (functionNode == null) {
		return node.name();
	}
	const pathWithoutParentPath = node.path().replace(functionNode.path(), '');
	const sanitizedPath = sanitizeName(pathWithoutParentPath);
	const pathWithoutForwardSlash = sanitizedPath.substring(1);
	// we remove the underscore inside the name,
	// so that we can find the method and highlight it in the editor,
	// without assuming that what's after the underscore is the name of the output
	const pathWithoutUnderscore = pathWithoutForwardSlash.replace(/_/g, '');
	const sanitized = pathWithoutUnderscore;
	if (outputName) {
		return `${sanitized}_${outputName}`;
	} else {
		return sanitized;
	}
}
interface MethodNameData {
	outputName: string;
	nodeName: string;
	methodNameWithoutOutputName: string;
}
export function methodNameData(methodName: string): MethodNameData {
	const elements = methodName.split('_');
	if (elements.length > 1) {
		const outputName = elements[elements.length - 1];
		const nodeName = elements[elements.length - 2];
		elements.pop();
		const methodNameWithoutOutputName = elements.join('_');
		return {outputName, nodeName, methodNameWithoutOutputName};
	} else {
		const outputName = JsConnectionPointType.TRIGGER;
		const nodeName = elements[elements.length - 2];
		const methodNameWithoutOutputName = methodName;
		return {outputName, nodeName, methodNameWithoutOutputName};
	}
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
		if (triggerConnections != null && triggerConnections.size > 0) {
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
	parent: ActorBuilderNode,
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
export function findTriggeringNodes(parent: ActorBuilderNode): Set<BaseJsNodeType> {
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
				triggerableNodes.add(triggerConnection.nodeDest());
				if (recursive) {
					connectedTriggerableNodes({
						triggeringNodes: new Set([triggerConnection.nodeDest()]),
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

const _nonTriggerInputNodes: Set<BaseJsNodeType> = new Set();
const _nonTriggerInputIndices: number[] = [];
export function inputNodesFromConnectionWithCallback(node: BaseJsNodeType, callback: ConnectionPointCallback) {
	_nonTriggerInputNodes.clear();
	_nonTriggerInputIndices.length = 0;
	const inputConnectionPoints = node.io.inputs.namedInputConnectionPoints();
	let i = 0;
	for (let outputConnectionPoint of inputConnectionPoints) {
		if (callback(outputConnectionPoint)) {
			_nonTriggerInputIndices.push(i);
		}
		i++;
	}
	for (let nonTriggerInputIndex of _nonTriggerInputIndices) {
		const connection = node.io.connections.inputConnection(nonTriggerInputIndex);
		if (connection) {
			_nonTriggerInputNodes.add(connection.nodeSrc());
		}
	}
	return SetUtils.toArray(_nonTriggerInputNodes, []);
}
export function inputNodesExceptTrigger(node: BaseJsNodeType) {
	// return inputNodesFromConnectionWithCallback(node, (c) => c.type() != JsConnectionPointType.TRIGGER);
	// update:
	// I initially thought we should not take into account node when only connected via a trigger connection,
	// but that fails with the onObjectAttributeUpdate,
	// if it is only connected via its trigger, as its inputs are then not parsed,
	// which is very much needed when using a different object as input
	return inputNodesFromConnectionWithCallback(node, (c) => true);
}

export function triggerInputIndex(triggeringNode: BaseJsNodeType, triggeredNode: BaseJsNodeType): number | null {
	const triggerOutputIndices = getOutputIndices(triggeringNode, (c) => c.type() == JsConnectionPointType.TRIGGER);

	let index: number | null = null;
	for (let triggerOutputIndex of triggerOutputIndices) {
		const triggerConnections = triggeringNode.io.connections.outputConnectionsByOutputIndex(triggerOutputIndex);
		if (triggerConnections) {
			triggerConnections.forEach((triggerConnection) => {
				if (triggerConnection.nodeDest() == triggeredNode) {
					index = triggerConnection.inputIndex();
				}
			});
		}
	}
	return index;
}

const _triggerableNodesSet = new Set<BaseJsNodeType>();
const _triggerableNodes: BaseJsNodeType[] = [];
export function triggerableMethodCalls(triggeringNode: BaseJsNodeType) {
	_triggerableNodesSet.clear();
	connectedTriggerableNodes({
		triggeringNodes: new Set([triggeringNode]),
		triggerableNodes: _triggerableNodesSet,
		recursive: false,
	});
	SetUtils.toArray(_triggerableNodesSet, _triggerableNodes);
	// const triggerableMethodNames = SetUtils.toArray(currentTriggerableNodes).map((n) =>
	// 	nodeMethodName(n)
	// );
	// const triggerableMethodNames = SetUtils.toArray(currentTriggerableNodes).map((n) =>
	// 	nodeMethodName(n)
	// );
	const methodCalls: string[] = [];
	for (let triggerableNode of _triggerableNodes) {
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
