/**
 * Creates a surface from multiple curves
 *
 *
 */

import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadLoaderSync} from '../../../core/geometry/modules/cad/CadLoaderSync';
import {CoreCadType} from '../../../core/geometry/modules/cad/CadCoreType';
import {CadObject} from '../../../core/geometry/modules/cad/CadObject';
import {
	cadDowncast,
	CadGC,
	CadGeometryType,
	cadGeometryTypeFromShape,
	// TopoDS_Wire,
	// TopoDS_Shape,
} from '../../../core/geometry/modules/cad/CadCommon';
import {cadFilterObjects} from '../../../core/geometry/modules/cad/utils/CadFilter';
import {CoreGroup} from '../../../core/geometry/Group';
import {isBooleanTrue} from '../../../core/Type';

class CADLoftSopParamsConfig extends NodeParamsConfig {
	/** @param create solid */
	solid = ParamConfig.BOOLEAN(1);
	/** @param create caps */
	// cap = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new CADLoftSopParamsConfig();

export class CADLoftSopNode extends CADSopNode<CADLoftSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_LOFT;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const oc = CadLoaderSync.oc();
		const inputCoreGroup = inputCoreGroups[0];

		const newObjects: CadObject<CadGeometryType>[] = [];
		const inputObjects = cadFilterObjects(inputCoreGroup.cadObjects(), [
			CadGeometryType.VERTEX,
			// CadGeometryType.EDGE,
			CadGeometryType.WIRE,
			// CadGeometryType.FACE,
			// CadGeometryType.SHELL,
		]);
		// const pathObjects = cadFilterObjects(pathsCoreGroup.cadObjects(), [CadGeometryType.EDGE, CadGeometryType.WIRE]);
		if (inputObjects && inputObjects.length != 0) {
			CadGC.withGC((r) => {
				// const objectsCount = Math.min(profilesObjects.length, pathObjects.length);
				const isSolid = isBooleanTrue(this.pv.solid);
				const ruled = true;
				const precision = oc.Precision.Approximation();
				const api = r(new oc.BRepOffsetAPI_ThruSections(isSolid, ruled, precision));
				for (let inputObject of inputObjects) {
					// const profileObject = profilesObjects[i];
					// const pathObject = pathObjects[i];

					if (CoreCadType.isWire(inputObject)) {
						api.AddWire(cadDowncast(oc, inputObject.cadGeometry()));
					} else if (CoreCadType.isVertex(inputObject)) {
						api.AddVertex(cadDowncast(oc, inputObject.cadGeometry()));
					}
				}

				const shape = api.Shape();
				// if (isBooleanTrue(this.pv.cap)) {
				// 	const addCap = (capShape: TopoDS_Shape | undefined, invert: boolean) => {
				// 		if (!capShape) {
				// 			return;
				// 		}
				// 		console.log(capShape);
				// 		console.log(capShape.ShapeType());
				// 		console.log(cadGeometryTypeFromShape(oc, capShape));
				// 		if (cadGeometryTypeFromShape(oc, capShape) == CadGeometryType.WIRE) {
				// 			const wire = cadDowncast(oc, capShape) as TopoDS_Wire;
				// 			const capApi = r(new oc.BRepBuilderAPI_MakeFace_15(wire, true));
				// 			if (capApi.IsDone()) {
				// 				const face = capApi.Face();
				// 				shapes.push(invert ? face.Complemented() : face);
				// 			}
				// 		}
				// 	};
				// 	addCap(api.FirstShape(), true);
				// 	addCap(api.LastShape(), false);
				// }
				// for (let shape of shapes) {
				const type = cadGeometryTypeFromShape(oc, shape);
				if (type) {
					const newObject = new CadObject(shape, type);
					newObjects.push(newObject);
				}
				// }
				// }
			});
		}

		this.setCADObjects(newObjects);
	}
}
