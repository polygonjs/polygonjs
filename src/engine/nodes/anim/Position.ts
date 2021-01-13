/**
 * Sets how the position of an animation
 *
 *
 */
import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';
import {
	AnimationPosition,
	AnimationPositionMode,
	ANIMATION_POSITION_MODES,
	ANIMATION_POSITION_RELATIVE_TOS,
} from '../../../core/animation/Position';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class PositionAnimParamsConfig extends NodeParamsConfig {
	/** @param sets the mode of the position. It can either be relative or absolute */
	mode = ParamConfig.INTEGER(0, {
		menu: {
			entries: ANIMATION_POSITION_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param if sets to relative, sets if it is relative to the start or end */
	relativeTo = ParamConfig.INTEGER(0, {
		menu: {
			entries: ANIMATION_POSITION_RELATIVE_TOS.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param offset */
	offset = ParamConfig.FLOAT(0);
}
const ParamsConfig = new PositionAnimParamsConfig();

export class PositionAnimNode extends TypedAnimNode<PositionAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'position';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);

		this.scene().dispatchController.onAddListener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.mode, this.p.relativeTo, this.p.offset], () => {
					const mode = ANIMATION_POSITION_MODES[this.pv.mode];
					switch (mode) {
						case AnimationPositionMode.RELATIVE:
							return this._relative_label();
						case AnimationPositionMode.ABSOLUTE:
							return this._absolute_label();
					}
				});
			});
		});
	}
	private _relative_label() {
		const after_before = this.pv.offset > 0 ? 'after' : 'before';
		const relative_to = ANIMATION_POSITION_RELATIVE_TOS[this.pv.relativeTo];
		return `${Math.abs(this.pv.offset)} ${after_before} ${relative_to}`;
	}
	private _absolute_label() {
		return 'absolute';
	}

	cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		const position = new AnimationPosition();
		position.set_mode(ANIMATION_POSITION_MODES[this.pv.mode]);
		position.set_relative_to(ANIMATION_POSITION_RELATIVE_TOS[this.pv.relativeTo]);
		position.set_offset(this.pv.offset);
		timeline_builder.setPosition(position);

		this.set_timeline_builder(timeline_builder);
	}
}
