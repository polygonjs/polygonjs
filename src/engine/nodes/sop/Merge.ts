/**
 * Merge input geometries
 *
 * @remarks
 * This node can take up to 4 inputs. It can operate within 1 of 2 modes:
 *
 * - compact ON: all objects will be merged in as few objects as possible. So all meshes will be merged into one, all point objects into one, and all line objects into one. This requires the objects to have the same attributes.
 * - compact OFF: all objects are simply put under a common parent, but remain distinct objects.

 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {MergeSopOperation} from '../../operations/sop/Merge';

const INPUT_NAME = 'geometry to merge';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {NodeEvent} from '../../poly/NodeEvent';
const DEFAULT = MergeSopOperation.DEFAULT_PARAMS;
const DEFAULT_INPUTS_COUNT = 4;
class MergeSopParamsConfig extends NodeParamsConfig {
	/** @param When off, input objects remain separate. When on, they are merged together by type (mesh, points and lines). In order to merge them correctly, you'll have to make sure they have the same attributes */
	compact = ParamConfig.BOOLEAN(DEFAULT.compact);
	inputsCount = ParamConfig.INTEGER(DEFAULT_INPUTS_COUNT, {
		range: [1, 32],
		rangeLocked: [true, false],
		callback: (node: BaseNodeType) => {
			MergeSopNode.PARAM_CALLBACK_setInputsCount(node as MergeSopNode);
		},
	});
}
const ParamsConfig = new MergeSopParamsConfig();

export class MergeSopNode extends TypedSopNode<MergeSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'merge';
	}

	static displayedInputNames(): string[] {
		return [INPUT_NAME, INPUT_NAME, INPUT_NAME, INPUT_NAME];
	}

	initializeNode() {
		this.io.inputs.setCount(1, DEFAULT_INPUTS_COUNT);
		this.io.inputs.initInputsClonedState(MergeSopOperation.INPUT_CLONED_STATE);

		// this.uiData.set_icon('compress-arrows-alt');
		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.compact], () => {
					return this.pv.compact ? 'compact' : 'separate objects';
				});
			});
			this.params.addOnSceneLoadHook('update inputs', () => {
				this._callbackUpdateInputsCount();
			});
		});
	}

	private _operation: MergeSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new MergeSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}

	private _callbackUpdateInputsCount() {
		this.io.inputs.setCount(1, this.pv.inputsCount);
		this.emit(NodeEvent.INPUTS_UPDATED);
	}
	static PARAM_CALLBACK_setInputsCount(node: MergeSopNode) {
		node._callbackUpdateInputsCount();
	}
}
