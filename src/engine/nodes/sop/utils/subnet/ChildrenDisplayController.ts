import {DisplayNodeControllerCallbacks, DisplayNodeController} from '../../../utils/DisplayNodeController';
import {SubnetOutputSopNode} from '../../SubnetOutput';
import {CoreGraphNode} from '../../../../../core/graph/CoreGraphNode';
import {TypedSopNode, BaseSopNodeType} from '../../_Base';
import {NodeContext} from '../../../../poly/NodeContext';
import {GeoNodeChildrenMap} from '../../../../poly/registers/nodes/Sop';
import {GeoObjNode} from '../../../../nodes/obj/Geo';
import {NodeParamsConfig} from '../../../utils/params/ParamsConfig';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {Constructor, valueof} from '../../../../../types/GlobalTypes';
import {NodeCreateOptions} from '../../../utils/hierarchy/ChildrenController';
import {BaseNodeClassWithDisplayFlag} from '../../../_Base';

export class SubnetSopNodeLike<T extends NodeParamsConfig> extends TypedSopNode<T> {
	private _overrideOutputNode: boolean = false;
	override initializeBaseNode() {
		super.initializeBaseNode();
		this.childrenDisplayController.initializeNode();
		// the inputs will be evaluated by the child input nodes
		this.cookController.disallowInputsEvaluation();
	}

	// display_node and children_display controllers
	public readonly childrenDisplayController: SopSubnetChildrenDisplayController =
		new SopSubnetChildrenDisplayController(this);
	public override readonly displayNodeController: DisplayNodeController = new DisplayNodeController(
		this,
		this.childrenDisplayController.displayNodeControllerCallbacks()
	);
	//

	protected override _childrenControllerContext = NodeContext.SOP;
	override createNode<S extends keyof GeoNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): GeoNodeChildrenMap[S];
	override createNode<K extends valueof<GeoNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<GeoNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseSopNodeType[];
	}
	override nodesByType<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][] {
		return super.nodesByType(type) as GeoNodeChildrenMap[K][];
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const childOutputNode = this.outputNode();
		if (childOutputNode) {
			await this._cookFromChildOutputNode(childOutputNode);
		} else {
			if (!this._overrideOutputNode) {
				this.states.error.set('no output node found inside subnet');
			}
		}
	}

	private async _cookFromChildOutputNode(childOutputNode: SubnetOutputSopNode | BaseNodeClassWithDisplayFlag) {
		const container = await childOutputNode.compute();
		const coreContent = container.coreContent();
		if (coreContent) {
			this.setCoreGroup(coreContent);
		} else {
			if (childOutputNode.states.error.active()) {
				this.states.error.set(childOutputNode.states.error.message());
			} else {
				this.setObjects([]);
			}
		}
	}
	outputNode(): SubnetOutputSopNode | BaseNodeClassWithDisplayFlag | undefined {
		return this._overrideOutputNode
			? this.displayNodeController.displayNode()
			: this.childrenDisplayController.outputNode();
	}
	setOverrideOutputNode(overrideOutputNode: boolean) {
		if (this._overrideOutputNode == overrideOutputNode) {
			return;
		}
		this._overrideOutputNode = overrideOutputNode;
		const parent = this.parent();
		if (parent) {
			if (parent instanceof SubnetSopNodeLike<any>) {
				const parentSubnet = parent as SubnetSopNodeLike<any>;
				parentSubnet.setOverrideOutputNode(overrideOutputNode);
			}
			if (parent instanceof GeoObjNode || parent instanceof SubnetSopNodeLike<any>) {
				const parentGeoObjNode = parent as SubnetSopNodeLike<any> | GeoObjNode;
				if (overrideOutputNode) {
					parentGeoObjNode.displayNodeController.setDisplayNodeOverride(this);
				} else {
					parentGeoObjNode.displayNodeController.setDisplayNodeOverride(undefined);
				}
			}
		}

		this.outputNode()?.setDirty();
	}
}

interface SopSubnetChildrenDisplayControllerOptions {
	dependsOnDisplayNode: boolean;
}
const DEFAULT_OPTIONS: SopSubnetChildrenDisplayControllerOptions = {
	dependsOnDisplayNode: true,
};
export class SopSubnetChildrenDisplayController {
	private _outputNodeNeedsUpdate: boolean = true;
	private _outputNode: SubnetOutputSopNode | undefined;
	private _graphNode: CoreGraphNode | undefined;
	constructor(
		private node: SubnetSopNodeLike<any>,
		private options: SopSubnetChildrenDisplayControllerOptions = DEFAULT_OPTIONS
	) {}

	dispose() {
		this._graphNode?.dispose();
	}

	displayNodeControllerCallbacks(): DisplayNodeControllerCallbacks {
		return {
			onDisplayNodeRemove: () => {
				this.node.setDirty();
			},
			onDisplayNodeSet: () => {
				this.node.setDirty();
			},
			onDisplayNodeUpdate: () => {
				this.node.setDirty();
			},
		};
	}

	outputNode() {
		if (this._outputNodeNeedsUpdate) {
			this._updateOutputNode();
		}
		return this._outputNode;
	}

	initializeNode() {
		const displayFlag = this.node.flags?.display;
		if (displayFlag) {
			displayFlag.onUpdate(() => {
				if (displayFlag.active()) {
					this.node.setDirty();
				}
			});
		}

		this.node.lifecycle.onChildAdd(() => {
			this._outputNodeNeedsUpdate = true;
			this.node.setDirty();
		});
		this.node.lifecycle.onChildRemove(() => {
			this._outputNodeNeedsUpdate = true;
			this.node.setDirty();
		});
	}

	private _updateOutputNode() {
		const foundNode = this.node.nodesByType(SubnetOutputSopNode.type())[0];
		if (
			this._outputNode == null ||
			foundNode == null ||
			this._outputNode.graphNodeId() != foundNode.graphNodeId()
		) {
			if (this._graphNode && this._outputNode) {
				this._graphNode.removeGraphInput(this._outputNode);
			}

			this._outputNode = foundNode;

			if (this._outputNode && this.options.dependsOnDisplayNode) {
				this._graphNode = this._graphNode || this._createGraphNode();

				this._graphNode.addGraphInput(this._outputNode);
			}
		}
	}

	private _createGraphNode() {
		const graphNode = new CoreGraphNode(this.node.scene(), 'subnetChildrenDisplayController');
		graphNode.addPostDirtyHook('subnetChildrenDisplayController', () => {
			this.node.setDirty();
		});
		return graphNode;
	}
}
