import {BaseNodeClassWithDisplayFlag, BaseNodeType} from '../_Base';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';

type DisplayControllerCallback = () => void;
export interface DisplayNodeControllerCallbacks {
	onDisplayNodeRemove: DisplayControllerCallback;
	onDisplayNodeSet: DisplayControllerCallback;
	onDisplayNodeUpdate: DisplayControllerCallback;
}

/*
handles callbacks when the children's display flag is updated
*/
interface DisplayNodeControllerOptions {
	dependsOnDisplayNode: boolean;
}
const DEFAULT_DISPLAY_NODE_CONTROLLER_OPTIONS: DisplayNodeControllerOptions = {
	dependsOnDisplayNode: true,
};
export class DisplayNodeController {
	private _initialized: boolean = false;
	private _graph_node: CoreGraphNode;
	private _display_node: BaseNodeClassWithDisplayFlag | undefined = undefined;
	private _onDisplayNodeRemoveCallback: DisplayControllerCallback | undefined;
	private _onDisplayNodeSetCallback: DisplayControllerCallback | undefined;
	private _onDisplayNodeUpdateCallback: DisplayControllerCallback | undefined;

	// TODO: the node could be a different than BaseNodeType
	// at least there should be a way to infer that it is a node
	// with children that have a display flag. This would avoid all the flags?.display?... below
	constructor(
		protected node: BaseNodeType,
		callbacks: DisplayNodeControllerCallbacks,
		private options: DisplayNodeControllerOptions = DEFAULT_DISPLAY_NODE_CONTROLLER_OPTIONS
	) {
		this._graph_node = new CoreGraphNode(node.scene(), 'DisplayNodeController');
		(this._graph_node as any).node = node;
		this._onDisplayNodeRemoveCallback = callbacks.onDisplayNodeRemove;
		this._onDisplayNodeSetCallback = callbacks.onDisplayNodeSet;
		this._onDisplayNodeUpdateCallback = callbacks.onDisplayNodeUpdate;
	}

	dispose() {
		this._graph_node.dispose();
	}

	displayNode() {
		return this._display_node;
	}

	initializeNode() {
		if (this._initialized) {
			console.error('display node controller already initialed', this.node);
			return;
		}
		this._initialized = true;

		this.node.lifecycle.onChildAdd((child_node) => {
			if (!this._display_node) {
				child_node.flags?.display?.set(true);
			}
		});
		this.node.lifecycle.onChildRemove((child_node) => {
			if (child_node.graphNodeId() == this._display_node?.graphNodeId()) {
				const children = this.node.children();
				const last_child = children[children.length - 1];
				if (last_child) {
					last_child.flags?.display?.set(true);
				} else {
					this.setDisplayNode(undefined);
				}
			}
		});
		this._graph_node.dirtyController.addPostDirtyHook('_requestDisplayNodeContainer', () => {
			if (this._onDisplayNodeUpdateCallback) {
				this._onDisplayNodeUpdateCallback();
			}
		});
	}

	async setDisplayNode(new_display_node: BaseNodeClassWithDisplayFlag | undefined) {
		if (!this._initialized) {
			console.error('display node controller not initialized', this.node);
		}

		if (this._display_node != new_display_node) {
			const old_display_node = this._display_node;
			if (old_display_node) {
				old_display_node.flags.display.set(false);
				if (this.options.dependsOnDisplayNode) {
					this._graph_node.removeGraphInput(old_display_node);
				}
				if (this._onDisplayNodeRemoveCallback) {
					this._onDisplayNodeRemoveCallback();
				}
			}
			this._display_node = new_display_node;
			if (this._display_node) {
				if (this.options.dependsOnDisplayNode) {
					this._graph_node.addGraphInput(this._display_node);
				}
				if (this._onDisplayNodeSetCallback) {
					this._onDisplayNodeSetCallback();
				}
			}
		}
	}
}
