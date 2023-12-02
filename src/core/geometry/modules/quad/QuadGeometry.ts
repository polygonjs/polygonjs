import {Box3, Matrix4, Vector3, BufferAttribute} from 'three';
import {Attribute} from '../../Attribute';
import {objectCloneDeep} from '../../../ObjectUtils';

// make count non-readonly
type QuadBufferAttribute = Omit<BufferAttribute, 'count'> & {
	count: BufferAttribute['count'];
};

const _v3 = new Vector3();

export class QuadGeometry {
	public attributes: Record<string, QuadBufferAttribute> = {};
	public index: number[] = [];
	public userData: {[key: string]: any} = {};

	setAttribute(attribName: string, attribute: BufferAttribute) {
		this.attributes[attribName] = attribute;
	}

	setIndex(indices: number[]) {
		this.index = indices;
	}
	quadsCount() {
		return this.index.length / 4;
	}

	applyMatrix(matrix: Matrix4): QuadGeometry {
		const positionAttribute = this.attributes[Attribute.POSITION];
		const positionArray = positionAttribute.array;
		const pointsCount = positionArray.length / 3;
		for (let i = 0; i < pointsCount; i++) {
			_v3.fromArray(positionArray, i * 3);
			_v3.applyMatrix4(matrix);
			_v3.toArray(positionArray, i * 3);
		}

		return this;
	}
	clone() {
		const clonedGeometry = new (this.constructor as typeof QuadGeometry)();
		// point attributes
		const pointAttributeNames = Object.keys(this.attributes);
		for (const attributeName of pointAttributeNames) {
			clonedGeometry.setAttribute(attributeName, this.attributes[attributeName].clone());
		}
		clonedGeometry.setIndex([...this.index]);
		clonedGeometry.userData = objectCloneDeep(this.userData);
		// prim attributes
		// const primAttributes = QuadPrimitive.attributesFromGeometry(this);
		// if (primAttributes) {
		// 	const primAttributeNames = Object.keys(primAttributes);
		// 	for (const attributeName of primAttributeNames) {
		// 		const srcAttribute = primAttributes[attributeName];
		// 		const clonedAttribute: BasePrimitiveAttribute = {
		// 			isString: srcAttribute.isString,
		// 			array: srcAttribute.array.slice(),
		// 			itemSize: srcAttribute.itemSize,
		// 		};
		// 		QuadPrimitive.addAttributeToGeometry(clonedGeometry, attributeName, clonedAttribute);
		// 	}
		// }

		//
		return clonedGeometry;
	}
	boundingBox(target: Box3) {
		target.makeEmpty();

		const positionAttribute = this.attributes[Attribute.POSITION];
		if (!positionAttribute) {
			return;
		}
		const positions = positionAttribute.array;
		const arrayLength = positions.length;
		for (let i = 0; i < arrayLength; i += 3) {
			target.expandByPoint(_v3.fromArray(positions, i));
		}
	}
}
