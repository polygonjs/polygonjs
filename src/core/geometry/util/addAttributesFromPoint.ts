import {BufferAttribute, BufferGeometry, Vector3} from 'three';
import {isString} from '../../Type';
import {BaseCorePoint} from '../entities/point/CorePoint';

export function addAttributesFromPoint(geometry: BufferGeometry, point: BaseCorePoint, attributeNames: string[]) {
	const pointsCount = geometry.getAttribute('position').count;
	for (const attributeName of attributeNames) {
		addAttributeFromPoint(geometry, point, attributeName, pointsCount);
	}
}

function addAttributeFromPoint(
	geometry: BufferGeometry,
	point: BaseCorePoint,
	attributeName: string,
	pointsCount: number
) {
	const value = point.attribValue(attributeName);

	if (!isString(value)) {
		const size = point.attribSize(attributeName);

		let values = new Array(pointsCount * size);
		switch (size) {
			case 1: {
				values.fill(value);
				break;
			}
			default: {
				for (let i = 0; i < pointsCount; i++) {
					(value as Vector3).toArray(values, i * size);
				}
			}
		}
		const attribute = new BufferAttribute(new Float32Array(values), size);
		geometry.setAttribute(attributeName, attribute);
	}
}
