import {PolyNodeDefinition} from '../../../utils/poly/PolyNodeDefinition';
import {PolyNodeParamsConfig} from '../../../utils/poly/PolyNodeParamsConfig';
import {PolyNodeController} from '../../../utils/poly/PolyNodeController';
import {TypedSubnetJsNode, TypedSubnetJsParamsConfigMixin} from '../../Subnet';
import {NodeParamsConfig} from '../../../utils/params/ParamsConfig';
import {JsConnectionPointType} from '../../../utils/io/connections/Js';
import {ModuleName} from '../../../../poly/registers/modules/Common';
import {NodeContext} from '../../../../poly/NodeContext';
import {PolyEngine} from '../../../../Poly';

function createPolyJsNode(
	nodeType: string,
	definition: PolyNodeDefinition,
	polyNodeControllerClass: typeof PolyNodeController
): typeof TypedSubnetJsNode {
	class SubnetJsParamsConfig extends TypedSubnetJsParamsConfigMixin(NodeParamsConfig) {}
	const ParamsConfig = PolyNodeParamsConfig.ParamsConfig(definition, SubnetJsParamsConfig) as SubnetJsParamsConfig;
	class BasePolyJsNode extends TypedSubnetJsNode<typeof ParamsConfig> {
		override paramsConfig = ParamsConfig;
		static override type() {
			return nodeType;
		}
		override requiredModules(): ModuleName[] {
			return [ModuleName.POLY_JS];
		}

		public override readonly polyNodeController: PolyNodeController = new polyNodeControllerClass(this, definition);

		protected override _expectedInputTypes(): JsConnectionPointType[] {
			return definition.inputs?.typed?.types.map((t) => t.type as JsConnectionPointType) || [];
		}
		protected override _expectedInputName(index: number) {
			const names = definition.inputs?.typed?.types.map((t) => t.name) || [];
			return names[index];
		}

		protected override _expectedOutputTypes() {
			return this._expectedInputTypes();
		}

		protected override _expectedOutputName(index: number) {
			return this._expectedInputName(index);
		}
	}
	return BasePolyJsNode as typeof TypedSubnetJsNode;
}

export function onPolyJsModuleRegister(poly: PolyEngine) {
	PolyNodeController.registerCreatePolyNodeFunctionForContext(NodeContext.JS, createPolyJsNode);
}
