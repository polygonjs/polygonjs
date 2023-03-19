import {Constructor} from '../../../../types/GlobalTypes';
import {TypedEventNode} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {NodeContext} from '../../../poly/NodeContext';
import {BaseSopNodeType} from '../../sop/_Base';
import {CoreGraphNode} from '../../../../core/graph/CoreGraphNode';
import {CorePlayer} from '../../../../core/player/Player';
import {BaseNodeType} from '../../_Base';
import {MeshWithBVH} from '../../../../core/geometry/bvh/three-mesh-bvh';

export function ColliderParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		colliderObject = ParamConfig.NODE_PATH('', {
			nodeSelection: {
				context: NodeContext.SOP,
			},
			// if the node is dependent,
			// the FirstPersonControls will be re-created when this node changes
			// which we do not want, as it will act like a hard reset
			// when all we want is to update the collider
			dependentOnFoundNode: false,
			callback: (node: BaseNodeType) => {
				ColliderEventNode.PARAM_CALLBACK_updateCollider(node as ColliderEventNode);
			},
		});
	};
}

class ColliderParamsConfig extends ColliderParamConfig(NodeParamsConfig) {}
abstract class ColliderEventNode extends TypedEventNode<ColliderParamsConfig> {
	abstract player(): CorePlayer | undefined;
	abstract collisionController(): CollisionController;
	static PARAM_CALLBACK_updateCollider(node: ColliderEventNode) {}
}

export class CollisionController {
	constructor(protected node: ColliderEventNode) {}
	private _colliderNode: BaseSopNodeType | undefined;
	private __colliderNodeGraphNode: CoreGraphNode | undefined;
	private _colliderNodeGraphNode() {
		return (this.__colliderNodeGraphNode =
			this.__colliderNodeGraphNode || new CoreGraphNode(this.node.scene(), 'colliderGraphNode'));
	}
	async getCollider() {
		const colliderNode = this.node.pv.colliderObject.nodeWithContext(NodeContext.SOP);
		if (!colliderNode) {
			this.node.states.error.set('collider node not found');
			return;
		}
		if (this._colliderNode?.graphNodeId() != colliderNode.graphNodeId()) {
			if (this._colliderNode) {
				this._colliderNodeGraphNode().removeGraphInput(this._colliderNode);
			}
			this._colliderNodeGraphNode().addGraphInput(colliderNode);
			this._colliderNodeGraphNode().addPostDirtyHook('onColliderDirty', () => {
				this.updateCollider();
			});
			this._colliderNode = colliderNode;
		}
		const container = await colliderNode.compute();
		const coreGroup = container.coreContent();
		if (!coreGroup) {
			this.node.states.error.set('invalid collider node');
			return;
		}

		const collider = coreGroup.threejsObjects()[0] as MeshWithBVH;
		return collider;
	}

	async updateCollider() {
		const collider = await this.getCollider();
		if (!collider) {
			this.node.states.error.set('invalid collider');
			return;
		}

		this.node.player()?.setCollider(collider);
	}
}
