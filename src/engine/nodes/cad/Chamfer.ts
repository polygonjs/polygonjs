/**
 * Applies a chamfer operation
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {step} from '../../../core/geometry/cad/CadConstant';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {traverseEdges} from '../../../core/geometry/cad/CadTraverse';
import {CadObjectType, cadObjectTypeFromShape} from '../../../core/geometry/cad/CadCommon';
import {CadCoreObject} from '../../../core/geometry/cad/CadCoreObject';

class ChamferCadParamsConfig extends NodeParamsConfig {
	/** @param radius */
	radius = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [true, false],
		step,
	});
}
const ParamsConfig = new ChamferCadParamsConfig();

export class ChamferCadNode extends TypedCadNode<ChamferCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'chamfer';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const oc = await CadLoader.core();
		const inputCoreGroup = inputCoreGroups[0];

		const inputObjects = inputCoreGroup.objects();
		const newObjects: CadCoreObject<CadObjectType>[] = [];
		for (let inputObject of inputObjects) {
			console.log(CoreCadType.isShape(inputObject));
			if (CoreCadType.isShape(inputObject)) {
				const shape = inputObject.object();
				const builder = new oc.BRepFilletAPI_MakeChamfer(shape);

				const radius = this.pv.radius;
				let edgesCount = 0;
				traverseEdges(oc, shape, (edge) => {
					builder.Add_2(radius, edge);
					edgesCount++;
				});
				console.log(edgesCount, builder.IsDone());
				if (edgesCount > 0) {
					const newShape = builder.Shape();
					const type = cadObjectTypeFromShape(oc, newShape);
					if (type) {
						newObjects.push(new CadCoreObject(newShape, type));
					} else {
						console.log('no type', newShape);
					}
				} else {
					newObjects.push(inputObject);
				}
			}
		}
		this.setCadObjects(newObjects);
	}
}
