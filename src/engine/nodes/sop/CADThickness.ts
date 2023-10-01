/**
 * Adds a thickness to CAD input objects
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {step} from '../../../core/geometry/modules/cad/CadConstant';
import {CoreCadType} from '../../../core/geometry/modules/cad/CadCoreType';
import {
	CadGeometryType,
	TopoDS_Shape,
	OpenCascadeInstance,
	cadGeometryTypeFromShape,
	// TopTools_ListOfShape,
} from '../../../core/geometry/modules/cad/CadCommon';
import {traverseFaces} from '../../../core/geometry/modules/cad/CadTraverse';
// import {withCadException} from '../../../core/geometry/modules/cad/CadExceptionHandler';
// import {SetUtils} from '../../../core/SetUtils';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadObject} from '../../../core/geometry/modules/cad/CadObject';
import {CadLoaderSync} from '../../../core/geometry/modules/cad/CadLoaderSync';
// import {CoreString} from '../../../core/String';
// import {CadCoreFace} from '../../../core/geometry/modules/cad/CadCoreFace';
// import {coreObjectInstanceFactory} from '../../../core/geometry/CoreObjectFactory';
import {EntityGroupType} from '../../../core/geometry/EntityGroupCollection';
import {CadEntityGroupCollection} from '../../../core/geometry/modules/cad/CadEntityGroupCollection';

// TODO: find more meaningful name
class CADThicknessSopParamsConfig extends NodeParamsConfig {
	/** @param faces group */
	facesGroupToDelete = ParamConfig.STRING('');
	/** @param offset */
	offset = ParamConfig.FLOAT(-0.1, {
		range: [-1, 1],
		rangeLocked: [true, false],
		step,
	});
}
const ParamsConfig = new CADThicknessSopParamsConfig();

export class CADThicknessSopNode extends CADSopNode<CADThicknessSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_THICKNESS;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const oc = CadLoaderSync.oc();
		const inputCoreGroup = inputCoreGroups[0];

		// line.start.set(0, 0, 0);
		// normalizedAxis.copy(this.pv.facesSortAxis).normalize();
		// line.end.copy(normalizedAxis);
		const newObjects: CadObject<CadGeometryType>[] = [];

		const inputObjects = inputCoreGroup.cadObjects();
		if (inputObjects) {
			for (const inputObject of inputObjects) {
				if (CoreCadType.isShape(inputObject)) {
					const newShape = this._makeSolidByJoin(oc, inputObject);
					if (newShape) {
						const type = cadGeometryTypeFromShape(oc, newShape);
						if (type) {
							newObjects.push(new CadObject(newShape, type));
						} else {
							console.log('no type', newShape);
						}
					}
				} else {
					newObjects.push(inputObject);
				}
			}
		}

		this.setCADObjects(newObjects);
	}

	// private _makeSolid(oc: OpenCascadeInstance, shape: TopoDS_Shape, axis: Line3) {
	// 	return this.pv.removeFaces ? this._makeSolidByJoin(oc, shape, axis) : this._makeSolidBySimple(oc, shape);
	// }
	// private _makeSolidBySimple(oc: OpenCascadeInstance, shape: TopoDS_Shape) {
	// 	return withCadException(oc, () => {
	// 		const api = new oc.BRepOffsetAPI_MakeThickSolid();
	// 		api.MakeThickSolidBySimple(shape, this.pv.offset);
	// 		if(api.IsDone())
	// 		return api.Shape();
	// 	});
	// }
	private _makeSolidByJoin(oc: OpenCascadeInstance, object: CadObject<CadGeometryType>) {
		// const facesToRemove = this._getFacesToRemove(oc, shape, axis);
		const faces = new oc.TopTools_ListOfShape_1();
		// for (let face of facesToRemove) {
		// 	faces.Append_1(face);
		// }
		const shape = object.cadGeometry() as TopoDS_Shape;
		CadEntityGroupCollection.traverseEntitiesInGroup({
			groupName: this.pv.facesGroupToDelete,
			groupType: EntityGroupType.FACE,
			object,
			shape,
			traverseFunction: traverseFaces,
			onEntityTraversed: (face, i) => {
				faces.Append_1(face);
			},
		});

		//
		const api = new oc.BRepOffsetAPI_MakeThickSolid();
		api.MakeThickSolidByJoin(
			shape,
			faces,
			this.pv.offset,
			1e-3,
			oc.BRepOffset_Mode.BRepOffset_Skin as any,
			false,
			false,
			oc.GeomAbs_JoinType.GeomAbs_Arc as any,
			false,
			CadLoaderSync.Message_ProgressRange
		);
		const newShape = api.Shape();
		api.delete();
		faces.delete();
		return newShape;
	}

	// private _getFacesToRemove(
	// 	oc: OpenCascadeInstance,
	// 	object: CadObject<CadGeometryType>,
	// 	shape: TopoDS_Shape,
	// 	faces: TopTools_ListOfShape
	// ) {

	// 	// const groupName = this.pv.facesGroupToDelete;
	// 	// if (groupName.trim() == '') {
	// 	// 	// no group
	// 	// 	traverseFaces(oc, shape, (face) => {
	// 	// 		faces.Append_1(face);
	// 	// 	});
	// 	// } else {
	// 	// 	const indices = CoreString.indices(groupName);
	// 	// 	if (indices.length != 0) {
	// 	// 		// group by indices
	// 	// 		const indicesSet = SetUtils.fromArray(indices);
	// 	// 		traverseFaces(oc, shape, (face, i) => {
	// 	// 			if (indicesSet.has(i)) {
	// 	// 				faces.Append_1(face);
	// 	// 			}
	// 	// 		});
	// 	// 	} else {
	// 	// 		// group by name
	// 	// 		const coreFaces: CadCoreFace[] = [];
	// 	// 		traverseFaces(oc, shape, (face, i) => {
	// 	// 			coreFaces.push(new CadCoreFace(shape, face, i));
	// 	// 		});
	// 	// 		const coreObject = coreObjectInstanceFactory(object);
	// 	// 		const groupCollection = coreObject.groupCollection();
	// 	// 		const selectedCoreFaces = groupCollection.entities(EntityGroupType.FACE, groupName, coreFaces);
	// 	// 		for (let selectedCoreFace of selectedCoreFaces) {
	// 	// 			faces.Append_1(selectedCoreFace.face());
	// 	// 		}
	// 	// 	}
	// 	// }

	// 	// facesByDist.clear();
	// 	// faceDists.clear();
	// 	// traverseFaces(oc, shape, (face) => {
	// 	// 	// const surface = oc.BRep_Tool.Surface_2(face);

	// 	// 	const surfaceProperties = CadLoaderSync.GProp_GProps;
	// 	// 	oc.BRepGProp.SurfaceProperties_1(face, surfaceProperties, false, false);
	// 	// 	const centerOfMass = surfaceProperties.CentreOfMass();

	// 	// 	faceCenter.set(centerOfMass.X(), centerOfMass.Y(), centerOfMass.Z());
	// 	// 	axis.closestPointToPoint(faceCenter, false, projected);
	// 	// 	const position = projected.dot(axis.end);
	// 	// 	// const currentFace = new oc.TopExp_Explorer_2(
	// 	// 	// 	face,
	// 	// 	// 	oc.TopAbs_ShapeEnum.TopAbs_FACE as any,
	// 	// 	// 	oc.TopAbs_ShapeEnum.TopAbs_SHAPE as any
	// 	// 	// ).Current();
	// 	// 	MapUtils.addToSetAtEntry(facesByDist, position, face);
	// 	// 	faceDists.add(position);
	// 	// });
	// 	// const dists = SetUtils.toArray(faceDists);
	// 	// const sortedDists = dists.sort((a, b) => (a > b ? 1 : -1));
	// 	// const facesToRemove: TopoDS_Face[] = [];
	// 	// for (let dist of sortedDists) {
	// 	// 	const faces = facesByDist.get(dist);
	// 	// 	if (faces) {
	// 	// 		for (let face of faces) {
	// 	// 			facesToRemove.push(face);
	// 	// 			if (facesToRemove.length >= this.pv.facesCount) {
	// 	// 				return facesToRemove;
	// 	// 			}
	// 	// 		}
	// 	// 	}
	// 	// }
	// 	// return facesToRemove;
	// }
}
