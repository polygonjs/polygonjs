import {BaseNodeType} from '../../nodes/_Base';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';

type SceneCookControllerCallback = (value: void) => void;

export class SceneCookController {
	private _cookingNodesById: Map<CoreGraphNodeId, BaseNodeType> = new Map();
	private _nodeIdsHavingCookedAtLeastOnce: Set<number> = new Set();
	private _nodeIdsCookingMoreThanOnce: Set<number> = new Set();
	private _resolves: SceneCookControllerCallback[] = [];
	constructor() {}

	addNode(node: BaseNodeType) {
		const id = node.graphNodeId();
		this._cookingNodesById.set(id, node);

		if (!this._nodeIdsHavingCookedAtLeastOnce.has(id)) {
			this._nodeIdsCookingMoreThanOnce.add(id);
		}
		this._nodeIdsHavingCookedAtLeastOnce.add(id);
	}
	removeNode(node: BaseNodeType) {
		const id = node.graphNodeId();
		this._cookingNodesById.delete(id);
		this._nodeIdsCookingMoreThanOnce.delete(id);

		if (this._cookingNodesById.size == 0) {
			this.flush();
		}
	}
	cookingNodes() {
		const list: BaseNodeType[] = [];
		this._cookingNodesById.forEach((node, id) => {
			list.push(node);
		});
		return list;
	}

	allNodesHaveCookedAtLeastOnce() {
		return this._nodeIdsCookingMoreThanOnce.size == 0;
	}

	private flush() {
		let callback: SceneCookControllerCallback | undefined;
		while ((callback = this._resolves.pop())) {
			callback();
		}
	}

	async waitForCooksCompleted(): Promise<void> {
		if (this._cookingNodesById.size == 0) {
			return;
		} else {
			return new Promise((resolve, reject) => {
				this._resolves.push(resolve);
			});
		}
	}
}
