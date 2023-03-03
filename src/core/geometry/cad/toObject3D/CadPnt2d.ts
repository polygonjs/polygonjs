import {BufferGeometry, BufferAttribute, Vector2} from 'three';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {ObjectType} from '../../Constant';
import {CAD_MATERIAL} from '../CadConstant';
import {CadLoader} from '../CadLoader';
import type {OpenCascadeInstance, gp_Pnt2d} from '../CadCommon';

export function cadPnt2dToObject3D(oc: OpenCascadeInstance, point: gp_Pnt2d) {
	const geo = new BufferGeometry();
	const positions: number[] = [point.X(), point.Y(), 0];
	geo.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	return BaseSopOperation.createObject(geo, ObjectType.POINTS, CAD_MATERIAL[ObjectType.POINTS]);
}

export function cadPnt2dTransform(point: gp_Pnt2d, t: Vector2) {
	point.SetX(point.X() + t.x);
	point.SetY(point.Y() + t.y);
}

export function cadPnt2dClone(src: gp_Pnt2d) {
	const oc = CadLoader.oc();
	return new oc.gp_Pnt2d_3(src.X(), src.Y());
}
