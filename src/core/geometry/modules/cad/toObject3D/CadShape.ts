import {traverseEdges, traverseFaces} from '../CadTraverse';
import type {
	OpenCascadeInstance,
	TopoDS_Shape,
	CADTesselationParams,
	CachedCADTesselationParams,
	CadGeometryTypeShape,
	TopoDS_Edge,
	TopoDS_Face,
	BRepMesh_IncrementalMesh,
} from '../CadCommon';
import {faceData} from './CadTriangulationFaceUtils';
import {BufferGeometry, BufferAttribute, Object3D, Mesh} from 'three';
import {BaseSopOperation} from '../../../../../engine/operations/sop/_Base';
import {ObjectType} from '../../../Constant';
import {cadMaterialLineGroup, cadMaterialMesh, cadMaterialMeshGroup} from '../CadConstant';
import {cadEdgeToObject3D} from './CadEdge';
import {CadLoaderSync} from '../CadLoaderSync';
import {CadObject} from '../CadObject';
import {objectContentCopyProperties} from '../../../ObjectContent';
import {BaseSopNodeType} from '../../../../../engine/nodes/sop/_Base';
import {SopType} from '../../../../../engine/poly/registers/nodes/types/Sop';
import {CadEntityGroupCollection} from '../CadEntityGroupCollection';
import type {CADGroupSopNode} from '../../../../../engine/nodes/sop/CADGroup';
import {EntityGroupType} from '../../../EntityGroupCollection';
import {withCadException} from '../CadExceptionHandler';
import {arrayPushItems} from '../../../../ArrayUtils';

function cachedTesselationParamsEqual(params1: CachedCADTesselationParams, params2: CachedCADTesselationParams) {
	return (
		params1.linearTolerance == params2.linearTolerance &&
		params1.angularTolerance == params2.angularTolerance &&
		params1.curveAbscissa == params2.curveAbscissa &&
		params1.curveTolerance == params2.curveTolerance
	);
}

const tesselationParamsByShape: WeakMap<TopoDS_Shape, CachedCADTesselationParams> = new WeakMap();
export function cadShapeToObject3D(
	cadObject: CadObject<CadGeometryTypeShape>,
	tesselationParams: CADTesselationParams,
	displayNode: BaseSopNodeType
) {
	const oc = CadLoaderSync.oc();
	const shape = cadObject.cadGeometry();
	let cachedParams = tesselationParamsByShape.get(shape);
	if (cachedParams && !cachedTesselationParamsEqual(cachedParams, tesselationParams)) {
		oc.BRepTools.Clean(shape, true);
	}
	tesselationParamsByShape.set(shape, {...tesselationParams});

	const objects: Object3D[] = [];

	function _processMesh(mesh?: Mesh) {
		if (mesh) {
			objectContentCopyProperties(cadObject, mesh);
			objects.push(mesh);
		}
		return mesh;
	}
	function _processEdgeObject(edge: TopoDS_Edge) {
		const edgeObject = cadEdgeToObject3D(edge, tesselationParams);
		if (edgeObject) {
			// it seems better to not have shadows from those edges
			edgeObject.castShadow = false;
			edgeObject.receiveShadow = false;
			objects.push(edgeObject);
		}
		return edgeObject;
	}
	function _displayNodeIsEdgeGroup() {
		if (displayNode.type() == SopType.CAD_GROUP) {
			const groupNode = displayNode as CADGroupSopNode;
			return groupNode.groupType() == EntityGroupType.EDGE;
		}
		return false;
	}
	function _displayNodeIsFaceGroup() {
		if (displayNode.type() == SopType.CAD_GROUP) {
			const groupNode = displayNode as CADGroupSopNode;
			return groupNode.groupType() == EntityGroupType.FACE;
		}
		return false;
	}

	if (_displayNodeIsFaceGroup()) {
		const groupNode = displayNode as CADGroupSopNode;
		const groupName = groupNode.groupName();
		const facesInGroup: TopoDS_Face[] = [];
		const facesNotInGroup: TopoDS_Face[] = [];
		CadEntityGroupCollection.traverseEntitiesInGroup({
			groupName,
			groupType: EntityGroupType.FACE,
			object: cadObject,
			shape,
			traverseFunction: traverseFaces,
			onEntityTraversed: (face, i) => {
				facesInGroup.push(face);
			},
			onEntityNotInGroupTraversed: (face, i) => {
				facesNotInGroup.push(face);
			},
		});
		const objectInGroup = _createMeshFromFaces(oc, shape, facesInGroup, tesselationParams);
		const objectNotInGroup = _createMeshFromFaces(oc, shape, facesNotInGroup, tesselationParams);
		if (objectInGroup) {
			objectInGroup.material = cadMaterialMeshGroup();
		}
		_processMesh(objectInGroup);
		_processMesh(objectNotInGroup);
	} else {
		if (tesselationParams.displayMeshes) {
			const mesh = _createMesh(oc, shape, tesselationParams);
			_processMesh(mesh);
		}
	}

	if (_displayNodeIsEdgeGroup()) {
		const groupNode = displayNode as CADGroupSopNode;
		const groupName = groupNode.groupName();
		CadEntityGroupCollection.traverseEntitiesInGroup({
			groupName,
			groupType: EntityGroupType.EDGE,
			object: cadObject,
			shape,
			traverseFunction: traverseEdges,
			onEntityTraversed: (edge, i) => {
				const edgeObject = _processEdgeObject(edge);
				if (edgeObject) {
					edgeObject.material = cadMaterialLineGroup();
				}
			},
			onEntityNotInGroupTraversed: _processEdgeObject,
		});
	} else {
		if (tesselationParams.displayEdges) {
			traverseEdges(oc, shape, _processEdgeObject);
		}
	}

	return objects;
}
interface MeshBuffers {
	positions: number[];
	normals: number[];
	indices: number[];
}
function _createMesh(
	oc: OpenCascadeInstance,
	object: TopoDS_Shape,
	tesselationParams: CADTesselationParams
): Mesh | undefined {
	const mesher = withCadException<BRepMesh_IncrementalMesh>(oc, () => {
		const _mesher = new oc.BRepMesh_IncrementalMesh_2(
			object,
			tesselationParams.linearTolerance,
			true,
			tesselationParams.angularTolerance,
			true
		);
		return _mesher;
	});
	if (!mesher) {
		const updatedTesselationParams: CADTesselationParams = {...tesselationParams};
		updatedTesselationParams.linearTolerance *= 2;
		updatedTesselationParams.angularTolerance *= 2;
		updatedTesselationParams.curveAbscissa *= 2;
		updatedTesselationParams.curveTolerance *= 2;
		return _createMesh(oc, object, updatedTesselationParams);
	}
	if (mesher.IsDone()) {
		const positions: number[] = [];
		const normals: number[] = [];
		const indices: number[] = [];
		const buffers: MeshBuffers = {positions, normals, indices};
		traverseFaces(oc, object, (face) => {
			_updateBufferFromFace(oc, face, buffers);
		});
		mesher.delete();

		return _createMeshFromBuffers(buffers, tesselationParams);
	}
}
function _createMeshFromFaces(
	oc: OpenCascadeInstance,
	object: TopoDS_Shape,
	faces: TopoDS_Face[],
	tesselationParams: CADTesselationParams
) {
	const mesher = new oc.BRepMesh_IncrementalMesh_2(
		object,
		tesselationParams.linearTolerance,
		true,
		tesselationParams.angularTolerance,
		true
	);
	if (mesher.IsDone()) {
		const positions: number[] = [];
		const normals: number[] = [];
		const indices: number[] = [];
		const buffers: MeshBuffers = {positions, normals, indices};
		for (const face of faces) {
			_updateBufferFromFace(oc, face, buffers);
		}
		mesher.delete();
		return _createMeshFromBuffers(buffers, tesselationParams);
	}
}

function _updateBufferFromFace(oc: OpenCascadeInstance, face: TopoDS_Face, buffers: MeshBuffers) {
	const {positions, normals, indices} = buffers;
	const data = faceData(oc, face, positions.length / 3);

	if (data) {
		arrayPushItems(positions, data.positions);
		arrayPushItems(normals, data.normals);
		arrayPushItems(indices, data.indices);
	}
}
function _createMeshFromBuffers(buffers: MeshBuffers, tesselationParams: CADTesselationParams) {
	const {positions, normals, indices} = buffers;

	const geo = new BufferGeometry();
	geo.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	geo.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
	geo.setIndex(indices);

	return BaseSopOperation.createObject(
		geo,
		ObjectType.MESH,
		cadMaterialMesh(tesselationParams.meshesColor, tesselationParams.wireframe)
	);
}
