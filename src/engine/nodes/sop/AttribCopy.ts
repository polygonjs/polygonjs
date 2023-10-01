/**
 * Copies an attribute from one geometry to another.
 *
 * @remarks
 * This copies an attribute from the right input geometry to the left input geometry.
 * Note that you can copy attributes that have different sizes. For instance:

 * - to copy only the y component of the position to a float attribute, set it as such:
 * 	- srcOffset = 1
 * 	- destOffset = 0
 * - to copy the y component to the z component of another attribute:
 * 	- srcOffset = 1
 * 	- destOffset = 2
 * - if you copy from a float to a float:
 * 	- srcOffset = 0
 * 	- destOffset = 0
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {AttribCopySopOperation} from '../../operations/sop/AttribCopy';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {ATTRIBUTE_CLASSES, AttribClass, AttribClassMenuEntries} from '../../../core/geometry/Constant';

const DEFAULT = AttribCopySopOperation.DEFAULT_PARAMS;
class AttribCopySopParamsConfig extends NodeParamsConfig {
	/** @param the attribute class (geometry or object) */
	class = ParamConfig.INTEGER(DEFAULT.class, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	/** @param name of the attribute to copy */
	name = ParamConfig.STRING(DEFAULT.name);
	/** @param toggle if you want to copy to another name */
	tnewName = ParamConfig.BOOLEAN(DEFAULT.tnewName);
	/** @param the new name of the attribute */
	newName = ParamConfig.STRING(DEFAULT.newName, {visibleIf: {tnewName: 1}});

	/** @param this defines which component the copy starts from. If you want to copy the whole attribute, leave it at 0. If you want to copy only the y component, set it to 1. If you want to copy the z component, set it to 2. Note that this only makes sense if you copy from an attribute that has enough components to copy from. So setting it to 2 (for z) to copy from a vector2 attribute will raise an error. */
	srcOffset = ParamConfig.INTEGER(DEFAULT.srcOffset, {
		range: [0, 3],
		rangeLocked: [true, true],
		visibleIf: {class: ATTRIBUTE_CLASSES.indexOf(AttribClass.POINT)},
	});
	/** @param this defines which component the attribute is copied to */
	destOffset = ParamConfig.INTEGER(DEFAULT.destOffset, {
		range: [0, 3],
		rangeLocked: [true, true],
		visibleIf: {class: ATTRIBUTE_CLASSES.indexOf(AttribClass.POINT)},
	});
}
const ParamsConfig = new AttribCopySopParamsConfig();

// TODO: attrib copy should handle string attributes
export class AttribCopySopNode extends TypedSopNode<AttribCopySopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.ATTRIB_COPY;
	}

	override initializeNode() {
		this.io.inputs.setCount(1, 2);
		this.io.inputs.initInputsClonedState(AttribCopySopOperation.INPUT_CLONED_STATE);
	}

	private _operation: AttribCopySopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AttribCopySopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
	setAttribClass(attribClass: AttribClass) {
		this.p.class.set(ATTRIBUTE_CLASSES.indexOf(attribClass));
	}
	attribClass() {
		return ATTRIBUTE_CLASSES[this.pv.class];
	}
}
