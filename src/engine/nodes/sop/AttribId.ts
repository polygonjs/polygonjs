/**
 * Creates id and idn attributes.
 *
 * @remarks
 *
 * This is more optimized than [sop/attribCreate](/docs/nodes/sop/attribCreate) to create id and idn attributes, although the attribCreate node can create them similarly using the following expressions:
 *
 * `@ptnum` for the id attribute
 * `@ptnum / (pointsCount(0)-1)` for the idn attribute
 *
 */
import {ATTRIBUTE_CLASSES_WITHOUT_CORE_GROUP} from './../../../core/geometry/Constant';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {AttribClass, AttribClassMenuEntriesWithoutCoreGroup} from './../../../core/geometry/Constant';
import {AttribIdSopOperation} from '../../operations/sop/AttribId';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = AttribIdSopOperation.DEFAULT_PARAMS;

class AttribIdSopParamsConfig extends NodeParamsConfig {
	/** @param the attribute class (geometry or object) */
	class = ParamConfig.INTEGER(DEFAULT.class, {
		menu: {
			entries: AttribClassMenuEntriesWithoutCoreGroup,
		},
	});
	/** @param sets to true to create the id attribute */
	id = ParamConfig.BOOLEAN(DEFAULT.id);
	/** @param name of id attribute */
	idName = ParamConfig.STRING(DEFAULT.idName, {
		visibleIf: {id: 1},
	});
	/** @param sets to true to create the id attribute */
	idn = ParamConfig.BOOLEAN(DEFAULT.idn);
	/** @param name of the position attribute */
	/** @param name of idn attribute */
	idnName = ParamConfig.STRING(DEFAULT.idnName, {
		visibleIf: {idn: 1},
	});
}
const ParamsConfig = new AttribIdSopParamsConfig();

export class AttribIdSopNode extends TypedSopNode<AttribIdSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.ATTRIB_ID;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState([InputCloneMode.FROM_NODE]);
	}

	private _operation: AttribIdSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new AttribIdSopOperation(this.scene(), this.states);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
	//
	//
	// API UTILS
	//
	//
	setAttribClass(attribClass: AttribClass) {
		if (ATTRIBUTE_CLASSES_WITHOUT_CORE_GROUP.includes(attribClass)) {
			this.p.class.set(ATTRIBUTE_CLASSES_WITHOUT_CORE_GROUP.indexOf(attribClass));
		} else {
			console.warn(`${attribClass} is not possible on this node`);
		}
	}
	attribClass() {
		return ATTRIBUTE_CLASSES_WITHOUT_CORE_GROUP[this.pv.class];
	}
}
