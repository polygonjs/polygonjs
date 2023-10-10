/**
 * Rename an attribute
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ATTRIBUTE_CLASSES, AttribClass, AttribClassMenuEntries} from '../../../core/geometry/Constant';
import {AttribRenameSopOperation} from '../../operations/sop/AttribRename';
const DEFAULT = AttribRenameSopOperation.DEFAULT_PARAMS;
class AttribRenameSopParamsConfig extends NodeParamsConfig {
	/** @param the group this applies to */
	group = ParamConfig.STRING(DEFAULT.group);
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
	setAttribClass(attribClass: AttribClass) {
		this.p.class.set(ATTRIBUTE_CLASSES.indexOf(attribClass));
	}
	attribClass() {
		return ATTRIBUTE_CLASSES[this.pv.class];
	}

	private _operation: AttribRenameSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new AttribRenameSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
