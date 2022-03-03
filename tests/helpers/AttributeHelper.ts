import {InterleavedBufferAttribute} from 'three/src/core/InterleavedBufferAttribute';
import {BufferAttribute} from 'three/src/core/BufferAttribute';

export class AttributeHelper {
	static toArray(attribute: BufferAttribute | InterleavedBufferAttribute) {
		const attribArray = attribute.array;
		const numberArray: number[] = new Array(attribArray.length);
		for (let i = 0; i < attribArray.length; i++) {
			numberArray[i] = attribArray[i];
		}
		return numberArray;
	}
}
