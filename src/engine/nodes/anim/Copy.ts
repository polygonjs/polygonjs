import {TypedAnimNode} from './_Base';
import {CopyStamp} from './utils/CopyStamp';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';
class CopyAnimParamsConfig extends NodeParamsConfig {
	count = ParamConfig.INTEGER(1, {
		range: [1, 20],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new CopyAnimParamsConfig();

export class CopyAnimNode extends TypedAnimNode<CopyAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'copy';
	}

	private _stamp_node!: CopyStamp;

	initialize_node() {
		this.io.inputs.set_count(1);
	}

	async cook(input_contents: TimelineBuilder[]) {
		const builder = new TimelineBuilder();
		for (let i = 0; i < this.pv.count; i++) {
			this.stamp_node.set_global_index(i);
			const container = await this.container_controller.requestInputContainer(0);
			if (container) {
				const stamped_builder = container.coreContentCloned();
				if (stamped_builder) {
					builder.add_timeline_builder(stamped_builder);
				}
			}
		}
		this.set_timeline_builder(builder);
	}

	//
	//
	// STAMP
	//
	//
	stamp_value(attrib_name?: string) {
		return this.stamp_node.value(attrib_name);
	}
	get stamp_node() {
		return (this._stamp_node = this._stamp_node || this.create_stamp_node());
	}
	private create_stamp_node() {
		const stamp_node = new CopyStamp(this.scene);
		this.dirty_controller.set_forbidden_trigger_nodes([stamp_node]);
		return stamp_node;
	}
}
