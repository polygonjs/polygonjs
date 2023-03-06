/**
 * Mirros CAD input objects
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadGeometryType, TopoDS_Shape, cadGeometryTypeFromShape} from '../../../core/geometry/cad/CadCommon';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadLoaderSync} from '../../../core/geometry/cad/CadLoaderSync';
import {CadObject} from '../../../core/geometry/cad/CadObject';

// TODO: make sure it works for 3D as well
class CADMirrorSopParamsConfig extends NodeParamsConfig {
	/** @param origin */
	// origin = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param axis */
	axis = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new CADMirrorSopParamsConfig();

export class CADMirrorSopNode extends CADSopNode<CADMirrorSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_MIRROR;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const oc = CadLoaderSync.oc();
		const inputCoreGroup = inputCoreGroups[0];

		const axis = CadLoaderSync.gp_Ax1;
		const dir = CadLoaderSync.gp_Dir; //new oc.gp_Dir_4(this.pv.axis.x, this.pv.axis.y, this.pv.axis.z);
		dir.SetCoord_2(this.pv.axis.x, this.pv.axis.y, this.pv.axis.z);
		axis.SetDirection(dir);
		const transform = CadLoaderSync.gp_Trsf;
		transform.SetMirror_2(axis);
		const newObjects: CadObject<CadGeometryType>[] = [];
		const inputObjects = inputCoreGroup.cadObjects();
		if (inputObjects) {
			for (let object of inputObjects) {
				if (CoreCadType.isShape(object)) {
					const shape = object.cadGeometry() as TopoDS_Shape;
					const transformApi = new oc.BRepBuilderAPI_Transform_2(shape, transform, false);
					const mirroredShape = transformApi.Shape();
					const type = cadGeometryTypeFromShape(oc, mirroredShape);
					if (type) {
						newObjects.push(new CadObject(mirroredShape, type));
					}
				}
			}
		}

		this.setCADObjects(newObjects);
	}
}
