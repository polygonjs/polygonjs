import {traverseEdges, traverseFaces} from '../CadTraverse';
import type {OpenCascadeInstance, TopoDS_Shape, TesselationParams, CachedTesselationParams} from '../CadCommon';
import {faceData} from '../CadCoreFace';
import {BufferGeometry, BufferAttribute, Object3D} from 'three';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {ObjectType} from '../../Constant';
import {CAD_MATERIAL} from '../CadConstant';
import {cadEdgeToObject3D} from './CadEdge';
import {CadLoaderSync} from '../CadLoaderSync';

function cachedTesselationParamsEqual(params1: CachedTesselationParams, params2: CachedTesselationParams) {
	return (
		params1.linearTolerance == params2.linearTolerance &&
		params1.angularTolerance == params2.angularTolerance &&
		params1.curveAbscissa == params2.curveAbscissa &&
		params1.curveTolerance == params2.curveTolerance
	);
}

const tesselationParamsByShape: WeakMap<TopoDS_Shape, CachedTesselationParams> = new WeakMap();
export function cadShapeToObject3D(object: TopoDS_Shape, tesselationParams: TesselationParams) {
	const oc = CadLoaderSync.oc();
	let cachedParams = tesselationParamsByShape.get(object);
	if (cachedParams && !cachedTesselationParamsEqual(cachedParams, tesselationParams)) {
		oc.BRepTools.Clean(object, true);
	}
	tesselationParamsByShape.set(object, {...tesselationParams});

	const objects: Object3D[] = [];
	if (tesselationParams.displayMeshes) {
		const mesh = _createMesh(oc, object, tesselationParams);
		if (mesh) {
			objects.push(mesh);
		}
	}
	if (tesselationParams.displayEdges) {
		// const edgeObjects:Object3D[]=[]
		traverseEdges(oc, object, (edge) => {
			const edgeObject = cadEdgeToObject3D(edge, tesselationParams);
			if (edgeObject) {
				// it seems better to not have shadows from those edges
				edgeObject.castShadow = false;
				edgeObject.receiveShadow = false;
				objects.push(edgeObject);
			}
		});
	}

	return objects;
}

function _createMesh(oc: OpenCascadeInstance, object: TopoDS_Shape, tesselationParams: TesselationParams) {
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

		traverseFaces(oc, object, (face) => {
			const data = faceData(oc, face, positions.length / 3);

			if (data) {
				positions.push(...data.positions);
				normals.push(...data.normals);
				indices.push(...data.indices);
			}
		});
		mesher.delete();

		const geo = new BufferGeometry();
		geo.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
		geo.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
		geo.setIndex(indices);

		const materialPair = CAD_MATERIAL[ObjectType.MESH];
		const material = tesselationParams.wireframe ? materialPair.wireframe : materialPair.plain;
		material.color.copy(tesselationParams.meshesColor);
		return BaseSopOperation.createObject(geo, ObjectType.MESH, material);
	}
}
