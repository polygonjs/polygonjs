import {PolyNodeDefinition} from '../../../utils/poly/PolyNodeDefinition';
import {PolyNodeParamsConfig} from '../../../utils/poly/PolyNodeParamsConfig';
import {PolyNodeController} from '../../../utils/poly/PolyNodeController';
import {BaseSubnetAnimNode} from '../../Subnet';
import {NodeContext} from '../../../../poly/NodeContext';
import {PolyEngine} from '../../../../Poly';
import {ModuleName} from '../../../../poly/registers/modules/Common';

function createPolyAnimNode(
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
		override requiredModules(): ModuleName[] {
			return [ModuleName.POLY_ANIM];
		}

		public override readonly polyNodeController: PolyNodeController = new polyNodeControllerClass(this, definition);
	}
	return BasePolyAnimNode as typeof BaseSubnetAnimNode;
}

export function onPolyAnimModuleRegister(poly: PolyEngine) {
	PolyNodeController.registerCreatePolyNodeFunctionForContext(NodeContext.ANIM, createPolyAnimNode);
}
