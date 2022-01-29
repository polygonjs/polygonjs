/**
 * Creates metaballs.
 *
 * @remarks
 * This nodes creates metaballs from points. Note that the points must currently be within the coordinates 0,0,0 and 1,1,1. The points can also have a metaStrength float attribute to define the size of the metaball
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {MetaballSopOperation} from '../../operations/sop/Metaball';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = MetaballSopOperation.DEFAULT_PARAMS;
class MetaballSopParamsConfig extends NodeParamsConfig {
	/** @param resolution */
	resolution = ParamConfig.FLOAT(DEFAULT.resolution, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param isolation */
	isolation = ParamConfig.FLOAT(DEFAULT.isolation, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param useMetaStrengthAttrib */
	useMetaStrengthAttrib = ParamConfig.BOOLEAN(DEFAULT.useMetaStrengthAttrib);
	/** @param metaStrength */
	metaStrength = ParamConfig.FLOAT(DEFAULT.metaStrength, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param useMetaSubtractAttrib */
	useMetaSubtractAttrib = ParamConfig.BOOLEAN(DEFAULT.useMetaSubtractAttrib);
	/** @param metaStrength */
	metaSubtract = ParamConfig.FLOAT(DEFAULT.metaSubtract, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param enableUVs */
	enableUVs = ParamConfig.BOOLEAN(DEFAULT.enableUVs);
	/** @param enableColors */
	enableColors = ParamConfig.BOOLEAN(DEFAULT.enableColors);
}
const ParamsConfig = new MetaballSopParamsConfig();

export class MetaballSopNode extends TypedSopNode<MetaballSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'metaball';
	}

	static override displayedInputNames(): string[] {
		return ['points to create metaballs from'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(MetaballSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: MetaballSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new MetaballSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
