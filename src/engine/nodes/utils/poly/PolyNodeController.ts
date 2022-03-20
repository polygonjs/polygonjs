import {ParamOptionToAdd} from '../params/ParamsController';
import {ParamType} from '../../../poly/ParamType';
import {NodeJsonExporterData, NodeJsonExporterUIData} from '../../../io/json/export/Node';
import {BaseNodeType, TypedNode} from '../../_Base';
import {NodeContext} from '../../../poly/NodeContext';
import {SceneJsonImporter} from '../../../io/json/import/Scene';
import {NodeJsonImporter} from '../../../io/json/import/Node';
import {JsonExportDispatcher} from '../../../io/json/export/Dispatcher';
import {createPolySopNode, BasePolySopNode} from '../../sop/Poly';
import {createPolyObjNode, BasePolyObjNode} from '../../obj/Poly';
import {PolyDictionary} from '../../../../types/GlobalTypes';
import {NodePathParam} from '../../../params/NodePath';

export interface PolyNodeDefinition {
	nodeContext: NodeContext;
	inputs?: [number, number];
	params?: ParamOptionToAdd<ParamType>[];
	nodes?: PolyDictionary<NodeJsonExporterData>;
	ui?: PolyDictionary<NodeJsonExporterUIData>;
}

type PolyNodeClassByContextMapGeneric = {[key in NodeContext]: any};
export interface PolyNodeClassByContext extends PolyNodeClassByContextMapGeneric {
	[NodeContext.ACTOR]: undefined;
	[NodeContext.ANIM]: undefined;
	[NodeContext.AUDIO]: undefined;
	[NodeContext.COP]: undefined;
	[NodeContext.EVENT]: undefined;
	[NodeContext.GL]: undefined;
	[NodeContext.JS]: undefined;
	[NodeContext.MANAGER]: undefined;
	[NodeContext.MAT]: undefined;
	[NodeContext.OBJ]: typeof BasePolyObjNode;
	[NodeContext.ROP]: undefined;
	[NodeContext.SOP]: typeof BasePolySopNode;
}

export const IS_POLY_NODE_BOOLEAN = 'isPolyNode';

export class PolyNodeController {
	constructor(private node: BaseNodeType, private _definition: PolyNodeDefinition) {}

	initializeNode() {
		this._initInputs();

		// add hooks
		this.node.params.onParamsCreated('PolyNodeInit', () => {
			this._createParamsFromDefinition();
		});

		this.node.lifecycle.onAfterCreated(() => {
			this._createParamsFromDefinition();
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

	private _createParamsFromDefinition() {
		const paramsData = this._definition.params;
		if (!paramsData) {
			return;
		}
		for (let paramData of paramsData) {
			paramData.options = paramData.options || {};
			paramData.options.spare = true;
		}
		this.node.params.updateParams({toAdd: paramsData});
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

	debug(param: NodePathParam) {
		const node = param.value.node();
		if (node) {
			const data = PolyNodeController.polyNodeData(node);
			console.log(JSON.stringify(data));
		}
	}
	static polyNodeData(node: BaseNodeType): PolyNodeDefinition {
		const rootExporter = JsonExportDispatcher.dispatch_node(node);
		const nodesData = rootExporter.data({showPolyNodesData: true});
		const uiData = rootExporter.uiData({showPolyNodesData: true});
		const data: PolyNodeDefinition = {
			nodeContext: node.context(),
			inputs: [1, 4],
			params: [],
			nodes: nodesData.nodes,
			ui: uiData.nodes,
		};
		return data;
	}

	static createNodeClass<NC extends NodeContext>(
		nodeType: string,
		nodeContext: NC,
		definition: PolyNodeDefinition
	): PolyNodeClassByContext[NC] | undefined {
		switch (nodeContext) {
			case NodeContext.SOP:
				return createPolySopNode(nodeType, definition) as any;
			case NodeContext.OBJ:
				return createPolyObjNode(nodeType, definition) as any;
		}
	}
}
