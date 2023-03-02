import type {OpenCascadeInstance, TopoDS_Wire, TesselationParams} from '../CadCommon';
import {BufferGeometry, Vector3} from 'three';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {CAD_MATERIAL} from '../CadConstant';
import {ObjectType} from '../../Constant';
import {CoreGeometryBuilderMerge} from '../../builders/Merge';
import {CadLoader} from '../CadLoader';
import {cadShapeClone, cadShapeTransform} from './CadShapeCommon';
import {traverseEdges} from '../CadTraverse';
import {cadEdgeToBufferGeometry} from './CadEdge';

export function cadWireToObject3D(oc: OpenCascadeInstance, wire: TopoDS_Wire, tesselationParams: TesselationParams) {
	const geometries: BufferGeometry[] = [];
	traverseEdges(oc, wire, (edge) => {
		const geometry = cadEdgeToBufferGeometry(oc, edge, tesselationParams);
		geometries.push(geometry);
	});
	const geometry = CoreGeometryBuilderMerge.merge(geometries);
	if (geometry) {
		return BaseSopOperation.createObject(
			geometry,
			ObjectType.LINE_SEGMENTS,
			CAD_MATERIAL[ObjectType.LINE_SEGMENTS].plain
		);
	}
}

export function cadWireTransform(edge: TopoDS_Wire, t: Vector3, r: Vector3, s: Vector3) {
	return cadShapeTransform(edge, t, r, s);
}

export function cadWireClone(src: TopoDS_Wire): TopoDS_Wire {
	const oc = CadLoader.oc();
	return oc.TopoDS.Wire_1(cadShapeClone(src));
}
