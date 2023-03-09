import type {OpenCascadeInstance, TopoDS_Vertex, gp_Pnt, CadGeometryType} from '../CadCommon';
import {BufferGeometry, BufferAttribute, Vector3} from 'three';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {ObjectType} from '../../Constant';
import {cadMaterialPoint} from '../CadConstant';
import {CadLoaderSync} from '../CadLoaderSync';
import {cadShapeClone} from './CadShapeCommon';
import {CadObject} from '../CadObject';
import {objectContentCopyProperties} from '../../ObjectContent';

export function cadVertexToObject3D(cadObject: CadObject<CadGeometryType.VERTEX>) {
	const oc = CadLoaderSync.oc();
	const vertex = cadObject.cadGeometry();
	const point = oc.BRep_Tool.Pnt(vertex);
	const geo = new BufferGeometry();
	const positions: number[] = [point.X(), point.Y(), point.Z()];
	geo.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	const object = BaseSopOperation.createObject(geo, ObjectType.POINTS, cadMaterialPoint());
	objectContentCopyProperties(cadObject, object);
	return object;
}

export function cadVertexCreate(oc: OpenCascadeInstance, t: Vector3): TopoDS_Vertex {
	const point = new oc.gp_Pnt_3(t.x, t.y, t.z);
	return _vertexFromPoint(oc, point);
}
function _vertexFromPoint(oc: OpenCascadeInstance, point: gp_Pnt): TopoDS_Vertex {
	const api = new oc.BRepBuilderAPI_MakeVertex(point);
	const vertex = api.Vertex();
	api.delete();
	return vertex;
}

// export function cadVertexTransform(src: TopoDS_Vertex, t: Vector3) {
// 	const oc = CadLoader.oc();
// 	const point = oc.BRep_Tool.Pnt(src);

// 	point.SetX(point.X() + t.x);
// 	point.SetY(point.Y() + t.y);
// 	point.SetZ(point.Z() + t.z);
// 	return _vertexFromPoint(oc, point);
// }

export function cadVertexClone(src: TopoDS_Vertex): TopoDS_Vertex {
	const oc = CadLoaderSync.oc();
	return oc.TopoDS.Vertex_1(cadShapeClone(src));
}
