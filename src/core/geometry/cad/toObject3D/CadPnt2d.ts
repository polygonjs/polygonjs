import {BufferGeometry, BufferAttribute, Vector2} from 'three';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {ObjectType} from '../../Constant';
import {cadMaterialPoint} from '../CadConstant';
import {CadLoaderSync} from '../CadLoaderSync';
import type {CadGeometryType, gp_Pnt2d} from '../CadCommon';
import {CadObject} from '../CadObject';
import {objectContentCopyProperties} from '../../ObjectContent';

export function cadPnt2dToObject3D(cadObject: CadObject<CadGeometryType.POINT_2D>) {
	const point = cadObject.cadGeometry();
	const geo = new BufferGeometry();
	const positions: number[] = [point.X(), point.Y(), 0];
	geo.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	const object = BaseSopOperation.createObject(geo, ObjectType.POINTS, cadMaterialPoint());
	objectContentCopyProperties(cadObject, object);
	return object;
}

export function cadPnt2dTransform(point: gp_Pnt2d, t: Vector2) {
	point.SetX(point.X() + t.x);
	point.SetY(point.Y() + t.y);
}

export function cadPnt2dClone(src: gp_Pnt2d) {
	const oc = CadLoaderSync.oc();
	return new oc.gp_Pnt2d_3(src.X(), src.Y());
}
