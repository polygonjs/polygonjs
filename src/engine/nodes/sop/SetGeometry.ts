/**
 * Places the geometry of the second input into the objects of the first input.
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {SetGeometrySopOperation, SET_GEOMETRY_MODES, SetGeometryMode} from '../../operations/sop/SetGeometry';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = SetGeometrySopOperation.DEFAULT_PARAMS;
class SetGeometrySopParamsConfig extends NodeParamsConfig {
	mode = ParamConfig.INTEGER(DEFAULT.mode, {
		menu: {
			entries: SET_GEOMETRY_MODES.map((name, value) => ({name, value})),
		},
	});
}
const ParamsConfig = new SetGeometrySopParamsConfig();

export class SetGeometrySopNode extends TypedSopNode<SetGeometrySopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.SET_GEOMETRY;
	}

	override initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState(SetGeometrySopOperation.INPUT_CLONED_STATE);
	}
	setMode(mode: SetGeometryMode) {
		this.p.mode.set(SET_GEOMETRY_MODES.indexOf(mode));
	}

	private _operation: SetGeometrySopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new SetGeometrySopOperation(this.scene(), this.states);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
