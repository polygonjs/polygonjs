/**
 * created a CAD prism/extrude
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadGeometryType, cadGeometryTypeFromShape} from '../../../core/geometry/cad/CadCommon';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadLoaderSync} from '../../../core/geometry/cad/CadLoaderSync';
import {CadObject} from '../../../core/geometry/cad/CadObject';
import {cadFilterObjects} from '../../../core/geometry/cad/utils/CadFilter';

class CADPrismSopParamsConfig extends NodeParamsConfig {
	/** @param direction */
	dir = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param height */
	height = ParamConfig.FLOAT(1, {
		range: [-10, 10],
		rangeLocked: [false, false],
	});
}
const ParamsConfig = new CADPrismSopParamsConfig();

export class CADPrismSopNode extends CADSopNode<CADPrismSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_PRISM;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const oc = CadLoaderSync.oc();
		const inputCoreGroup = inputCoreGroups[0];

		const prismVec = CadLoaderSync.gp_Vec;
		prismVec.SetCoord_2(
			this.pv.dir.x * this.pv.height,
			this.pv.dir.y * this.pv.height,
			this.pv.dir.z * this.pv.height
		);
		const newObjects: CadObject<CadGeometryType>[] = [];
		const inputObjects = cadFilterObjects(inputCoreGroup.cadObjects(), CadGeometryType.WIRE);
		if (inputObjects) {
			for (let object of inputObjects) {
				const wire = object.cadGeometry();
				// TODO: cad/convert or cad/makeFace
				const faceApi = new oc.BRepBuilderAPI_MakeFace_15(wire, true);
				const face = faceApi.Face();
				const prismApi = new oc.BRepPrimAPI_MakePrism_1(face, prismVec, false, true);
				const prism = prismApi.Shape();
				const type = cadGeometryTypeFromShape(oc, prism);
				if (type) {
					const newObject = new CadObject(prism, type);
					newObjects.push(newObject);
				}
			}
		}

		this.setCADObjects(newObjects);
	}
}
