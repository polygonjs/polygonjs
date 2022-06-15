import {Constructor} from '../../../../../types/GlobalTypes';
import {BaseNodeType} from '../../../_Base';
import {ParamConfig} from '../../../utils/params/ParamsConfig';
import {RootManagerNode} from '../../Root';
import {PolyScene} from '../../../../scene/PolyScene';
import {SetUtils} from '../../../../../core/SetUtils';
import {Poly} from '../../../../Poly';
import {ArrayUtils} from '../../../../../core/ArrayUtils';
import {BaseObjNodeType} from '../../../obj/_Base';
import {GeoObjNode} from '../../../obj/Geo';

class NodeGroup {
	public readonly totalCount: number;
	private _processed: Set<BaseNodeType>;
	private _remaining: Set<BaseNodeType>;
	constructor(public readonly nodes: BaseNodeType[]) {
		this.totalCount = nodes.length;
		this._processed = new Set();
		this._remaining = SetUtils.fromArray(nodes);
	}
	markNodeAsProcessed(node: BaseNodeType) {
		this._processed.add(node);
		this._remaining.delete(node);
	}
	isNodeProcessed(node: BaseNodeType) {
		return this._processed.has(node);
	}
	processedCount(): number {
		return this._processed.size;
	}
}

export interface OnProgressArguments {
	scene: PolyScene;
	triggerNode?: BaseNodeType;
	groups: {
		cook: NodeGroup;
		sopGroup: NodeGroup;
	};
}
export type OnProgressUpdateCallback = (progressRatio: number, args: OnProgressArguments) => void;

export function RootLoadProgressParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param when the scene loads, nodes that match the mask will update the progress bar as they cook */
		nodesMask = ParamConfig.STRING('*/image* */envMap*', {
			cook: false,
			separatorBefore: true,
		});
		/** @param prints which nodes match the mask in the console */
		printNodes = ParamConfig.BUTTON(null, {
			cook: false,
			callback: (node: BaseNodeType) => {
				RootLoadProgressController.PARAM_CALLBACK_printResolve(node as RootManagerNode);
			},
		});
	};
}

export class RootLoadProgressController {
	constructor(protected node: RootManagerNode) {}

	static async PARAM_CALLBACK_printResolve(node: RootManagerNode) {
		const nodes = await node.loadProgress.resolvedNodes();
		console.log(nodes);
		const nodePaths = nodes.map((node) => node.path()).sort();
		console.log(nodePaths);
	}
	async resolvedNodes() {
		const param = this.node.p.nodesMask;
		if (param.isDirty()) {
			await param.compute();
		}
		const mask = param.value;
		const scene = this.node.scene();
		const nodes = scene.nodesController.nodesFromMask(mask || '');

		return ArrayUtils.uniq(nodes.concat(await this._loadDisplayNodes()));
	}
	private async _loadDisplayNodes() {
		const scene = this.node.scene();
		// we also need to get the cameras at the obj level
		const cameraNodeTypes = Poly.camerasRegister.registeredNodeTypes();
		const cameraNodes = cameraNodeTypes.map((type) => scene.nodesByType(type)).flat();
		// and we also need to get the displayed nodes
		const displayNodes = this._displayNodes();
		const nodes = cameraNodes.concat(displayNodes);
		const cameraCreatorNode = await this.cameraCreatorNode();
		if (cameraCreatorNode) {
			nodes.push(cameraCreatorNode);
		}
		return ArrayUtils.uniq(nodes);
	}
	private _displayNodes() {
		const objNodesWithDisplayNodeController = this._objectNodesWithDisplayNodeController();
		const displayNodes = ArrayUtils.compact(
			objNodesWithDisplayNodeController.map((node) => (node as GeoObjNode).displayNodeController.displayNode())
		);
		return displayNodes;
	}
	private _objectNodesWithDisplayNodeController() {
		const scene = this.node.scene();
		const objNodesWithDisplayNodeController = scene
			.root()
			.children()
			.filter((node) => (node as BaseObjNodeType).displayNodeController != null)
			.filter((node) => node.flags?.display?.active());
		return objNodesWithDisplayNodeController;
	}
	// private _getNodesWithSopGroup() {
	// 	return this._displayNodes().filter((node) => (node as GeoObjNode).childrenDisplayController != null);
	// }
	public cameraCreatorNode() {
		return this.node.mainCameraController.cameraCreatorNode();
	}

	private _toCook: NodeGroup | undefined;
	private _sopGroupToUpdate: NodeGroup | undefined;
	private _onProgressUpdateCallback: OnProgressUpdateCallback | undefined;
	private _runCallback(progress: number, nodeTrigger?: BaseNodeType) {
		if (!(this._onProgressUpdateCallback && this._toCook && this._sopGroupToUpdate)) {
			return;
		}
		this._onProgressUpdateCallback(progress, {
			scene: this.node.scene(),
			triggerNode: undefined,
			groups: {
				cook: this._toCook,
				sopGroup: this._sopGroupToUpdate,
			},
		});
	}
	private _updateProgressAndRunCallback(nodeTrigger: BaseNodeType) {
		if (!(this._onProgressUpdateCallback && this._toCook && this._sopGroupToUpdate)) {
			return;
		}
		const totalNodesCount = this._toCook.totalCount + this._sopGroupToUpdate.totalCount;
		const processedNodesCount = this._toCook.processedCount() + this._sopGroupToUpdate.processedCount();
		const progress = processedNodesCount / totalNodesCount;
		this._runCallback(progress, nodeTrigger);
	}

	async watchNodesProgress(callback: OnProgressUpdateCallback) {
		this._onProgressUpdateCallback = callback;
		const nodesToCook = (await this.resolvedNodes()).filter((node) => node.isDirty());
		this._toCook = new NodeGroup(nodesToCook);
		const nodesToUpdateSopGroup = this._objectNodesWithDisplayNodeController()
			.filter((node) => {
				const displayNode = (node as GeoObjNode).displayNodeController.displayNode();
				return displayNode != null && !displayNode.flags.bypass?.active();
			})
			.filter((node) => node.isDirty());
		this._sopGroupToUpdate = new NodeGroup(nodesToUpdateSopGroup);
		const totalNodesCount = this._toCook.totalCount + this._sopGroupToUpdate.totalCount;
		if (totalNodesCount == 0) {
			this._runCallback(1);
			return;
		}
		this._watchNodesWithSopGroup();
		this._watchNodesToCook();
	}
	private async _watchNodesToCook() {
		const nodesGroup = this._toCook;
		if (!nodesGroup) {
			return;
		}
		const callbackName = 'RootLoadProgressController';

		const onNodeCooked = (node: BaseNodeType) => {
			if (!nodesGroup.isNodeProcessed(node)) {
				nodesGroup.markNodeAsProcessed(node);

				this._updateProgressAndRunCallback(node);

				node.cookController.deregisterOnCookEnd(callbackName);
			}
		};

		for (let node of nodesGroup.nodes) {
			node.cookController.registerOnCookEnd(callbackName, () => {
				onNodeCooked(node);
			});
			// we force nodes to compute
			// in case they do not have a display flag on, or are not connected
			// as it would get the loading stuck
			node.compute();
		}
	}
	private _watchNodesWithSopGroup() {
		const nodesGroup = this._sopGroupToUpdate;
		if (!nodesGroup) {
			return;
		}
		const callbackName = 'RootLoadProgressController';

		const onNodeCooked = (node: BaseNodeType) => {
			if (!nodesGroup.isNodeProcessed(node)) {
				nodesGroup.markNodeAsProcessed(node);

				this._updateProgressAndRunCallback(node);

				const childrenDisplayController = (node as GeoObjNode).childrenDisplayController;
				childrenDisplayController.deregisterOnSopGroupUpdated(callbackName);
			}
		};

		for (let node of nodesGroup.nodes) {
			const childrenDisplayController = (node as GeoObjNode).childrenDisplayController;
			childrenDisplayController.registerOnSopGroupUpdated(callbackName, () => {
				onNodeCooked(node);
			});
		}
	}
}
