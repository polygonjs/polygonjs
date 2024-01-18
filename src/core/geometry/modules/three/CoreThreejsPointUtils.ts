import {BufferGeometry} from 'three';
import {markedAsInstance} from '../../GeometryUtils';
import {InstanceAttrib} from '../../Instancer';
import {Attribute} from '../../Attribute';
import {ThreejsPoint} from './ThreejsPoint';
import {Object3DWithGeometry} from '../../Group';

export function positionAttributeNameFromBufferGeometry(geometry: BufferGeometry) {
	return markedAsInstance(geometry) ? InstanceAttrib.POSITION : Attribute.POSITION;
}
export function pointsCountFromBufferGeometry(geometry: BufferGeometry): number {
	const attribName = positionAttributeNameFromBufferGeometry(geometry);
	if (!attribName) {
		return 0;
	}
	const positionAttribute = geometry.getAttribute(attribName);
	if (!positionAttribute) {
		return 0;
	}
	return positionAttribute.count;
}

// using dummy object is dangerous, because when used multiple times,
// the objects receives multiple geometries,
// and on further calls, the first points then look up the incorrect geometry
// export function pointsFromBufferGeometry(geometry: BufferGeometry, object): ThreejsPoint[] {
// 	dummyMesh.geometry = geometry;
// 	const pointsCount = pointsCountFromBufferGeometry(geometry);
// 	const points: ThreejsPoint[] = new Array(pointsCount);
// 	for (let i = 0; i < pointsCount; i++) {
// 		points[i] = new ThreejsPoint(dummyMesh, i);
// 	}
// 	return points;
// }
export function pointsFromThreejsObject(object: Object3DWithGeometry): ThreejsPoint[] {
	const pointsCount = pointsCountFromBufferGeometry(object.geometry);
	const points: ThreejsPoint[] = new Array(pointsCount);
	for (let i = 0; i < pointsCount; i++) {
		points[i] = new ThreejsPoint(object, i);
	}
	return points;
}
