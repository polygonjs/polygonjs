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
function _warnNotInitialized(node: BaseNodeType) {
	console.error('displayNodeController not initialized', node);
}
function _warnAlreadyInitialized(node: BaseNodeType) {
	console.error('displayNodeController already initialed', node);
}
export class DisplayNodeController {
	private _initialized: boolean = false;
	private _graphNode: CoreGraphNode;
	private _displayNode: BaseNodeClassWithDisplayFlag | undefined = undefined;
	private _displayNodeOverride: BaseNodeClassWithDisplayFlag | undefined = undefined;
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
		return this._displayNodeOverride || this._displayNode;
	}
	firstNonBypassedDisplayNode() {
		return this.displayNode()?.containerController.firstNonBypassedNode();
	}

	initializeNode() {
		if (this._initialized) {
			_warnAlreadyInitialized(this.node);
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

	setDisplayNodeOverride(newDisplayNodeOverride: BaseNodeClassWithDisplayFlag | undefined) {
		if (!this._initialized) {
			_warnNotInitialized(this.node);
		}

		const currentDisplayNode = this._displayNodeOverride;
		if (currentDisplayNode != newDisplayNodeOverride) {
			const oldDisplayNode = currentDisplayNode;
			if (oldDisplayNode) {
				// oldDisplayNode.flags.display.set(false);
				if (this.options.dependsOnDisplayNode) {
					this._graphNode.removeGraphInput(oldDisplayNode);
				}
				if (this._onDisplayNodeRemoveCallback) {
					this._onDisplayNodeRemoveCallback();
				}
			}
			this._displayNodeOverride = newDisplayNodeOverride;
			if (newDisplayNodeOverride) {
				if (this.options.dependsOnDisplayNode) {
					this._graphNode.addGraphInput(newDisplayNodeOverride);
				}
				if (this._onDisplayNodeSetCallback) {
					this._onDisplayNodeSetCallback();
				}
			} else {
				if (this._displayNode) {
					this._commitDisplayNode(this._displayNode);
				}
			}
		}
	}

	setDisplayNode(newDisplayNode: BaseNodeClassWithDisplayFlag | undefined) {
		if (!this._initialized) {
			_warnNotInitialized(this.node);
		}

		const currentDisplayNode = this._displayNode;
		if (currentDisplayNode != newDisplayNode) {
			const oldDisplayNode = currentDisplayNode;
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
			if (newDisplayNode) {
				this._commitDisplayNode(newDisplayNode);
			}
		}
	}
	private _commitDisplayNode(newDisplayNode: BaseNodeClassWithDisplayFlag) {
		if (this.options.dependsOnDisplayNode) {
			this._graphNode.addGraphInput(newDisplayNode);
		}
		if (this._onDisplayNodeSetCallback) {
			this._onDisplayNodeSetCallback();
		}
	}
}
