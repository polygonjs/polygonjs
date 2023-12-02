import {
	Vector2,
	Vector3,
	Vector4,
	BufferGeometry,
	BufferAttribute,
	RGBAFormat,
	FloatType,
	DataTexture,
	NearestFilter,
	RepeatWrapping,
	Mesh,
} from 'three';
import {nearestPower2} from '../../math/_Module';
import {CoreAttribute} from '../Attribute';
import {pointsCountFromObject} from '../entities/point/CorePointUtils';

const _textureSize = new Vector2();
const _v2 = new Vector2();
const _v3 = new Vector3();
const _v4 = new Vector4();
function _vectorFromAttribSize(attribSize: number) {
	switch (attribSize) {
		case 2:
			return _v2;
		case 3:
			return _v3;
		case 4:
			return _v4;
	}
}

export enum AttribLookup {
	ID = 'attribLookupId',
	UV = 'attribLookupUv',
}

const dummyMesh = new Mesh();
export function textureFromAttributePointsCount(geometry: BufferGeometry): number {
	dummyMesh.geometry = geometry;
	return pointsCountFromObject(dummyMesh);
}

export function textureSizeFromPointsCount(geometry: BufferGeometry, target: Vector2): void {
	// const position = geometry.attributes.position;
	// if (!(position instanceof BufferAttribute)) {
	// 	console.warn('position is not a BufferAttribute');
	// 	return;
	// }
	// const pointsCount = position.count;
	const pointsCount = textureFromAttributePointsCount(geometry);

	// const autoTexturesSize = CoreParticlesAttribute.getAutoTextureSize(object);
	// CoreParticlesAttribute.getMaxTextureSize(object, _maxTexturesSize);
	// CoreParticlesAttribute.getTextureSize(object, _texturesSize);

	// // get texture size
	// if (isBooleanTrue(autoTexturesSize)) {
	const nearestPowerOfTwo = nearestPower2(Math.sqrt(pointsCount));
	target.x = nearestPowerOfTwo; //Math.min(nearestPowerOfTwo, _maxTexturesSize.x);
	target.y = nearestPowerOfTwo; //Math.min(nearestPowerOfTwo, _maxTexturesSize.y);
	// const pointsCount = position.count;
	// return nearestPower2(Math.sqrt(pointsCount));
	// return Math.ceil(Math.sqrt(pointsCount));
}
export function textureFromAttributesMissingAttributes(geometry: BufferGeometry, attribNames: string[]): string[] {
	const missingAttributes: string[] = [];

	for (const attribName of attribNames) {
		const attributeName = CoreAttribute.remapName(attribName);
		const attribute = geometry.getAttribute(attributeName) as BufferAttribute;
		if (!attribute) {
			missingAttributes.push(attribName);
		}
	}
	return missingAttributes;
}
export function textureFromAttributesTotalAttribSizes(geometry: BufferGeometry, attribNames: string[]) {
	let currentSize = 0;

	for (const attribName of attribNames) {
		const attributeName = CoreAttribute.remapName(attribName);
		const attribute = geometry.getAttribute(attributeName) as BufferAttribute;
		if (attribute) {
			currentSize += attribute.itemSize;
		}
	}
	return currentSize;
}

export function textureFromAttributes(geometry: BufferGeometry, attribNames: string[]) {
	textureSizeFromPointsCount(geometry, _textureSize);
	const pointsCount = textureFromAttributePointsCount(geometry);

	const width = _textureSize.x;
	const height = _textureSize.y;

	const size = width * height * 4;
	const pixelBuffer = new Float32Array(size);

	let currentIndex = 0;
	for (let attribName of attribNames) {
		attribName = CoreAttribute.remapName(attribName);
		const attribute = geometry.getAttribute(attribName) as BufferAttribute;

		if (attribute) {
			const attribSize = attribute.itemSize;
			const attribArray = attribute.array;
			if (attribSize == 1) {
				for (let i = 0; i < pointsCount; i++) {
					pixelBuffer[i * 4 + currentIndex] = attribArray[i];
				}
			} else {
				const vector = _vectorFromAttribSize(attribSize);
				if (!vector) {
					return;
				}
				for (let i = 0; i < pointsCount; i++) {
					vector.fromArray(attribArray, i * attribSize);
					vector.toArray(pixelBuffer, i * 4 + currentIndex);
				}
			}
			currentIndex += attribSize;
		}
	}

	const texture = new DataTexture(pixelBuffer, width, height, RGBAFormat, FloatType);
	texture.minFilter = texture.magFilter = NearestFilter;
	texture.wrapS = texture.wrapT = RepeatWrapping;
	texture.needsUpdate = true;
	return texture;
}

export function textureFromAttribLookupUv(geometry: BufferGeometry) {
	const attribSize = 2;
	const pointsCount = textureFromAttributePointsCount(geometry);
	textureSizeFromPointsCount(geometry, _textureSize);
	const uvSize = 2;
	const values = new Array(pointsCount * uvSize);

	for (let pointIndex = 0; pointIndex < pointsCount; pointIndex++) {
		_v2.x = pointIndex % _textureSize.x;
		_v2.y = Math.floor(pointIndex / _textureSize.x);
		_v2.addScalar(0.5);
		_v2.divide(_textureSize);
		_v2.toArray(values, pointIndex * uvSize);
	}
	const uvArray = new Float32Array(values);
	geometry.setAttribute(AttribLookup.UV, new BufferAttribute(uvArray, attribSize));
}
export function textureFromAttribLookupId(geometry: BufferGeometry) {
	const pointsCount = textureFromAttributePointsCount(geometry);
	const idSize = 1;
	const values = new Array(pointsCount * idSize);
	for (let pointIndex = 0; pointIndex < pointsCount; pointIndex++) {
		values[pointIndex] = pointIndex;
	}
	const idArray = new Float32Array(values);
	geometry.setAttribute(AttribLookup.ID, new BufferAttribute(idArray, idSize));
}
