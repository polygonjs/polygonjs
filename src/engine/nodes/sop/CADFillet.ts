/**
 * Applies a CAD fillet operation
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import type {OpenCascadeInstance, TopoDS_Shape} from '../../../core/geometry/cad/CadCommon';
import {step} from '../../../core/geometry/cad/CadConstant';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {traverseEdges} from '../../../core/geometry/cad/CadTraverse';
import {CadGeometryType, cadGeometryTypeFromShape} from '../../../core/geometry/cad/CadCommon';
import {TypeAssert} from '../../poly/Assert';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadObject} from '../../../core/geometry/cad/CadObject';

enum FilletMode {
	ROUND = 'round',
	STRAIGHT = 'straight',
}
const FILLET_MODES: FilletMode[] = [FilletMode.STRAIGHT, FilletMode.ROUND];
class CADFilletSopParamsConfig extends NodeParamsConfig {
	/** @param mode */
	mode = ParamConfig.INTEGER(FILLET_MODES.indexOf(FilletMode.ROUND), {
		menu: {
			entries: FILLET_MODES.map((name, value) => ({name, value})),
		},
	});
	/** @param radius */
	radius = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [true, false],
		step,
	});
}
const ParamsConfig = new CADFilletSopParamsConfig();

export class CADFilletSopNode extends CADSopNode<CADFilletSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_FILLET;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const oc = await CadLoader.core();
		const inputCoreGroup = inputCoreGroups[0];

		const mode = FILLET_MODES[this.pv.mode];
		const newObjects: CadObject<CadGeometryType>[] = [];

		const inputObjects = inputCoreGroup.cadObjects();
		if (inputObjects) {
			for (let inputObject of inputObjects) {
				if (CoreCadType.isShape(inputObject)) {
					const shape = inputObject.cadGeometry();
					const api = _getApi(oc, mode, shape);

					const radius = this.pv.radius;
					let edgesCount = 0;
					traverseEdges(oc, shape, (edge) => {
						api.Add_2(radius, edge);
						edgesCount++;
					});
					if (edgesCount > 0) {
						const newShape = api.Shape();
						const type = cadGeometryTypeFromShape(oc, newShape);
						if (type) {
							newObjects.push(new CadObject(newShape, type));
						} else {
							console.log('no type', newShape);
						}
					} else {
						newObjects.push(inputObject);
					}
				}
			}
		}

		this.setCADObjects(newObjects);
	}
}

function _getApi(oc: OpenCascadeInstance, mode: FilletMode, shape: TopoDS_Shape) {
	switch (mode) {
		case FilletMode.ROUND: {
			return new oc.BRepFilletAPI_MakeFillet(shape, oc.ChFi3d_FilletShape.ChFi3d_Rational as any);
		}
		case FilletMode.STRAIGHT: {
			return new oc.BRepFilletAPI_MakeChamfer(shape);
		}
	}
	TypeAssert.unreachable(mode);
}
