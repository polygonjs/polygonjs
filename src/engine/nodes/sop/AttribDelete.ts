/**
 * Deletes an attribute from the input
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {AttribClassMenuEntries, AttribClass, ATTRIBUTE_CLASSES} from '../../../core/geometry/Constant';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {AttribDeleteSopOperation} from '../../operations/sop/AttribDelete';
const DEFAULT = AttribDeleteSopOperation.DEFAULT_PARAMS;
class AttribDeleteSopParamsConfig extends NodeParamsConfig {
	/** @param the group this applies to */
	group = ParamConfig.STRING(DEFAULT.group);
	/** @param attribute class (geometry or object) */
	class = ParamConfig.INTEGER(DEFAULT.class, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	/** @param attribute name to delete */
	name = ParamConfig.STRING(DEFAULT.name);
}
const ParamsConfig = new AttribDeleteSopParamsConfig();

export class AttribDeleteSopNode extends TypedSopNode<AttribDeleteSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.ATTRIB_DELETE;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	setAttribClass(attribClass: AttribClass) {
		this.p.class.set(ATTRIBUTE_CLASSES.indexOf(attribClass));
	}
	attribClass() {
		return ATTRIBUTE_CLASSES[this.pv.class];
	}

	private _operation: AttribDeleteSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new AttribDeleteSopOperation(this._scene, this.states);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
