import {PolyNodeDefinition} from '../../../utils/poly/PolyNodeDefinition';
import {PolyNodeParamsConfig} from '../../../utils/poly/PolyNodeParamsConfig';
import type {PolyNodeController} from '../../../utils/poly/PolyNodeController';
import {BaseSubnetAnimNode} from '../../Subnet';

export function createPolyAnimNode(
	nodeType: string,
	definition: PolyNodeDefinition,
	polyNodeControllerClass: typeof PolyNodeController
): typeof BaseSubnetAnimNode {
	const ParamsConfig = PolyNodeParamsConfig.ParamsConfig(definition);
	class BasePolyAnimNode extends BaseSubnetAnimNode<typeof ParamsConfig> {
		override paramsConfig = ParamsConfig;
		static override type() {
			return nodeType;
		}

		public override readonly polyNodeController: PolyNodeController = new polyNodeControllerClass(this, definition);
	}
	return BasePolyAnimNode as typeof BaseSubnetAnimNode;
}
