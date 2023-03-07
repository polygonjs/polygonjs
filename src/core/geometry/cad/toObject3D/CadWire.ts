import type {TopoDS_Wire, CADTesselationParams} from '../CadCommon';
import {BufferGeometry} from 'three';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {cadMaterialLine} from '../CadConstant';
import {ObjectType} from '../../Constant';
// import {CoreGeometryBuilderMerge} from '../../builders/Merge';
import {CadLoaderSync} from '../CadLoaderSync';
import {cadShapeClone} from './CadShapeCommon';
import {traverseEdges} from '../CadTraverse';
import {cadEdgeToBufferGeometry} from './CadEdge';

export function cadWireToObject3D(wire: TopoDS_Wire, tesselationParams: CADTesselationParams) {
	const geometries: BufferGeometry[] = [];
	const oc = CadLoaderSync.oc();
	traverseEdges(oc, wire, (edge) => {
		const geometry = cadEdgeToBufferGeometry(edge, tesselationParams);
		if (geometry) {
			geometries.push(geometry);
		}
	});
	// do not merge here,
	// do it at the cadNetwork level to control perf
	// const geometry = CoreGeometryBuilderMerge.merge(geometries);
	return geometries.map((geometry) =>
		BaseSopOperation.createObject(geometry, ObjectType.LINE_SEGMENTS, cadMaterialLine(tesselationParams.edgesColor))
	);

	// if (geometry) {
	// 	return BaseSopOperation.createObject(
	// 		geometry,
	// 		ObjectType.LINE_SEGMENTS,
	// 		CAD_MATERIAL[ObjectType.LINE_SEGMENTS].plain
	// 	);
	// }
}

// export function cadWireTransform(edge: TopoDS_Wire, t: Vector3, r: Vector3, s: Vector3) {
// 	return cadShapeTransform(edge, t, r, s);
// }

export function cadWireClone(src: TopoDS_Wire): TopoDS_Wire {
	const oc = CadLoaderSync.oc();
	return oc.TopoDS.Wire_1(cadShapeClone(src));
}
