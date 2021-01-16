/**
 * Promotes an attribute from object to geometry or vice-versa.
 *
 * @remarks
 * The attribute can also be promoted with different modes, such as only the min, max or first found.
 *
 */
import {TypedSopNode} from './_Base';
import {AttribClassMenuEntries} from '../../../core/geometry/Constant';
import {CoreGroup} from '../../../core/geometry/Group';
import {AttribPromoteSopOperation, AttribPromoteMode} from '../../../core/operations/sop/AttribPromote';

const PromoteModeMenuEntries = [
	{name: 'min', value: AttribPromoteMode.MIN},
	{name: 'max', value: AttribPromoteMode.MAX},
	{name: 'first_found', value: AttribPromoteMode.FIRST_FOUND},
];

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
			entries: PromoteModeMenuEntries,
		},
	});
	/** @param name of the attribute to promote */
	name = ParamConfig.STRING(DEFAULT.name);
}
const ParamsConfig = new AttribPromoteSopParamsConfig();

export class AttribPromoteSopNode extends TypedSopNode<AttribPromoteSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attribPromote';
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(AttribPromoteSopOperation.INPUT_CLONED_STATE);
		// this.uiData.set_icon('sort-amount-up');

		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.name, this.p.classFrom, this.p.classTo], () => {
					if (this.pv.name != '') {
						const from_s = AttribClassMenuEntries.filter((entry) => entry.value == this.pv.classFrom)[0]
							.name;
						const to_s = AttribClassMenuEntries.filter((entry) => entry.value == this.pv.classTo)[0].name;
						return `${this.pv.name} (${from_s} -> ${to_s})`;
					} else {
						return '';
					}
				});
			});
		});
	}

	private _operation: AttribPromoteSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AttribPromoteSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
