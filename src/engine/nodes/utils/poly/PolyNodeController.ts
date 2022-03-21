import {BaseNodeType, TypedNode} from '../../_Base';
import {NodeContext} from '../../../poly/NodeContext';
import {SceneJsonImporter} from '../../../io/json/import/Scene';
import {NodeJsonImporter} from '../../../io/json/import/Node';
import {JsonExportDispatcher} from '../../../io/json/export/Dispatcher';
import {createPolySopNode} from '../../sop/Poly';
import {createPolyObjNode} from '../../obj/Poly';
import {NodeParamsConfig, ParamTemplate} from '../params/ParamsConfig';
import {PolyNodeDefinition} from './PolyNodeDefinition';
import {PolyNodeClassByContext} from './PolyNodeClassByContext';
import {Poly} from '../../../Poly';
import {ParamOptionToAdd} from '../params/ParamsController';
import {ParamType} from '../../../poly/ParamType';
import {PolyNodeDataRegister} from './PolyNodeDataRegister';
import {createPolyAnimNode} from '../../anim/Poly';
import {createPolyGlNode} from '../../gl/Poly';

// export const IS_POLY_NODE_BOOLEAN = 'isPolyNode';

export class PolyNodeController {
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
		this.node.io.inputs.setCount(inputsData[0], inputsData[1]);
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
		const nodeImporter = new NodeJsonImporter(this.node as TypedNode<NodeContext, any>);
		nodeImporter.create_nodes(sceneImporter, childrenData);

		const ui_data = this._definition.ui;
		if (ui_data) {
			nodeImporter.processNodesUiData(sceneImporter, ui_data);
		}

		if (currentSceneLoadedState) {
			this.node.scene().loadingController.markAsLoaded();
		}
	}

	static polyNodeData(node: BaseNodeType): PolyNodeDefinition {
		const rootExporter = JsonExportDispatcher.dispatch_node(node);
		const nodesData = rootExporter.data({showPolyNodesData: true});
		const uiData = rootExporter.uiData({showPolyNodesData: true});
		const data: PolyNodeDefinition = {
			nodeContext: node.context(),
			inputs: [1, 4],
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
				return createPolyAnimNode(nodeType, data) as any;
			// audio
			// cop
			// event
			case NodeContext.GL:
				return createPolyGlNode(nodeType, data) as any;
			// mat
			// obj
			case NodeContext.OBJ:
				return createPolyObjNode(nodeType, data) as any;
			// post
			// rop
			case NodeContext.SOP:
				return createPolySopNode(nodeType, data) as any;
		}
	}
	static createNodeClassAndRegister<NC extends NodeContext>(dataRegister: PolyNodeDataRegister<NC>) {
		const {context, type, data} = dataRegister;
		const nodeClass = this._createNodeClass(context, type, data);
		if (nodeClass) {
			Poly.registerNode(nodeClass, 'polyNodes', {polyNode: true});
		}
	}
}
