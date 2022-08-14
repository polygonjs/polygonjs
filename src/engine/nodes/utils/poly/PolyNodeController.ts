import {BaseNodeType} from '../../_Base';
import {NodeContext} from '../../../poly/NodeContext';
import {SceneJsonImporter} from '../../../io/json/import/Scene';
import {JsonExportDispatcher} from '../../../io/json/export/Dispatcher';
import {createPolySopNode} from '../../sop/utils/poly/createPolySopNode';
import {NodeParamsConfig, ParamTemplate} from '../params/ParamsConfig';
import {PolyNodeDefinition, PolyNodesInputsData} from './PolyNodeDefinition';
import {PolyNodeClassByContext} from './PolyNodeClassByContext';
import {Poly} from '../../../Poly';
import {ParamOptionToAdd} from '../params/ParamsController';
import {ParamType} from '../../../poly/ParamType';
import {PolyNodeDataRegister} from './PolyNodeDataRegister';
import {ArrayUtils} from '../../../../core/ArrayUtils';
import {NodeInputsController} from '../io/InputsController';
import {JsonImportDispatcher} from '../../../io/json/import/Dispatcher';
import {createPolyObjNode} from '../../obj/utils/poly/createPolyObjNode';
import {createPolyAnimNode} from '../../anim/utils/poly/createPolyAnimNode';
import {createPolyGlNode} from '../../gl/utils/poly/createPolyGlNode';

// export const IS_POLY_NODE_BOOLEAN = 'isPolyNode';

export class PolyNodeController {
	private static _definitionRegister: Map<NodeContext, Map<string, PolyNodeDefinition>> = new Map();
	constructor(private node: BaseNodeType, private _definition: PolyNodeDefinition) {}

	initializeNode() {
		this._initInputs();

		// add hooks
		// this.node.params.onParamsCreated('PolyNodeInit', () => {
		// 	this._createParamsFromDefinition();
		// });

		this.node.lifecycle.onAfterCreated(() => {
			// this._createParamsFromDefinition();
			this.createChildNodesFromDefinition();
		});
	}

	private _initInputs() {
		const inputsData = this._definition.inputs;
		if (!inputsData) {
			return;
		}
		const simpleData = inputsData.simple;
		if (simpleData) {
			this.node.io.inputs.setCount(simpleData.min, simpleData.max);
		}
	}

	// private _createParamsFromDefinition() {
	// 	const paramsData = this._definition.params;
	// 	if (!paramsData) {
	// 		return;
	// 	}
	// 	for (let paramData of paramsData) {
	// 		paramData.options = paramData.options || {};
	// 		paramData.options.spare = true;
	// 	}
	// 	this.node.params.updateParams({toAdd: paramsData});
	// }
	static setupParamsConfig(paramsConfig: NodeParamsConfig, data: PolyNodeDefinition) {
		if (!data.params) {
			return;
		}
		for (let paramData of data.params) {
			const paramName = paramData.name;
			const paramType = paramData.type;
			const initValue = paramData.initValue;
			const options = paramData.options;
			(paramsConfig as any)[paramName] = new ParamTemplate(paramType, initValue, options); //ParamConfig.STRING('aa');
		}
	}

	createChildNodesFromDefinition() {
		const childrenData = this._definition.nodes;
		if (!childrenData) {
			return;
		}
		// TODO: this is to avoid creating gl globals and output nodes
		// but there should be a better way, on a per-node basis.
		// Especially since it can create problem when loading a scene with gl builders
		// as those may trigger the creation of globals and output nodes too early, resulting in a broken load
		const currentSceneLoadedState: boolean = this.node.scene().loadingController.loaded();
		if (currentSceneLoadedState) {
			this.node.scene().loadingController.markAsLoading();
		}

		const sceneImporter = new SceneJsonImporter({});
		const dispatcher = new JsonImportDispatcher();
		const nodeImporter = dispatcher.dispatchNonPolyNode(this.node); // new NodeJsonImporter(this.node as TypedNode<NodeContext, any>);
		nodeImporter.create_nodes(sceneImporter, childrenData);

		const ui_data = this._definition.ui;
		if (ui_data) {
			nodeImporter.processNodesUiData(sceneImporter, ui_data);
		}

		if (currentSceneLoadedState) {
			this.node.scene().loadingController.markAsLoaded();
		}
	}

	static inputsData(node: BaseNodeType): PolyNodesInputsData {
		if (node.io.inputs.hasNamedInputs()) {
			const inputs = node.io.inputs as NodeInputsController<NodeContext.GL>;
			const connectionPoints = ArrayUtils.compact(inputs.namedInputConnectionPoints());
			return {
				typed: {
					types: connectionPoints.map((cp) => {
						return {
							name: cp.name(),
							type: cp.type(),
						};
					}),
				},
			};
		} else {
			return {
				simple: {
					min: node.io.inputs.minCount(),
					max: node.io.inputs.maxInputsCount(),
				},
			};
		}
	}

	static polyNodeData(node: BaseNodeType, inputsData?: PolyNodesInputsData): PolyNodeDefinition {
		const dispatcher = new JsonExportDispatcher();
		const rootExporter = dispatcher.dispatchNode(node);
		const nodesData = rootExporter.data({showPolyNodesData: true});
		const uiData = rootExporter.uiData({showPolyNodesData: true});

		const nodeInputsData = inputsData || this.inputsData(node);

		const data: PolyNodeDefinition = {
			metadata: {
				version: {
					polygonjs: '1',
				},
				createdAt: 1,
			},
			nodeContext: node.context(),
			inputs: nodeInputsData,
			params: node.params.non_spare
				.filter((p) => p.parentParam() == null)
				.map((param) => {
					const paramData: ParamOptionToAdd<ParamType> = {
						name: param.name(),
						type: param.type(),
						initValue: param.defaultValueSerialized(),
						rawInput: param.rawInputSerialized(),
						options: param.options.current(),
					};
					return paramData;
				}),
			nodes: nodesData.nodes,
			ui: uiData.nodes,
		};
		return data;
	}

	static _createNodeClass<NC extends NodeContext>(
		nodeContext: NC,
		nodeType: string,
		data: PolyNodeDefinition
	): PolyNodeClassByContext[NC] | undefined {
		switch (nodeContext) {
			// actor
			case NodeContext.ANIM:
				return createPolyAnimNode(nodeType, data, PolyNodeController) as any;
			// audio
			// cop
			// event
			case NodeContext.GL:
				return createPolyGlNode(nodeType, data, PolyNodeController) as any;
			// mat
			// obj
			case NodeContext.OBJ:
				return createPolyObjNode(nodeType, data, PolyNodeController) as any;
			// post
			// rop
			case NodeContext.SOP:
				return createPolySopNode(nodeType, data, PolyNodeController) as any;
		}
	}
	static createNodeClassAndRegister<NC extends NodeContext>(dataRegister: PolyNodeDataRegister<NC>) {
		const {node_context, node_type, data} = dataRegister;
		const nodeClass = this._createNodeClass(node_context, node_type, data);
		if (nodeClass) {
			let registerMapForContext = this._definitionRegister.get(node_context);
			if (!registerMapForContext) {
				registerMapForContext = new Map();
				this._definitionRegister.set(node_context, registerMapForContext);
			}
			registerMapForContext.set(node_type, data);
			Poly.registerNode(nodeClass, 'polyNodes', {polyNode: true});
		} else {
			console.warn('failed to create node from definition', node_context, node_type, data);
		}
	}
	static definition<NC extends NodeContext>(context: NC, type: string) {
		return this._definitionRegister.get(context)?.get(type);
	}
}
