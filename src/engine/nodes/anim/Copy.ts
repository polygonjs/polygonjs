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
	paramsConfig = ParamsConfig;
	static type() {
		return 'copy';
	}

	private _stamp_node!: CopyStamp;

	initializeNode() {
		this.io.inputs.setCount(1);
	}

	async cook(input_contents: TimelineBuilder[]) {
		const builder = new TimelineBuilder();
		for (let i = 0; i < this.pv.count; i++) {
			this.stampNode().set_global_index(i);
			const container = await this.containerController.requestInputContainer(0);
			if (container) {
				const stamped_builder = container.coreContentCloned();
				if (stamped_builder) {
					builder.addTimelineBuilder(stamped_builder);
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
		return this.stampNode().value(attrib_name);
	}
	stampNode() {
		return (this._stamp_node = this._stamp_node || this.create_stamp_node());
	}
	private create_stamp_node() {
		const stamp_node = new CopyStamp(this.scene());
		this.dirtyController.set_forbidden_trigger_nodes([stamp_node]);
		return stamp_node;
	}
}
