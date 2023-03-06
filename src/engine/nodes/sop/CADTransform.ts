/**
 * Transform input CAD geometries or objects.
 *
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CadObject} from '../../../core/geometry/cad/CadObject';
import {CadGeometryType} from '../../../core/geometry/cad/CadCommon';
import {cadTransform} from '../../../core/geometry/cad/operations/CadTransform';
class CADTransformSopParamConfig extends NodeParamsConfig {
	/** @param translate */
	t = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param rotation */
	r = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param scale (as a float) */
	s = ParamConfig.FLOAT(1, {
		range: [0, 2],
		step: 0.01,
	});
	/** @param pivot */
	pivot = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new CADTransformSopParamConfig();

export class CADTransformSopNode extends CADSopNode<CADTransformSopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_TRANSFORM;
	}

	static override displayedInputNames(): string[] {
		return ['geometries or objects to transform'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const newObjects: CadObject<CadGeometryType>[] = [];
		const cadObjects = coreGroup0.cadObjects();
		if (cadObjects) {
			for (let cadObject of cadObjects) {
				// object.transform(this.pv.t, this.pv.r, tmpS);
				cadTransform(cadObject, this.pv.t, this.pv.r, this.pv.s, this.pv.pivot);
				newObjects.push(cadObject);
			}
		}

		this.setCADObjects(newObjects);
	}
}
