import {TypedSopNode, BaseSopNodeType} from './_Base';
import {GeoNodeChildrenMap} from '../../poly/registers/nodes/Sop';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {SopSubnetChildrenDisplayController} from './utils/subnet/ChildrenDisplayController';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {InputCloneMode} from '../../poly/InputCloneMode';
class SubnetSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SubnetSopParamsConfig();

export class SubnetSopNode extends TypedSopNode<SubnetSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'subnet';
	}
	// display_node and children_display controllers
	public readonly children_display_controller: SopSubnetChildrenDisplayController = new SopSubnetChildrenDisplayController(
		this
	);
	public readonly display_node_controller: DisplayNodeController = new DisplayNodeController(
		this,
		this.children_display_controller.display_node_controller_callbacks()
	);
	//
	protected _children_controller_context = NodeContext.SOP;

	initialize_node() {
		this.io.inputs.set_count(0, 4);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.NEVER);

		this.ui_data.set_width(100);

		this.children_display_controller.initialize_node();

		// the inputs will be evaluated by the child input nodes
		this.cook_controller.disallow_inputs_evaluation();
	}

	create_node<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K] {
		return super.create_node(type) as GeoNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseSopNodeType[];
	}
	nodes_by_type<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as GeoNodeChildrenMap[K][];
	}

	async cook(input_contents: CoreGroup[]) {
		const child_output_node = this.children_display_controller.output_node();
		if (child_output_node) {
			const container = await child_output_node.request_container();
			const core_content = container.core_content();
			if (core_content) {
				this.set_core_group(core_content);
			} else {
				if (child_output_node.states.error.active) {
					this.states.error.set(child_output_node.states.error.message);
				} else {
					this.set_objects([]);
				}
			}
		} else {
			this.states.error.set('no output node found inside subnet');
		}
	}
}
