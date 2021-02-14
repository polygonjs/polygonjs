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
export class DisplayNodeController {
	private _initialized: boolean = false;
	private _graph_node: CoreGraphNode;
	private _display_node: BaseNodeClassWithDisplayFlag | undefined = undefined;
	private _on_display_node_remove_callback: DisplayControllerCallback | undefined;
	private _on_display_node_set_callback: DisplayControllerCallback | undefined;
	private _on_display_node_update_callback: DisplayControllerCallback | undefined;

	// TODO: the node could be a different than BaseNodeType
	// at least there should be a way to infer that it is a node
	// with children that have a display flag. This would avoid all the flags?.display?... below
	constructor(protected node: BaseNodeType, callbacks: DisplayNodeControllerCallbacks) {
		this._graph_node = new CoreGraphNode(node.scene(), 'DisplayNodeController');
		(this._graph_node as any).node = node;
		this._on_display_node_remove_callback = callbacks.onDisplayNodeRemove;
		this._on_display_node_set_callback = callbacks.onDisplayNodeSet;
		this._on_display_node_update_callback = callbacks.onDisplayNodeUpdate;
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

		this.node.lifecycle.add_on_child_add_hook((child_node) => {
			if (!this._display_node) {
				child_node.flags?.display?.set(true);
			}
		});
		this.node.lifecycle.add_on_child_remove_hook((child_node) => {
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
		this._graph_node.dirtyController.addPostDirtyHook('_request_display_node_container', () => {
			if (this._on_display_node_update_callback) {
				this._on_display_node_update_callback();
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
				this._graph_node.removeGraphInput(old_display_node);
				if (this._on_display_node_remove_callback) {
					this._on_display_node_remove_callback();
				}
			}
			this._display_node = new_display_node;
			if (this._display_node) {
				this._graph_node.addGraphInput(this._display_node);
				if (this._on_display_node_set_callback) {
					this._on_display_node_set_callback();
				}
			}
		}
	}
}
