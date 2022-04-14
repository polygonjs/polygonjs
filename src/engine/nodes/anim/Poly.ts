import {PolyNodeDefinition} from '../utils/poly/PolyNodeDefinition';
import {PolyNodeParamsConfig} from '../utils/poly/PolyNodeParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {PolyNodeController} from '../utils/poly/PolyNodeController';
import {BaseSubnetAnimNode} from './Subnet';

export function createPolyAnimNode(nodeType: string, definition: PolyNodeDefinition): typeof BaseSubnetAnimNode {
	const ParamsConfig = PolyNodeParamsConfig.ParamsConfig(definition);
	class BasePolyAnimNode extends BaseSubnetAnimNode<typeof ParamsConfig> {
		override paramsConfig = ParamsConfig;
		static override type() {
			return nodeType;
		}

		public override readonly polyNodeController: PolyNodeController = new PolyNodeController(this, definition);
	}
	return BasePolyAnimNode as typeof BaseSubnetAnimNode;
}

export const BasePolyAnimNode = createPolyAnimNode('poly', {
	nodeContext: NodeContext.ANIM,
	inputs: {simple: {min: 0, max: 4}},
});
export class PolyAnimNode extends BaseSubnetAnimNode<any> {}
