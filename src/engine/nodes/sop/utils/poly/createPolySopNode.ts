import {SubnetSopNodeLike} from '../subnet/SopSubnetChildrenDisplayController';
import {PolyNodeDefinition} from '../../../utils/poly/PolyNodeDefinition';
import {PolyNodeParamsConfig} from '../../../utils/poly/PolyNodeParamsConfig';
import {PolyNodeController} from '../../../utils/poly/PolyNodeController';
import {ModuleName} from '../../../../poly/registers/modules/Common';
import {NodeContext} from '../../../../poly/NodeContext';
import {PolyEngine} from '../../../../Poly';

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
		override requiredModules(): ModuleName[] {
			return [ModuleName.POLY_SOP];
		}
		static override displayedInputNames(): string[] | undefined {
			return definition.inputs?.simple?.names || ['input geometries'];
		}

		public override readonly polyNodeController: PolyNodeController = new polyNodeControllerClass(this, definition);
	}
	return BasePolySopNode as typeof SubnetSopNodeLike;
}

export function onPolySopModuleRegister(poly: PolyEngine) {
	PolyNodeController.registerCreatePolyNodeFunctionForContext(NodeContext.SOP, createPolySopNode);
}
