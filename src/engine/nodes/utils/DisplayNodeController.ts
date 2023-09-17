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
	private _graphNode: CoreGraphNode;
	private _displayNode: BaseNodeClassWithDisplayFlag | undefined = undefined;
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
		this._graphNode = new CoreGraphNode(node.scene(), 'DisplayNodeController');
		// (this._graphNode as any).node = node;
		this._onDisplayNodeRemoveCallback = callbacks.onDisplayNodeRemove;
		this._onDisplayNodeSetCallback = callbacks.onDisplayNodeSet;
		this._onDisplayNodeUpdateCallback = callbacks.onDisplayNodeUpdate;
	}

	dispose() {
		this._graphNode.dispose();
	}

	displayNode() {
		return this._displayNode;
	}
	firstNonBypassedDisplayNode() {
		return this.displayNode()?.containerController.firstNonBypassedNode();
	}

	initializeNode() {
		if (this._initialized) {
			console.error('display node controller already initialed', this.node);
			return;
		}
		this._initialized = true;

		this.node.lifecycle.onChildAdd((childNode) => {
			if (!this._displayNode) {
				childNode.flags?.display?.set(true);
			}
		});
		this.node.lifecycle.onChildRemove((childNode) => {
			if (childNode.graphNodeId() == this._displayNode?.graphNodeId()) {
				const children = this.node.children();
				// Go through each child in reverse until one has a display flag.
				// we can't just check the last child, as it may not have a display flag,
				// like a network node.
				for (let i = children.length - 1; i >= 0; i--) {
					const child = children[i];
					const displayFlag = child.flags?.display;
					if (displayFlag) {
						displayFlag.set(true);
						return;
					}
				}
				this.setDisplayNode(undefined);
			}
		});
		this._graphNode.dirtyController.addPostDirtyHook('_requestDisplayNodeContainer', () => {
			if (this._onDisplayNodeUpdateCallback) {
				this._onDisplayNodeUpdateCallback();
			}
		});
	}

	async setDisplayNode(newDisplayNode: BaseNodeClassWithDisplayFlag | undefined) {
		if (!this._initialized) {
			console.error('display node controller not initialized', this.node);
		}

		if (this._displayNode != newDisplayNode) {
			const oldDisplayNode = this._displayNode;
			if (oldDisplayNode) {
				oldDisplayNode.flags.display.set(false);
				if (this.options.dependsOnDisplayNode) {
					this._graphNode.removeGraphInput(oldDisplayNode);
				}
				if (this._onDisplayNodeRemoveCallback) {
					this._onDisplayNodeRemoveCallback();
				}
			}
			this._displayNode = newDisplayNode;
			if (this._displayNode) {
				if (this.options.dependsOnDisplayNode) {
					this._graphNode.addGraphInput(this._displayNode);
				}
				if (this._onDisplayNodeSetCallback) {
					this._onDisplayNodeSetCallback();
				}
			}
		}
	}
}
