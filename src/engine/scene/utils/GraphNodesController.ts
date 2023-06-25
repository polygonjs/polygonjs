import {PolyScene} from '../PolyScene';
import {BaseNodeType} from '../../nodes/_Base';
import {BaseParamType} from '../../params/_Base';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';
import {Ref, ref} from '@vue/reactivity';

type GraphNode = BaseNodeType | BaseParamType;
export class GraphNodesController {
	private _graphNodeIdByPath: Map<string, Ref<CoreGraphNodeId | null>> = new Map();
	private _pathByGraphNodeId: Map<CoreGraphNodeId, string> = new Map();
	constructor(protected scene: PolyScene) {}

	notifyNodePathChanged(node: BaseNodeType) {
		this._notifyGraphNodePathChanged(node);
		const params = node.params.all;
		for (const param of params) {
			this.notifyParamPathChanged(param);
		}

		node.childrenController?.traverseChildren((child) => {
			this._notifyGraphNodePathChanged(child);
		});
	}
	notifyParamPathChanged(param: BaseParamType) {
		this._notifyGraphNodePathChanged(param);
	}
	private _notifyGraphNodePathChanged(node: GraphNode) {
		const id = node.graphNodeId();
		const newPath = node.path();
		// set id of previous path to null
		const previousPath = this._pathByGraphNodeId.get(id);
		if (previousPath != null) {
			const _ref = this._graphNodeIdByPath.get(previousPath);
			if (_ref) {
				_ref.value = null;
			}
		}
		if (node.disposed) {
			return;
		}

		// set new path
		const _ref = this._findOrCreateRef(newPath);
		_ref.value = id;
		this._pathByGraphNodeId.set(id, newPath);
	}
	pathRef(path: string) {
		return this._findOrCreateRef(path);
	}
	private _findOrCreateRef(path: string) {
		let _ref = this._graphNodeIdByPath.get(path);
		if (!_ref) {
			_ref = ref(null);
			this._graphNodeIdByPath.set(path, _ref);
		}
		return _ref;
	}
}
