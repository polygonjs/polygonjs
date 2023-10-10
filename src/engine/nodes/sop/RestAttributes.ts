/**
 * Creates rest attributes.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';

import {RestAttributesSopOperation} from '../../operations/sop/RestAttributes';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = RestAttributesSopOperation.DEFAULT_PARAMS;
class RestAttributesSopParamsConfig extends NodeParamsConfig {
	/** @param toggle on to create a rest position */
	tposition = ParamConfig.BOOLEAN(DEFAULT.tposition);
	/** @param name of the position attribute */
	position = ParamConfig.STRING(DEFAULT.position, {visibleIf: {tposition: true}});
	/** @param name of the rest position attribute, on which the position will be copied on */
	restP = ParamConfig.STRING(DEFAULT.restP, {visibleIf: {tposition: true}});
	/** @param toggle on to create a rest normal */
	tnormal = ParamConfig.BOOLEAN(DEFAULT.tnormal);
	/** @param name of the normal attribute */
	normal = ParamConfig.STRING(DEFAULT.normal, {visibleIf: {tnormal: true}});
	/** @param name of the rest normal attribute, on which the normal will be copied on */
	restN = ParamConfig.STRING(DEFAULT.restN, {visibleIf: {tnormal: true}});
}
const ParamsConfig = new RestAttributesSopParamsConfig();

export class RestAttributesSopNode extends TypedSopNode<RestAttributesSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'restAttributes';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState([InputCloneMode.FROM_NODE]);
	}

	private _operation: RestAttributesSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new RestAttributesSopOperation(this.scene(), this.states, this);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
