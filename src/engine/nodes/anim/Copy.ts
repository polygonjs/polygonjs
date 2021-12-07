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

	private _stampNode!: CopyStamp;

	initializeNode() {
		this.io.inputs.setCount(1);
	}

	async cook(input_contents: TimelineBuilder[]) {
		const builder = new TimelineBuilder();
		for (let i = 0; i < this.pv.count; i++) {
			this.stampNode().setGlobalIndex(i);
			const container = await this.containerController.requestInputContainer(0);
			if (container) {
				const stamped_builder = container.coreContentCloned();
				if (stamped_builder) {
					builder.addTimelineBuilder(stamped_builder);
				}
			}
		}
		this.setTimelineBuilder(builder);
	}

	//
	//
	// STAMP
	//
	//
	stampValue(attrib_name?: string) {
		return this.stampNode().value(attrib_name);
	}
	stampNode() {
		return (this._stampNode = this._stampNode || this._createStampNode());
	}
	private _createStampNode() {
		const stampNode = new CopyStamp(this.scene());
		this.dirtyController.setForbiddenTriggerNodes([stampNode]);
		return stampNode;
	}
}
