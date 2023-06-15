/**
 * Converts an input geometry to tetrahedrons
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CoreGroup} from '../../../core/geometry/Group';
import {TetrahedralizeSopOperation} from '../../operations/sop/Tetrahedralize';
import {TET_CREATION_STAGES} from '../../../core/geometry/tetrahedron/TetrahedronConstant';
const DEFAULT = TetrahedralizeSopOperation.DEFAULT_PARAMS;

class TetrahedralizeSopParamsConfig extends NodeParamsConfig {
	resolution = ParamConfig.INTEGER(DEFAULT.resolution, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	minQualityExp = ParamConfig.FLOAT(DEFAULT.minQualityExp, {
		range: [-4, 0],
		rangeLocked: [true, true],
	});
	oneFacePerTet = ParamConfig.BOOLEAN(DEFAULT.oneFacePerTet);
	tetScale = ParamConfig.FLOAT(DEFAULT.tetScale, {
		range: [0.1, 1],
		rangeLocked: [true, false],
		visibleIf: {oneFacePerTet: 0},
	});
	stage = ParamConfig.INTEGER(DEFAULT.stage, {
		menu: {
			entries: TET_CREATION_STAGES.map((name, value) => ({name, value})),
		},
		separatorBefore: true,
	});
	subStage = ParamConfig.INTEGER(DEFAULT.subStage, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new TetrahedralizeSopParamsConfig();

export class TetrahedralizeSopNode extends TypedSopNode<TetrahedralizeSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.TETRAHEDRALIZE;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	private _operation: TetrahedralizeSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new TetrahedralizeSopOperation(this.scene(), this.states);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
