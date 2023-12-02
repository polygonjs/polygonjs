import {BufferAttribute, BufferGeometry, Object3D, Mesh} from 'three';
import {Object3DWithGeometry} from './Group';
import {ObjectContent, CoreObjectType, isObject3D} from './ObjectContent';
import type {QuadObject} from './modules/quad/QuadObject';
import {isQuadObject} from './modules/quad/QuadCoreType';
import {InstanceAttrib} from './Instancer';

export function bufferGeometryMaxGroupEnd(geometry: BufferGeometry): number {
	const groups = geometry.groups;
	let max = -1;
	for (const group of groups) {
		const groupEnd = group.start + group.count;
		if (groupEnd > max) {
			max = groupEnd;
		}
	}
	return max;
}
export function truncateBufferGeometry(geometry: BufferGeometry, maxCount: number): void {
	const attributeNames = Object.keys(geometry.attributes);

	for (const attributeName of attributeNames) {
		const attribute = geometry.getAttribute(attributeName) as BufferAttribute;
		const originalArray = attribute.array;
		const itemSize = attribute.itemSize;
		const expectedArraySize = maxCount * itemSize;
		const newArray = originalArray.slice(0, expectedArraySize); //new Array(expectedArraySize);
		// for(let i=0;i<expectedArraySize;i++){
		// 	newArray[i]=originalArray[i];
		// }
		geometry.setAttribute(attributeName, new BufferAttribute(new Float32Array(newArray), itemSize));
	}
}

export function object3DHasGeometry(o: Object3D): o is Object3DWithGeometry {
	return (o as Mesh).geometry != null;
}
export function objectContentHasGeometry(o: ObjectContent<CoreObjectType>): o is Object3DWithGeometry | QuadObject {
	if (isQuadObject(o)) {
		return true;
	}
	if (isObject3D(o)) {
		return (o as Mesh).geometry != null;
	}
	return false;
}

export function markedAsInstance(geometry: BufferGeometry): boolean {
	return geometry.getAttribute(InstanceAttrib.POSITION) != null; //geometry.userData[IS_INSTANCE_KEY] === true;
}
