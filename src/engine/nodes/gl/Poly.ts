import {PolyNodeDefinition} from '../utils/poly/PolyNodeDefinition';
import {PolyNodeParamsConfig} from '../utils/poly/PolyNodeParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {PolyNodeController} from '../utils/poly/PolyNodeController';
import {TypedSubnetGlNode, TypedSubnetGlParamsConfigMixin} from './Subnet';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

export function createPolyGlNode(nodeType: string, definition: PolyNodeDefinition): typeof TypedSubnetGlNode {
	class SubnetGlParamsConfig extends TypedSubnetGlParamsConfigMixin(NodeParamsConfig) {}
	const ParamsConfig = PolyNodeParamsConfig.ParamsConfig(definition, SubnetGlParamsConfig) as SubnetGlParamsConfig;
	class BasePolyGlNode extends TypedSubnetGlNode<typeof ParamsConfig> {
		override paramsConfig = ParamsConfig;
		static override type() {
			return nodeType;
		}

		public override readonly polyNodeController: PolyNodeController = new PolyNodeController(this, definition);
	}
	return BasePolyGlNode as typeof TypedSubnetGlNode;
}

export const BasePolyGlNode = createPolyGlNode('poly', {nodeContext: NodeContext.GL, inputs: [0, 4]});
export class PolyGlNode extends TypedSubnetGlNode<any> {}
