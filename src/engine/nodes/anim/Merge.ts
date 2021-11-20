/**
 * Merge animation properties
 *
 * @remarks
 * Animation properties can be set to either run at the same time, or one after the other.
 */
import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';
import {TypeAssert} from '../../poly/Assert';
import {AnimationPosition, AnimationPositionMode, AnimationPositionRelativeTo} from '../../../core/animation/Position';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {BaseNodeType} from '../_Base';
import {NodeEvent} from '../../poly/NodeEvent';

enum MergeMode {
	ALL_TOGETHER = 'play all together',
	ONE_AT_A_TIME = 'play one at a time',
}
const MERGE_MODES: MergeMode[] = [MergeMode.ALL_TOGETHER, MergeMode.ONE_AT_A_TIME];
const DEFAULT_INPUTS_COUNT = 4;
class MergeAnimParamsConfig extends NodeParamsConfig {
	/** @param mode (at the same time or one after the other) */
	mode = ParamConfig.INTEGER(0, {
		menu: {
			entries: MERGE_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param offset if run one after the other */
	offset = ParamConfig.FLOAT(0, {
		range: [-1, 1],
	});
	/** @param override the position */
	overridePositions = ParamConfig.BOOLEAN(0);
	/** @param number of inputs that this node can merge animations from */
	inputsCount = ParamConfig.INTEGER(DEFAULT_INPUTS_COUNT, {
		range: [1, 32],
		rangeLocked: [true, false],
		callback: (node: BaseNodeType) => {
			MergeAnimNode.PARAM_CALLBACK_setInputsCount(node as MergeAnimNode);
		},
	});
}
const ParamsConfig = new MergeAnimParamsConfig();

export class MergeAnimNode extends TypedAnimNode<MergeAnimParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'merge';
	}

	initializeNode() {
		this.io.inputs.setCount(0, 4);

		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.mode], () => {
					const mode = MERGE_MODES[this.pv.mode];
					return mode;
				});
			});
			this.params.addOnSceneLoadHook('update inputs', () => {
				this._callbackUpdateInputsCount();
			});
		});
	}

	cook(inputContents: TimelineBuilder[]) {
		const mergedTimelineBuilder = new TimelineBuilder();

		let i = 0;
		for (let timelineBuilder of inputContents) {
			if (timelineBuilder) {
				if (i > 0) {
					this._updateTimelineBuilder(timelineBuilder);
				}

				mergedTimelineBuilder.addTimelineBuilder(timelineBuilder);
				i++;
			}
		}

		this.setTimelineBuilder(mergedTimelineBuilder);
	}

	private _updateTimelineBuilder(timelineBuilder: TimelineBuilder) {
		const mode = MERGE_MODES[this.pv.mode];
		switch (mode) {
			case MergeMode.ALL_TOGETHER:
				return this._setPlayAllTogether(timelineBuilder);
			case MergeMode.ONE_AT_A_TIME:
				return this._setPlayOneAtATime(timelineBuilder);
		}
		TypeAssert.unreachable(mode);
	}
	private _setPlayAllTogether(timelineBuilder: TimelineBuilder) {
		let position = timelineBuilder.position();
		if (!position || isBooleanTrue(this.pv.overridePositions)) {
			position = new AnimationPosition();
			position.setMode(AnimationPositionMode.RELATIVE);
			position.setRelativeTo(AnimationPositionRelativeTo.START);
			position.setOffset(this.pv.offset);
			timelineBuilder.setPosition(position);
		}
	}
	private _setPlayOneAtATime(timelineBuilder: TimelineBuilder) {
		let position = timelineBuilder.position();
		if (!position || isBooleanTrue(this.pv.overridePositions)) {
			position = new AnimationPosition();
			position.setMode(AnimationPositionMode.RELATIVE);
			position.setRelativeTo(AnimationPositionRelativeTo.END);
			position.setOffset(this.pv.offset);
			timelineBuilder.setPosition(position);
		}
	}
	private _callbackUpdateInputsCount() {
		this.io.inputs.setCount(1, this.pv.inputsCount);
		this.emit(NodeEvent.INPUTS_UPDATED);
	}
	static PARAM_CALLBACK_setInputsCount(node: MergeAnimNode) {
		node._callbackUpdateInputsCount();
	}
}
