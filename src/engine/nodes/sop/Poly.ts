import {BaseNodeType} from '../_Base';
import {SubnetSopNodeLike} from './utils/subnet/ChildrenDisplayController';
import {PolyNodeController, PolyNodeDefinition} from '../utils/poly/PolyNodeController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';

export function create_poly_sop_node(node_type: string, definition: PolyNodeDefinition) {
	class PolySopParamsConfig extends NodeParamsConfig {
		template = ParamConfig.OPERATOR_PATH('../template');
		debug = ParamConfig.BUTTON(null, {
			callback: (node: BaseNodeType) => {
				BasePolySopNode.PARAM_CALLBACK_debug(node as BasePolySopNode);
			},
		});
	}
	const ParamsConfig = new PolySopParamsConfig();
	class BasePolySopNode extends SubnetSopNodeLike<PolySopParamsConfig> {
		params_config = ParamsConfig;
		static type() {
			return node_type;
		}

		public readonly poly_node_controller: PolyNodeController = new PolyNodeController(this, definition);

		static PARAM_CALLBACK_debug(node: BasePolySopNode) {
			node._debug();
		}

		private _debug() {
			this.poly_node_controller.debug(this.p.template);
		}
	}
	return BasePolySopNode;
}

const BasePolySopNode = create_poly_sop_node('poly', {node_context: NodeContext.SOP, inputs: [0, 4]});
export class PolySopNode extends BasePolySopNode {}
