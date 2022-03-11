import {BaseNodeType} from '../../nodes/_Base';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';

type SceneCookControllerCallback = (value: void) => void;

export class SceneCookController {
	private _cooking_nodes_by_id: Map<CoreGraphNodeId, BaseNodeType> = new Map();
	private _resolves: SceneCookControllerCallback[] = [];
	constructor() {}

	addNode(node: BaseNodeType) {
		this._cooking_nodes_by_id.set(node.graphNodeId(), node);
	}
	removeNode(node: BaseNodeType) {
		this._cooking_nodes_by_id.delete(node.graphNodeId());

		if (this._cooking_nodes_by_id.size == 0) {
			this.flush();
		}
	}
	cookingNodes() {
		const list: BaseNodeType[] = [];
		this._cooking_nodes_by_id.forEach((node, id) => {
			list.push(node);
		});
		return list;
	}

	private flush() {
		let callback: SceneCookControllerCallback | undefined;
		while ((callback = this._resolves.pop())) {
			callback();
		}
	}

	async waitForCooksCompleted(): Promise<void> {
		if (this._cooking_nodes_by_id.size == 0) {
			return;
		} else {
			return new Promise((resolve, reject) => {
				this._resolves.push(resolve);
			});
		}
	}
}
