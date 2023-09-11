import {Triangle, Mesh, Intersection, Color, Vector2, Vector3, Vector4, BufferAttribute, Face} from 'three';
import {NamedFunction2, NamedFunction3, NamedFunction4} from './_Base';
import {CoreThreejsPoint} from '../../core/geometry/modules/three/CoreThreejsPoint';
const positionA = new Vector3();
const positionB = new Vector3();
const positionC = new Vector3();
const _ca = new Color();
const _cb = new Color();
const _cc = new Color();
const _v2a = new Vector2();
const _v2b = new Vector2();
const _v2c = new Vector2();
const _v3a = new Vector3();
const _v3b = new Vector3();
const _v3c = new Vector3();
const _v4a = new Vector4();
const _v4b = new Vector4();
const _v4c = new Vector4();
const _v3 = new Vector3();
const _tmpColorA = new Color();
const _tmpColorB = new Color();
const _tmpColorC = new Color();
function triangleGetInterpolatedNumber(
	point: Vector3,
	p1: Vector3,
	p2: Vector3,
	p3: Vector3,
	va: number,
	vb: number,
	vc: number
) {
	Triangle.getBarycoord(point, p1, p2, p3, _v3);

	return va * _v3.x + vb * _v3.y + vc * _v3.z;
}
function triangleGetInterpolatedColor(
	point: Vector3,
	p1: Vector3,
	p2: Vector3,
	p3: Vector3,
	va: Color,
	vb: Color,
	vc: Color,
	target: Color
) {
	Triangle.getBarycoord(point, p1, p2, p3, _v3);

	target.r = 0;
	target.g = 0;
	target.b = 0;
	_tmpColorA.copy(va).multiplyScalar(_v3.x);
	_tmpColorB.copy(vb).multiplyScalar(_v3.y);
	_tmpColorC.copy(vc).multiplyScalar(_v3.z);
	target.add(_tmpColorA).add(_tmpColorB).add(_tmpColorC);
	return target;
}
function triangleGetInterpolatedVector2(
	point: Vector3,
	p1: Vector3,
	p2: Vector3,
	p3: Vector3,
	va: Vector2,
	vb: Vector2,
	vc: Vector2,
	target: Vector2
) {
	Triangle.getBarycoord(point, p1, p2, p3, _v3);

	target.set(0, 0);
	target.addScaledVector(va, _v3.x);
	target.addScaledVector(vb, _v3.y);
	target.addScaledVector(vc, _v3.z);
	return target;
}
function triangleGetInterpolatedVector3(
	point: Vector3,
	p1: Vector3,
	p2: Vector3,
	p3: Vector3,
	va: Vector3,
	vb: Vector3,
	vc: Vector3,
	target: Vector3
) {
	Triangle.getBarycoord(point, p1, p2, p3, _v3);

	target.set(0, 0, 0);
	target.addScaledVector(va, _v3.x);
	target.addScaledVector(vb, _v3.y);
	target.addScaledVector(vc, _v3.z);
	return target;
}
function triangleGetInterpolatedVector4(
	point: Vector3,
	p1: Vector3,
	p2: Vector3,
	p3: Vector3,
	va: Vector4,
	vb: Vector4,
	vc: Vector4,
	target: Vector4
) {
	Triangle.getBarycoord(point, p1, p2, p3, _v3);

	target.set(0, 0, 0, 0);
	target.addScaledVector(va, _v3.x);
	target.addScaledVector(vb, _v3.y);
	target.addScaledVector(vc, _v3.z);
	return target;
}

function nearestFaceVertexIndex(intersection: Intersection, positionAttribute: BufferAttribute, face: Face): number {
	const intersectionPos = intersection.point;

	positionA.fromBufferAttribute(positionAttribute, face.a);
	positionB.fromBufferAttribute(positionAttribute, face.b);
	positionC.fromBufferAttribute(positionAttribute, face.c);

	const distanceA = positionA.distanceTo(intersectionPos);
	const distanceB = positionB.distanceTo(intersectionPos);
	const distanceC = positionC.distanceTo(intersectionPos);

	if (distanceA < distanceB && distanceA < distanceC) {
		return face.a;
	}
	if (distanceB < distanceA && distanceB < distanceC) {
		return face.b;
	}
	return face.c;
}
function nonInterpolatedVertexIndex(intersection: Intersection | undefined): number | void {
	if (!intersection) {
		return;
	}
	const geometry = (intersection.object as Mesh).geometry;
	if (!geometry) {
		return;
	}

	const positionAttribute = geometry.getAttribute('position') as BufferAttribute;
	if (!positionAttribute) {
		return;
	}
	const face = intersection.face;
	if (!face) {
		return;
	}
	return nearestFaceVertexIndex(intersection, positionAttribute, face);
}

//
//
// number
//
//
export class getIntersectionAttributeNumberNearest extends NamedFunction3<[Intersection | undefined, string, number]> {
	static override type() {
		return 'getIntersectionAttributeNumberNearest';
	}
	func(intersection: Intersection | undefined, attribName: string, notFoundValue: number): number {
		if (!intersection) {
			return notFoundValue;
		}
		const vertexIndex = nonInterpolatedVertexIndex(intersection);
		if (vertexIndex == null) {
			return notFoundValue;
		}
		const geometry = (intersection.object as Mesh).geometry;
		if (!geometry) {
			return notFoundValue;
		}

		const attribute = geometry.getAttribute(attribName) as BufferAttribute;
		if (!attribute) {
			return notFoundValue;
		}
		const value = attribute.array[vertexIndex];
		return value;
	}
}
export class getIntersectionAttributeNumberInterpolated extends NamedFunction3<
	[Intersection | undefined, string, number]
> {
	static override type() {
		return 'getIntersectionAttributeNumberInterpolated';
	}
	func(intersection: Intersection | undefined, attribName: string, notFoundValue: number): number {
		if (!intersection) {
			return notFoundValue;
		}
		const face = intersection.face;
		if (!face) {
			return notFoundValue;
		}
		const geometry = (intersection.object as Mesh).geometry;
		if (!geometry) {
			return notFoundValue;
		}

		const vertexIndex = nonInterpolatedVertexIndex(intersection);
		if (vertexIndex == null) {
			return notFoundValue;
		}

		const attribute = geometry.getAttribute(attribName) as BufferAttribute;
		if (!attribute) {
			return notFoundValue;
		}
		const positionAttribute = geometry.getAttribute('position') as BufferAttribute;
		if (!positionAttribute) {
			return notFoundValue;
		}
		const intersectionPos = intersection.point;
		positionA.fromBufferAttribute(positionAttribute, face.a);
		positionB.fromBufferAttribute(positionAttribute, face.b);
		positionC.fromBufferAttribute(positionAttribute, face.c);
		const va = attribute.array[face.a];
		const vb = attribute.array[face.b];
		const vc = attribute.array[face.c];

		return triangleGetInterpolatedNumber(intersectionPos, positionA, positionB, positionC, va, vb, vc);
	}
}
//
//
// Color
//
//
export class getIntersectionAttributeColorNearest extends NamedFunction4<
	[Intersection | undefined, string, Color, Color]
> {
	static override type() {
		return 'getIntersectionAttributeColorNearest';
	}
	func(intersection: Intersection | undefined, attribName: string, notFoundValue: Color, target: Color): Color {
		if (!intersection) {
			return notFoundValue;
		}
		const vertexIndex = nonInterpolatedVertexIndex(intersection);
		if (vertexIndex == null) {
			return notFoundValue;
		}
		const geometry = (intersection.object as Mesh).geometry;
		if (!geometry) {
			return notFoundValue;
		}

		const attribute = geometry.getAttribute(attribName) as BufferAttribute;
		if (!attribute) {
			return notFoundValue;
		}
		return target.fromBufferAttribute(attribute, vertexIndex);
	}
}
export class getIntersectionAttributeColorInterpolated extends NamedFunction4<
	[Intersection | undefined, string, Color, Color]
> {
	static override type() {
		return 'getIntersectionAttributeColorInterpolated';
	}
	func(intersection: Intersection | undefined, attribName: string, notFoundValue: Color, target: Color): Color {
		if (!intersection) {
			return notFoundValue;
		}
		const face = intersection.face;
		if (!face) {
			return notFoundValue;
		}
		const geometry = (intersection.object as Mesh).geometry;
		if (!geometry) {
			return notFoundValue;
		}

		const vertexIndex = nonInterpolatedVertexIndex(intersection);
		if (vertexIndex == null) {
			return notFoundValue;
		}

		const attribute = geometry.getAttribute(attribName) as BufferAttribute;
		if (!attribute) {
			return notFoundValue;
		}
		const positionAttribute = geometry.getAttribute('position') as BufferAttribute;
		if (!positionAttribute) {
			return notFoundValue;
		}
		const intersectionPos = intersection.point;
		positionA.fromBufferAttribute(positionAttribute, face.a);
		positionB.fromBufferAttribute(positionAttribute, face.b);
		positionC.fromBufferAttribute(positionAttribute, face.c);

		_ca.fromBufferAttribute(attribute, face.a);
		_cb.fromBufferAttribute(attribute, face.b);
		_cc.fromBufferAttribute(attribute, face.c);

		return triangleGetInterpolatedColor(intersectionPos, positionA, positionB, positionC, _ca, _cb, _cc, target);
	}
}
//
//
// Color
//
//
const notFoundValueStr = '';
export class getIntersectionAttributeStringNearest extends NamedFunction2<[Intersection | undefined, string]> {
	static override type() {
		return 'getIntersectionAttributeStringNearest';
	}
	func(intersection: Intersection | undefined, attribName: string): string {
		if (!intersection) {
			return notFoundValueStr;
		}
		const vertexIndex = nonInterpolatedVertexIndex(intersection);
		if (vertexIndex == null) {
			return notFoundValueStr;
		}
		const geometry = (intersection.object as Mesh).geometry;
		if (!geometry) {
			return notFoundValueStr;
		}
		const result = CoreThreejsPoint.stringAttribValue(intersection.object, vertexIndex, attribName);
		if (result == null) {
			return notFoundValueStr;
		}
		return result;
	}
}

//
//
// Vector2
//
//
export class getIntersectionAttributeVector2Nearest extends NamedFunction4<
	[Intersection | undefined, string, Vector2, Vector2]
> {
	static override type() {
		return 'getIntersectionAttributeVector2Nearest';
	}
	func(intersection: Intersection | undefined, attribName: string, notFoundValue: Vector2, target: Vector2): Vector2 {
		if (!intersection) {
			return notFoundValue;
		}
		const vertexIndex = nonInterpolatedVertexIndex(intersection);
		if (vertexIndex == null) {
			return notFoundValue;
		}
		const geometry = (intersection.object as Mesh).geometry;
		if (!geometry) {
			return notFoundValue;
		}

		const attribute = geometry.getAttribute(attribName) as BufferAttribute;
		if (!attribute) {
			return notFoundValue;
		}
		return target.fromBufferAttribute(attribute, vertexIndex);
	}
}
export class getIntersectionAttributeVector2Interpolated extends NamedFunction4<
	[Intersection | undefined, string, Vector2, Vector2]
> {
	static override type() {
		return 'getIntersectionAttributeVector2Interpolated';
	}
	func(intersection: Intersection | undefined, attribName: string, notFoundValue: Vector2, target: Vector2): Vector2 {
		if (!intersection) {
			return notFoundValue;
		}
		const face = intersection.face;
		if (!face) {
			return notFoundValue;
		}
		const geometry = (intersection.object as Mesh).geometry;
		if (!geometry) {
			return notFoundValue;
		}

		const vertexIndex = nonInterpolatedVertexIndex(intersection);
		if (vertexIndex == null) {
			return notFoundValue;
		}

		const attribute = geometry.getAttribute(attribName) as BufferAttribute;
		if (!attribute) {
			return notFoundValue;
		}
		const positionAttribute = geometry.getAttribute('position') as BufferAttribute;
		if (!positionAttribute) {
			return notFoundValue;
		}
		const intersectionPos = intersection.point;
		positionA.fromBufferAttribute(positionAttribute, face.a);
		positionB.fromBufferAttribute(positionAttribute, face.b);
		positionC.fromBufferAttribute(positionAttribute, face.c);

		_v2a.fromBufferAttribute(attribute, face.a);
		_v2b.fromBufferAttribute(attribute, face.b);
		_v2c.fromBufferAttribute(attribute, face.c);

		return triangleGetInterpolatedVector2(
			intersectionPos,
			positionA,
			positionB,
			positionC,
			_v2a,
			_v2b,
			_v2c,
			target
		);
	}
}

//
//
// Vector3
//
//
export class getIntersectionAttributeVector3Nearest extends NamedFunction4<
	[Intersection | undefined, string, Vector3, Vector3]
> {
	static override type() {
		return 'getIntersectionAttributeVector3Nearest';
	}
	func(intersection: Intersection | undefined, attribName: string, notFoundValue: Vector3, target: Vector3): Vector3 {
		if (!intersection) {
			return notFoundValue;
		}
		const vertexIndex = nonInterpolatedVertexIndex(intersection);
		if (vertexIndex == null) {
			return notFoundValue;
		}
		const geometry = (intersection.object as Mesh).geometry;
		if (!geometry) {
			return notFoundValue;
		}

		const attribute = geometry.getAttribute(attribName) as BufferAttribute;
		if (!attribute) {
			return notFoundValue;
		}
		return target.fromBufferAttribute(attribute, vertexIndex);
	}
}
export class getIntersectionAttributeVector3Interpolated extends NamedFunction4<
	[Intersection | undefined, string, Vector3, Vector3]
> {
	static override type() {
		return 'getIntersectionAttributeVector3Interpolated';
	}
	func(intersection: Intersection | undefined, attribName: string, notFoundValue: Vector3, target: Vector3): Vector3 {
		if (!intersection) {
			return notFoundValue;
		}
		const face = intersection.face;
		if (!face) {
			return notFoundValue;
		}
		const geometry = (intersection.object as Mesh).geometry;
		if (!geometry) {
			return notFoundValue;
		}

		const vertexIndex = nonInterpolatedVertexIndex(intersection);
		if (vertexIndex == null) {
			return notFoundValue;
		}

		const attribute = geometry.getAttribute(attribName) as BufferAttribute;
		if (!attribute) {
			return notFoundValue;
		}
		const positionAttribute = geometry.getAttribute('position') as BufferAttribute;
		if (!positionAttribute) {
			return notFoundValue;
		}
		const intersectionPos = intersection.point;
		positionA.fromBufferAttribute(positionAttribute, face.a);
		positionB.fromBufferAttribute(positionAttribute, face.b);
		positionC.fromBufferAttribute(positionAttribute, face.c);

		_v3a.fromBufferAttribute(attribute, face.a);
		_v3b.fromBufferAttribute(attribute, face.b);
		_v3c.fromBufferAttribute(attribute, face.c);

		return triangleGetInterpolatedVector3(
			intersectionPos,
			positionA,
			positionB,
			positionC,
			_v3a,
			_v3b,
			_v3c,
			target
		);
	}
}
//
//
// Vector4
//
//
export class getIntersectionAttributeVector4Nearest extends NamedFunction4<
	[Intersection | undefined, string, Vector4, Vector4]
> {
	static override type() {
		return 'getIntersectionAttributeVector4Nearest';
	}
	func(intersection: Intersection | undefined, attribName: string, notFoundValue: Vector4, target: Vector4): Vector4 {
		if (!intersection) {
			return notFoundValue;
		}
		const vertexIndex = nonInterpolatedVertexIndex(intersection);
		if (vertexIndex == null) {
			return notFoundValue;
		}
		const geometry = (intersection.object as Mesh).geometry;
		if (!geometry) {
			return notFoundValue;
		}

		const attribute = geometry.getAttribute(attribName) as BufferAttribute;
		if (!attribute) {
			return notFoundValue;
		}
		return target.fromBufferAttribute(attribute, vertexIndex);
	}
}
export class getIntersectionAttributeVector4Interpolated extends NamedFunction4<
	[Intersection | undefined, string, Vector4, Vector4]
> {
	static override type() {
		return 'getIntersectionAttributeVector4Interpolated';
	}
	func(intersection: Intersection | undefined, attribName: string, notFoundValue: Vector4, target: Vector4): Vector4 {
		if (!intersection) {
			return notFoundValue;
		}
		const face = intersection.face;
		if (!face) {
			return notFoundValue;
		}
		const geometry = (intersection.object as Mesh).geometry;
		if (!geometry) {
			return notFoundValue;
		}

		const vertexIndex = nonInterpolatedVertexIndex(intersection);
		if (vertexIndex == null) {
			return notFoundValue;
		}

		const attribute = geometry.getAttribute(attribName) as BufferAttribute;
		if (!attribute) {
			return notFoundValue;
		}
		const positionAttribute = geometry.getAttribute('position') as BufferAttribute;
		if (!positionAttribute) {
			return notFoundValue;
		}
		const intersectionPos = intersection.point;
		positionA.fromBufferAttribute(positionAttribute, face.a);
		positionB.fromBufferAttribute(positionAttribute, face.b);
		positionC.fromBufferAttribute(positionAttribute, face.c);

		_v4a.fromBufferAttribute(attribute, face.a);
		_v4b.fromBufferAttribute(attribute, face.b);
		_v4c.fromBufferAttribute(attribute, face.c);

		return triangleGetInterpolatedVector4(
			intersectionPos,
			positionA,
			positionB,
			positionC,
			_v4a,
			_v4b,
			_v4c,
			target
		);
	}
}
