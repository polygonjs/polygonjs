import {PolyNodeDefinition} from '../utils/poly/PolyNodeDefinition';
import {PolyNodeParamsConfig} from '../utils/poly/PolyNodeParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {PolyNodeController} from '../utils/poly/PolyNodeController';
import {AbstractTypedSubnetGlNode, TypedSubnetGlParamsConfigMixin} from './Subnet';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType} from '../utils/io/connections/Gl';

export function createPolyGlNode(nodeType: string, definition: PolyNodeDefinition): typeof AbstractTypedSubnetGlNode {
	class SubnetGlParamsConfig extends TypedSubnetGlParamsConfigMixin(NodeParamsConfig) {}
	const ParamsConfig = PolyNodeParamsConfig.ParamsConfig(definition, SubnetGlParamsConfig) as SubnetGlParamsConfig;
	class BasePolyGlNode extends AbstractTypedSubnetGlNode<typeof ParamsConfig> {
		override paramsConfig = ParamsConfig;
		static override type() {
			return nodeType;
		}

		public override readonly polyNodeController: PolyNodeController = new PolyNodeController(this, definition);

		protected override _expectedInputTypes(): GlConnectionPointType[] {
			return definition.inputs?.typed?.types.map((t) => t.type as GlConnectionPointType) || [];
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
	return BasePolyGlNode as typeof AbstractTypedSubnetGlNode;
}

export const BasePolyGlNode = createPolyGlNode('poly', {
	nodeContext: NodeContext.GL,
	inputs: {typed: {types: [{name: 'input0', type: GlConnectionPointType.FLOAT}]}},
});
export class PolyGlNode extends AbstractTypedSubnetGlNode<any> {}
