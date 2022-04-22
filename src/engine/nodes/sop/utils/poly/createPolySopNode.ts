import {SubnetSopNodeLike} from '../subnet/ChildrenDisplayController';
import {PolyNodeDefinition} from '../../../utils/poly/PolyNodeDefinition';
import {PolyNodeParamsConfig} from '../../../utils/poly/PolyNodeParamsConfig';
import type {PolyNodeController} from '../../../utils/poly/PolyNodeController';

export function createPolySopNode(
	nodeType: string,
	definition: PolyNodeDefinition,
	polyNodeControllerClass: typeof PolyNodeController
): typeof SubnetSopNodeLike {
	const ParamsConfig = PolyNodeParamsConfig.ParamsConfig(definition);
	class BasePolySopNode extends SubnetSopNodeLike<typeof ParamsConfig> {
		override paramsConfig = ParamsConfig;
		static override type() {
			return nodeType;
		}

		public override readonly polyNodeController: PolyNodeController = new polyNodeControllerClass(this, definition);
	}
	return BasePolySopNode as typeof SubnetSopNodeLike;
}
