/**
 * Applies a CAD fillet operation
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import type {OpenCascadeInstance, TopoDS_Shape} from '../../../core/geometry/cad/CadCommon';
import {step} from '../../../core/geometry/cad/CadConstant';
import {CoreCadType} from '../../../core/geometry/cad/CadCoreType';
import {traverseEdges} from '../../../core/geometry/cad/CadTraverse';
import {CadGeometryType, cadGeometryTypeFromShape} from '../../../core/geometry/cad/CadCommon';
import {TypeAssert} from '../../poly/Assert';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadObject} from '../../../core/geometry/cad/CadObject';
import {CadLoaderSync} from '../../../core/geometry/cad/CadLoaderSync';
// import {CadCoreEdge} from '../../../core/geometry/cad/CadCoreEdge';
// import {CoreString} from '../../../core/String';
// import {SetUtils} from '../../../core/SetUtils';
// import {coreObjectInstanceFactory} from '../../../core/geometry/CoreObjectFactory';
import {EntityGroupType} from '../../../core/geometry/EntityGroupCollection';
import {CadEntityGroupCollection} from '../../../core/geometry/cad/CadEntityGroupCollection';

enum FilletMode {
	ROUND = 'round',
	STRAIGHT = 'straight',
}
const FILLET_MODES: FilletMode[] = [FilletMode.STRAIGHT, FilletMode.ROUND];
class CADFilletSopParamsConfig extends NodeParamsConfig {
	/** @param edges group */
	group = ParamConfig.STRING('');
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

	override cook(inputCoreGroups: CoreGroup[]) {
		const oc = CadLoaderSync.oc();
		const inputCoreGroup = inputCoreGroups[0];

		const mode = FILLET_MODES[this.pv.mode];
		const newObjects: CadObject<CadGeometryType>[] = [];

		const inputObjects = inputCoreGroup.cadObjects();
		if (inputObjects) {
			const groupName = this.pv.group;
			for (let object of inputObjects) {
				if (CoreCadType.isShape(object)) {
					const shape = object.cadGeometry();
					const api = _getApi(oc, mode, shape);

					const radius = this.pv.radius;
					let edgesCount = 0;

					CadEntityGroupCollection.traverseEntitiesInGroup({
						groupName,
						groupType: EntityGroupType.EDGE,
						object,
						shape,
						traverseFunction: traverseEdges,
						onEntityTraversed: (edge, i) => {
							api.Add_2(radius, edge);
							edgesCount++;
						},
					});

					if (edgesCount > 0) {
						const newShape = api.Shape();
						api.delete();
						const type = cadGeometryTypeFromShape(oc, newShape);
						if (type) {
							newObjects.push(new CadObject(newShape, type));
						} else {
							console.log('no type', newShape);
						}
					} else {
						newObjects.push(object);
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
