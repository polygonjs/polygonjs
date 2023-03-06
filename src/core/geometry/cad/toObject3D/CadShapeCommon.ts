import {CadLoaderSync} from '../CadLoaderSync';
import type {TopoDS_Shape} from '../CadCommon';
import {Vector3, MathUtils} from 'three';
const keepGeo = true;
const keepMesh = false;
export function cadShapeClone(shape: TopoDS_Shape) {
	const oc = CadLoaderSync.oc();

	const api = new oc.BRepBuilderAPI_Copy_1();
	api.Perform(shape, keepGeo, keepMesh);
	const newShape = api.Shape();
	api.delete();
	return newShape;
}

// https://dev.opencascade.org/doc/refman/html/class_b_rep_builder_a_p_i___transform.html#details
// we set COPY_GEOMETRY to false,
// so that in some cases, the shape is not duplicated,
// which would be faster
const COPY_GEOMETRY = false;
export function cadShapeTransform(shape: TopoDS_Shape, t: Vector3, r: Vector3, s: number, p: Vector3) {
	const oc = CadLoaderSync.oc();

	const _t = CadLoaderSync.gp_Vec;
	const _pivot = CadLoaderSync.gp_Pnt;
	const _q = CadLoaderSync.gp_Quaternion;
	const _transform = CadLoaderSync.gp_Trsf;
	// const _transformT = CadLoader.gp_TrsfT;
	const _transformR = CadLoaderSync.gp_TrsfR;
	const _transformS = CadLoaderSync.gp_TrsfS;
	_q.SetEulerAngles(
		oc.gp_EulerSequence.gp_Extrinsic_XYZ as any,
		MathUtils.degToRad(r.x),
		MathUtils.degToRad(r.y),
		MathUtils.degToRad(r.z)
	);
	_t.SetCoord_2(t.x, t.y, t.z);
	_pivot.SetCoord_2(p.x, p.y, p.z);
	_transform.SetTranslation_1(_t);
	_transformR.SetRotation_2(_q);
	_transformS.SetScale(_pivot, s);
	_transform.Multiply(_transformR);
	_transform.Multiply(_transformS);

	const api = new oc.BRepBuilderAPI_Transform_2(shape, _transform, COPY_GEOMETRY);
	const newShape = api.Shape();
	api.delete();
	return newShape;
}

export function cadShapeTranslate(shape: TopoDS_Shape, t: Vector3) {
	const oc = CadLoaderSync.oc();

	const transform = CadLoaderSync.gp_Trsf;
	const translation = CadLoaderSync.gp_Vec;
	translation.SetCoord_2(t.x, t.y, t.z);
	transform.SetTranslation_1(translation);
	transform.SetScaleFactor(1);
	const loc = new oc.TopLoc_Location_2(transform);
	return shape.Moved(loc, false);
}
