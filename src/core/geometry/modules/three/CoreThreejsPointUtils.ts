import {BufferGeometry, Mesh} from 'three';
import {markedAsInstance} from '../../GeometryUtils';
import {InstanceAttrib} from '../../Instancer';
import {Attribute} from '../../Attribute';
import {ThreejsPoint} from './ThreejsPoint';
const dummyMesh = new Mesh();

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
export function pointsFromBufferGeometry(geometry: BufferGeometry): ThreejsPoint[] {
	dummyMesh.geometry = geometry;
	const pointsCount = pointsCountFromBufferGeometry(geometry);
	const points: ThreejsPoint[] = new Array(pointsCount);
	for (let i = 0; i < pointsCount; i++) {
		points[i] = new ThreejsPoint(dummyMesh, i);
	}
	return points;
}
