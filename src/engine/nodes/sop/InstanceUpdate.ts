/**
 * Copies a geometry onto every point from the right input.
 *
 * @remarks
 * Creates an instance geometry, but instancing the geometry in the left input onto every point from the right input. This is a great way to display a lot of geometries on screen with little performance penalty.
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {
	InstanceUpdateMode,
	InstanceUpdateSopOperation,
	INSTANCE_UPDATE_MODES,
} from '../../operations/sop/InstanceUpdate';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = InstanceUpdateSopOperation.DEFAULT_PARAMS;

class InstanceUpdateSopParamsConfig extends NodeParamsConfig {
	/** @param defines what this node updates, either the instanced geometry or the instance points. */
	mode = ParamConfig.INTEGER(DEFAULT.mode, {
		menu: {
			entries: INSTANCE_UPDATE_MODES.map((name, value) => {
				return {value, name};
			}),
		},
	});
	/** @param which attributes will be updated on the instanced geometry */
	geoAttributes = ParamConfig.STRING(DEFAULT.geoAttributes, {
		visibleIf: {mode: INSTANCE_UPDATE_MODES.indexOf(InstanceUpdateMode.GEO)},
	});
	/** @param which attributes will be updated ont he instance points */
	pointAttributes = ParamConfig.STRING(DEFAULT.pointAttributes, {
		visibleIf: {mode: INSTANCE_UPDATE_MODES.indexOf(InstanceUpdateMode.POINTS)},
	});
}
const ParamsConfig = new InstanceUpdateSopParamsConfig();

export class InstanceUpdateSopNode extends TypedSopNode<InstanceUpdateSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'instanceUpdate';
	}

	static displayedInputNames(): string[] {
		return ['instance to update', 'geometry to copy attributes from'];
	}

	initializeNode() {
		super.initializeNode();

		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState(InstanceUpdateSopOperation.INPUT_CLONED_STATE);
	}

	setMode(mode: InstanceUpdateMode) {
		this.p.mode.set(INSTANCE_UPDATE_MODES.indexOf(mode));
	}

	private _operation: InstanceUpdateSopOperation | undefined;
	async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new InstanceUpdateSopOperation(this.scene(), this.states);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
