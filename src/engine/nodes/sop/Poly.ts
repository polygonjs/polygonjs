import {SubnetSopNodeLike} from './utils/subnet/ChildrenDisplayController';
import {PolyNodeController, PolyNodeDefinition} from '../utils/poly/PolyNodeController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';

export function createPolySopNode(nodeType: string, definition: PolyNodeDefinition): typeof SubnetSopNodeLike {
	class PolySopParamsConfig extends NodeParamsConfig {}
	const ParamsConfig = new PolySopParamsConfig();
	class BasePolySopNode extends SubnetSopNodeLike<PolySopParamsConfig> {
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
