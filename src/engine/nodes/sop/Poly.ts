import {BaseNodeType} from '../_Base';
import {SubnetSopNodeLike} from './utils/subnet/ChildrenDisplayController';
import {PolyNodeController, PolyNodeDefinition} from '../utils/poly/PolyNodeController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';

export function createPolySopNode(node_type: string, definition: PolyNodeDefinition) {
	class PolySopParamsConfig extends NodeParamsConfig {
		template = ParamConfig.NODE_PATH('');
		debug = ParamConfig.BUTTON(null, {
			callback: (node: BaseNodeType) => {
				BasePolySopNode.PARAM_CALLBACK_debug(node as BasePolySopNode);
			},
		});
	}
	const ParamsConfig = new PolySopParamsConfig();
	class BasePolySopNode extends SubnetSopNodeLike<PolySopParamsConfig> {
		override paramsConfig = ParamsConfig;
		static override type() {
			return node_type;
		}

		public override readonly polyNodeController: PolyNodeController = new PolyNodeController(this, definition);

		static PARAM_CALLBACK_debug(node: BasePolySopNode) {
			node._debug();
		}

		private _debug() {
			this.polyNodeController.debug(this.p.template);
		}
	}
	return BasePolySopNode;
}

const BasePolySopNode = createPolySopNode('poly', {nodeContext: NodeContext.SOP, inputs: [0, 4]});
export class PolySopNode extends BasePolySopNode {}
