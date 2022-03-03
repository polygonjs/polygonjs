/**
 * Rename an attribute
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AttribClassMenuEntries} from '../../../core/geometry/Constant';
import {AttribRenameSopOperation} from '../../operations/sop/AttribRename';
const DEFAULT = AttribRenameSopOperation.DEFAULT_PARAMS;
class AttribRenameSopParamsConfig extends NodeParamsConfig {
	/** @param class of the attribute to rename (object or geometry) */
	class = ParamConfig.INTEGER(DEFAULT.class, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	/** @param old attribute name */
	oldName = ParamConfig.STRING(DEFAULT.oldName);
	/** @param new attribute name */
	newName = ParamConfig.STRING(DEFAULT.newName);
}
const ParamsConfig = new AttribRenameSopParamsConfig();

export class AttribRenameSopNode extends TypedSopNode<AttribRenameSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'attribRename';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(AttribRenameSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: AttribRenameSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AttribRenameSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
