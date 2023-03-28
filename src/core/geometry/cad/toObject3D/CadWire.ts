import type {TopoDS_Wire, CADTesselationParams, CadGeometryType, OpenCascadeInstance, TopoDS_Edge} from '../CadCommon';
import {BufferGeometry} from 'three';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {cadMaterialLine} from '../CadConstant';
import {ObjectType} from '../../Constant';
// import {CoreGeometryBuilderMerge} from '../../builders/Merge';
import {CadLoaderSync} from '../CadLoaderSync';
import {cadShapeClone} from './CadShapeCommon';
import {traverseEdges} from '../CadTraverse';
import {cadEdgeToBufferGeometry} from './CadEdge';
import {CadObject} from '../CadObject';
import {objectContentCopyProperties} from '../../ObjectContent';

export function cadWireToObject3D(cadObject: CadObject<CadGeometryType.WIRE>, tesselationParams: CADTesselationParams) {
	const wire = cadObject.cadGeometry();
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
	return geometries.map((geometry) => {
		const object = BaseSopOperation.createObject(
			geometry,
			ObjectType.LINE_SEGMENTS,
			cadMaterialLine(tesselationParams.edgesColor)
		);
		objectContentCopyProperties(cadObject, object);
		return object;
	});

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

export function cadWireFromEdge(oc: OpenCascadeInstance, edge: TopoDS_Edge) {
	const api = new oc.BRepBuilderAPI_MakeWire_1();
	api.Add_1(edge);
	const wire = api.Wire();
	api.delete();
	return wire;
}
