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
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {NodeEvent} from '../../poly/NodeEvent';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = MergeSopOperation.DEFAULT_PARAMS;
const DEFAULT_INPUTS_COUNT = 4;
class MergeSopParamsConfig extends NodeParamsConfig {
	/** @param When off, input objects remain separate. When on, they are merged together by type (mesh, points and lines). In order to merge them correctly, you'll have to make sure they have the same attributes */
	compact = ParamConfig.BOOLEAN(DEFAULT.compact);
	/** @param When off, objects with same type (mesh, points, lines) will be merged together, regardless of their material. When on, only objects with same type and same material will be merged */
	preserveMaterials = ParamConfig.BOOLEAN(DEFAULT.preserveMaterials, {
		visibleIf: {
			compact: true,
		},
	});
	/** @param number of inputs that this node can merge geometries from */
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
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.MERGE;
	}

	setCompactMode(compact: boolean) {
		this.p.compact.set(compact);
	}

	override initializeNode() {
		this.io.inputs.setCount(1, DEFAULT_INPUTS_COUNT);
		this.io.inputs.initInputsClonedState(MergeSopOperation.INPUT_CLONED_STATE);

		this.params.onParamsCreated('update inputs', () => {
			this._callbackUpdateInputsCount();
		});
	}

	private _operation: MergeSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new MergeSopOperation(this.scene(), this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}

	private _callbackUpdateInputsCount() {
		this.io.inputs.setCount(1, this.pv.inputsCount);
		this.emit(NodeEvent.INPUTS_UPDATED);
	}
	static PARAM_CALLBACK_setInputsCount(node: MergeSopNode) {
		node._callbackUpdateInputsCount();
	}
}
