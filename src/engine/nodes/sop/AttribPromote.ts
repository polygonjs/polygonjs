/**
 * Promotes an attribute from object to geometry or vice-versa.
 *
 * @remarks
 * The attribute can also be promoted with different modes, such as only the min, max or first found.
 *
 */
import {TypedSopNode} from './_Base';
import {AttribClass, AttribClassMenuEntries, ATTRIBUTE_CLASSES} from '../../../core/geometry/Constant';
import {CoreGroup} from '../../../core/geometry/Group';
import {AttribPromoteSopOperation, AttribPromoteMode, ATTRIB_PROMOTE_MODES} from '../../operations/sop/AttribPromote';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = AttribPromoteSopOperation.DEFAULT_PARAMS;
class AttribPromoteSopParamsConfig extends NodeParamsConfig {
	/** @param class the attribute is from (object or geometry) */
	classFrom = ParamConfig.INTEGER(DEFAULT.classFrom, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	/** @param class the attribute should be promoted to (object or geometry) */
	classTo = ParamConfig.INTEGER(DEFAULT.classTo, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	/** @param mode used to promote the attribute (min, max or first_found) */
	mode = ParamConfig.INTEGER(DEFAULT.mode, {
		menu: {
			entries: ATTRIB_PROMOTE_MODES.map((name, value) => ({name, value})),
		},
	});
	/** @param name of the attribute to promote */
	name = ParamConfig.STRING(DEFAULT.name);
}
const ParamsConfig = new AttribPromoteSopParamsConfig();

export class AttribPromoteSopNode extends TypedSopNode<AttribPromoteSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'attribPromote';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(AttribPromoteSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: AttribPromoteSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new AttribPromoteSopOperation(this.scene(), this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
	setAttribClassFrom(attribClass: AttribClass) {
		this.p.classFrom.set(ATTRIBUTE_CLASSES.indexOf(attribClass));
	}
	setAttribClassTo(attribClass: AttribClass) {
		this.p.classTo.set(ATTRIBUTE_CLASSES.indexOf(attribClass));
	}
	setPromoteMode(mode: AttribPromoteMode) {
		this.p.mode.set(ATTRIB_PROMOTE_MODES.indexOf(mode));
	}
}
