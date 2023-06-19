import { Tetrahedron,TetrahedronSphere } from "../TetCommon";
import {Vector3} from 'three'
import { TetGeometry } from "../TetGeometry";
import {getCircumCenter} from './tetCenter'

export function circumSphere(tetGeometry:TetGeometry, id0:number,id1:number,id2:number,id3:number, target:TetrahedronSphere){
	const p0 = tetGeometry.points.get(id0);
	const p1 = tetGeometry.points.get(id1);
	const p2 = tetGeometry.points.get(id2);
	const p3 = tetGeometry.points.get(id3);
	if(!(p0 && p1 && p2 && p3)){
		return;
	}
	getCircumCenter(p0.position, p1.position, p2.position, p3.position, target.center);
	target.radius = target.center.distanceTo(p0.position);
	return 
}


export function isPointInTetCircumSphere(tetrahedron:Tetrahedron, point:Vector3):boolean{
	return point.distanceTo(tetrahedron.sphere.center) <= tetrahedron.sphere.radius;
}