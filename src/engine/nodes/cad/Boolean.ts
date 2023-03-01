/**
 * Applies a boolean operation
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';

export enum BooleanCadOperationType {
	INTERSECT = 'intersect',
	SUBTRACT = 'subtract',
	UNION = 'union',
}
export const BOOLEAN_CAD_OPERATION_TYPES: BooleanCadOperationType[] = [
	BooleanCadOperationType.INTERSECT,
	BooleanCadOperationType.SUBTRACT,
	BooleanCadOperationType.UNION,
];

class BooleanCadParamsConfig extends NodeParamsConfig {
	/** @param operation */
	operation = ParamConfig.INTEGER(BOOLEAN_CAD_OPERATION_TYPES.indexOf(BooleanCadOperationType.INTERSECT), {
		menu: {entries: BOOLEAN_CAD_OPERATION_TYPES.map((name, value) => ({name, value}))},
	});
}
const ParamsConfig = new BooleanCadParamsConfig();

export class BooleanCadNode extends TypedCadNode<BooleanCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'boolean';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(2);
	}
	setOperation(operation: BooleanCadOperationType) {
		this.p.operation.set(BOOLEAN_CAD_OPERATION_TYPES.indexOf(operation));
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const oc = await CadLoader.core();
		const coreGroup0 = inputCoreGroups[0];
		const coreGroup1 = inputCoreGroups[1];

		const object0 = coreGroup0.objects()[0];
		const object1 = coreGroup1.objects()[0];

		const operation = BOOLEAN_CAD_OPERATION_TYPES[this.pv.operation];
		const apiClass = {
			[BooleanCadOperationType.INTERSECT]: oc.BRepAlgoAPI_Common_3,
			[BooleanCadOperationType.SUBTRACT]: oc.BRepAlgoAPI_Cut_3,
			[BooleanCadOperationType.UNION]: oc.BRepAlgoAPI_Fuse_3,
		}[operation];

		if (object0 && object1 && CoreCadType.isShape(object0) && CoreCadType.isShape(object1)) {
			const cut = new apiClass(object0.object(), object1.object(), new oc.Message_ProgressRange_1());
			cut.Build(new oc.Message_ProgressRange_1());

			const shape = cut.Shape();
			this.setShell(shape);
		} else {
			this.setCadObjects([object0]);
		}
	}
}
