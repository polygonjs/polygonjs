import {TypedAnimNode} from './_Base';
import {TimelineBuilder, AnimationRepeatParams} from '../../../core/animation/TimelineBuilder';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class RepeatAnimParamsConfig extends NodeParamsConfig {
	unlimited = ParamConfig.BOOLEAN(0);
	count = ParamConfig.INTEGER(1, {
		range: [0, 10],
		visible_if: {unlimited: 0},
	});
	delay = ParamConfig.FLOAT(0);
	yoyo = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new RepeatAnimParamsConfig();

export class RepeatAnimNode extends TypedAnimNode<RepeatAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'repeat';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);

		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.unlimited, this.p.count, this.p.yoyo], () => {
					const count = `${this.p.unlimited ? 'unlimited' : this.pv.count}`;
					return `${count} (yoyo: ${this.pv.yoyo})`;
				});
			});
		});
	}

	private _repeat_params(): AnimationRepeatParams {
		return {
			count: this.pv.unlimited ? -1 : this.pv.count,
			delay: this.pv.delay,
			yoyo: this.pv.yoyo,
		};
	}

	cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		timeline_builder.set_repeat_params(this._repeat_params());

		this.set_timeline_builder(timeline_builder);
	}
}
