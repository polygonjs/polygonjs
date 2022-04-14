import {TypedNode, BaseNodeType} from '../../../nodes/_Base';
import {JsonImportDispatcher} from './Dispatcher';
import {SceneJsonImporter} from '../../../io/json/import/Scene';
import {NodeContext} from '../../../poly/NodeContext';
import {NodeJsonExporterData} from '../export/Node';
import {ParamJsonImporter} from './Param';
import {OptimizedNodesJsonImporter} from './OptimizedNodes';
import {PolyNodeJsonImporter} from './nodes/Poly';
import {Poly} from '../../../Poly';
import {NodeJsonImporter} from './Node';
import {CoreString} from '../../../../core/String';
import {PolyDictionary} from '../../../../types/GlobalTypes';
import {NodeCreateOptions} from '../../../nodes/utils/hierarchy/ChildrenController';
import {JsonImporterMigrateHelper} from './migrate/MigrateHelper';

type BaseNodeTypeWithIO = TypedNode<NodeContext, any>;
export class NodesJsonImporter<T extends BaseNodeTypeWithIO> {
	constructor(protected _node: T) {}

	process_data(scene_importer: SceneJsonImporter, data?: PolyDictionary<NodeJsonExporterData>) {
		if (!data) {
			return;
		}
		if (!(this._node.childrenAllowed() && this._node.childrenController)) {
			return;
		}

		const {optimized_names, non_optimized_names} = OptimizedNodesJsonImporter.child_names_by_optimized_state(data);
		const nonOptimizedNodes: BaseNodeTypeWithIO[] = [];
		for (let nodeName of non_optimized_names) {
			const node_data = data[nodeName];
			const nodeType = JsonImporterMigrateHelper.migrateNodeType(this._node, node_data['type'].toLowerCase());
			const paramsInitValueOverrides = ParamJsonImporter.non_spare_params_data_value(node_data['params']);
			const nodeCreateOptions: NodeCreateOptions = {
				paramsInitValueOverrides,
				nodeName,
			};

			const loadNodeAttempt = (nodeType: string, nodeCreateOptions: NodeCreateOptions) => {
				try {
					// try with current type
					const node = this._node.createNode(nodeType, nodeCreateOptions);
					if (node) {
						return node;
					}
				} catch (e) {
					// console.error(`error importing node: cannot create with type ${nodeType}`, e);
				}
			};
			let node = loadNodeAttempt(nodeType, nodeCreateOptions);
			if (!node) {
				// remap event name
				const newType = {
					onEventchildattributeupdated: 'OnChildAttributeUpdate',
					onEventmanualtrigger: 'OnManualTrigger',
					onEventobjectattributeupdated: 'OnObjectAttributeUpdate',
					oneventobjectclicked: 'OnObjectClick',
					oneventobjecthovered: 'OnObjectHover',
					oneventtick: 'OnTick',
				}[nodeType];
				if (newType) {
					node = loadNodeAttempt(newType, nodeCreateOptions);
				}
			}
			if (!node) {
				// try with camelCased type
				const nodeTypeCamelCase = CoreString.camelCase(nodeType);
				node = loadNodeAttempt(nodeTypeCamelCase, nodeCreateOptions);
			}
			if (!node) {
				// add Network
				const nodeTypeWithNetwork = `${nodeType}Network`;
				node = loadNodeAttempt(nodeTypeWithNetwork, nodeCreateOptions);
			}
			if (node) {
				nonOptimizedNodes.push(node);
			} else {
				const message = `failed to create node with type '${nodeType}'`;
				scene_importer.report.addWarning(message);
				Poly.warn(message);
			}

			// try {
			// 	// try with current type
			// 	const node = this._node.createNode(nodeType, nodeCreateOptions);
			// 	if (node) {
			// 		// node.setName(node_name);
			// 		nonOptimizedNodes.push(node);
			// 	}
			// } catch (e) {
			// 	// try with camelCased type
			// 	console.error(`error importing node: cannot create with type ${nodeType}`, e);
			// 	const nodeTypeCamelCase = CoreString.camelCase(nodeType);
			// 	try {
			// 		const node = this._node.createNode(nodeTypeCamelCase, nodeCreateOptions);
			// 		if (node) {
			// 			// node.setName(node_name);
			// 			nonOptimizedNodes.push(node);
			// 		}
			// 	} catch (e) {
			// 		// add Network
			// 		const nodeTypeWithNetwork = `${nodeType}Network`;
			// 		try {
			// 			const node = this._node.createNode(nodeTypeWithNetwork, nodeCreateOptions);
			// 			if (node) {
			// 				// node.setName(node_name);
			// 				nonOptimizedNodes.push(node);
			// 			}
			// 		} catch (e) {
			// 			const message = `failed to create node with type '${nodeType}', '${nodeTypeCamelCase}' or '${nodeTypeWithNetwork}'`;
			// 			scene_importer.report.addWarning(message);
			// 			Poly.warn(message, e);
			// 		}
			// 	}
			// }
		}

		if (optimized_names.length > 0) {
			const optimized_nodes_importer = new OptimizedNodesJsonImporter(this._node);
			optimized_nodes_importer.process_data(scene_importer, data);

			// ensure that the display node is still created
			// as it may not be if the display flag is set to a node that will
			// be part of an optimized series of nodes
			// for instance
			// A -> B > C
			// D -> E
			// if A, B and C are optimized,
			// and D, E are not
			// And B has the display flag,
			// what will happen is that B will not exist anymore
			// and the display flag will end up in either C, D or E
			// which can lead to unexpected display in the player
			if (this._node.childrenController.context == NodeContext.SOP) {
				const nodeNames = Object.keys(data);
				let nodeNameWithDisplayFlag: string | undefined = undefined;
				for (let nodeName of nodeNames) {
					const nodeData = data[nodeName];
					if (nodeData.flags?.display) {
						nodeNameWithDisplayFlag = nodeName;
					}
				}
				if (nodeNameWithDisplayFlag) {
					const existingNodeNames = nonOptimizedNodes.map((n) => n.name());
					const optimizedNodes = optimized_nodes_importer.nodes();
					for (let optimizedNode of optimizedNodes) {
						existingNodeNames.push(optimizedNode.name());
					}
					if (!existingNodeNames.includes(nodeNameWithDisplayFlag)) {
						const parentFullPath = this._node.path();
						const nodeFullPath = `${parentFullPath}/${nodeNameWithDisplayFlag}`;
						const message = `node '${nodeFullPath}' with display flag has been optimized and does not exist in player mode`;
						console.error(message);
					}
				}
			}
		}

		const importers_by_node_name: Map<string, PolyNodeJsonImporter | NodeJsonImporter<BaseNodeType>> = new Map();
		for (let node of nonOptimizedNodes) {
			const child_data = data[node.name()];
			if (child_data) {
				const importer = JsonImportDispatcher.dispatch_node(node);
				importers_by_node_name.set(node.name(), importer);
				importer.process_data(scene_importer, data[node.name()]);
			} else {
				Poly.warn(`possible import error for node ${node.name()}`);
				Poly.log('available names are', Object.keys(data).sort(), data);
			}
		}
		for (let node of nonOptimizedNodes) {
			const importer = importers_by_node_name.get(node.name());
			if (importer) {
				importer.process_inputs_data(data[node.name()]);
			}
		}
	}
}
