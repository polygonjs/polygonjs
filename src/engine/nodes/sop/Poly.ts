import {SubnetSopNodeLike} from './utils/subnet/ChildrenDisplayController';
import {PolyNodeDefinition} from '../utils/poly/PolyNodeDefinition';
import {PolyNodeParamsConfig} from '../utils/poly/PolyNodeParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {PolyNodeController} from '../utils/poly/PolyNodeController';

export function createPolySopNode(nodeType: string, definition: PolyNodeDefinition): typeof SubnetSopNodeLike {
	const ParamsConfig = PolyNodeParamsConfig.ParamsConfig(definition);
	class BasePolySopNode extends SubnetSopNodeLike<typeof ParamsConfig> {
		override paramsConfig = ParamsConfig;
		static override type() {
			return nodeType;
		}

		public override readonly polyNodeController: PolyNodeController = new PolyNodeController(this, definition);
	}
	return BasePolySopNode as typeof SubnetSopNodeLike;
}

export const BasePolySopNode = createPolySopNode('poly', {nodeContext: NodeContext.SOP, inputs: [0, 4]});
export class PolySopNode extends BasePolySopNode<any> {}
