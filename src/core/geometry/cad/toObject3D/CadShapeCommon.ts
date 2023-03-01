import {CadLoader} from '../CadLoader';
import type {TopoDS_Shape, gp_Trsf, gp_Vec} from '../CadCommon';
import {Vector3} from 'three';
const keepGeo = true;
const keepMesh = false;
export function cadShapeClone(shape: TopoDS_Shape) {
	const oc = CadLoader.oc();
	const api = new oc.BRepBuilderAPI_Copy_1();
	api.Perform(shape, keepGeo, keepMesh);
	const newShape = api.Shape();
	api.delete();
	return newShape;
}

let _t: gp_Vec | undefined;
let _transform: gp_Trsf | undefined;
const COPY_GEOMETRY = true;
export function cadShapeTransform(shape: TopoDS_Shape, t: Vector3, r: Vector3, s: Vector3) {
	const oc = CadLoader.oc();
	_t = _t || new oc.gp_Vec_1();
	_transform = _transform || new oc.gp_Trsf_1();
	_t.SetCoord_2(t.x, t.y, t.z);
	_transform.SetTranslation_1(_t);

	const api = new oc.BRepBuilderAPI_Transform_2(shape, _transform, COPY_GEOMETRY);
	const newShape = api.Shape();
	api.delete();
	return newShape;
}
