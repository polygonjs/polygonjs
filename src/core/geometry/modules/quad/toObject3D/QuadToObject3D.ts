import {Object3D, Mesh, LineSegments, BufferGeometry, Vector3, Vector4, BufferAttribute, Points} from 'three';
import {ThreejsPrimitiveTriangle} from '../../three/ThreejsPrimitiveTriangle';
import {QuadObject} from '../QuadObject';
import {QUADTesselationParams, QuadTriangulationAttribute} from '../QuadCommon';
import {Attribute} from '../../../Attribute';
import {DEFAULT_MATERIALS} from '../../../Constant';
import {ObjectType} from '../../../Constant';
import {QuadPrimitive} from '../QuadPrimitive';
import {quadInnerRadius, quadOuterRadius} from '../utils/QuadUtils';

const _v4 = new Vector4();
const _p0 = new Vector3();
const _p1 = new Vector3();
const _p2 = new Vector3();
const _p3 = new Vector3();
const _center = new Vector3();

function quadToMesh(quadObject: QuadObject) {
	const quadGeometry = quadObject.geometry;
	const quadsCount = quadGeometry.quadsCount();
	const geometry = new BufferGeometry();
	const mesh = new Mesh(geometry, DEFAULT_MATERIALS[ObjectType.MESH]);

	// indices
	const indices = quadGeometry.index;
	const newIndices = new Array(quadsCount * 6);
	for (let i = 0; i < quadsCount; i++) {
		_v4.fromArray(indices, i * 4);
		newIndices[i * 6 + 0] = _v4.x;
		newIndices[i * 6 + 1] = _v4.y;
		newIndices[i * 6 + 2] = _v4.z;
		newIndices[i * 6 + 3] = _v4.x;
		newIndices[i * 6 + 4] = _v4.z;
		newIndices[i * 6 + 5] = _v4.w;
	}
	geometry.setIndex(newIndices);

	// point attributes
	const pointAttributeNames = Object.keys(quadGeometry.attributes);
	for (const attribName of pointAttributeNames) {
		const values = quadGeometry.attributes[attribName].array;
		geometry.setAttribute(attribName, new BufferAttribute(new Float32Array(values), 3));
	}

	// update normals if not provided
	const normalAttribute = quadGeometry.attributes[Attribute.NORMAL];
	if (!normalAttribute) {
		geometry.computeVertexNormals();
	}

	// primitive attributes
	const primitiveAttributes = QuadPrimitive.attributesFromGeometry(quadGeometry);
	if (primitiveAttributes) {
		const primitiveAttributeNames = Object.keys(primitiveAttributes);
		for (const primitiveAttributeName of primitiveAttributeNames) {
			const srcAttribute = primitiveAttributes[primitiveAttributeName];
			const destPrimitivesCount = quadsCount * 2;
			const destAttribute = {
				itemSize: srcAttribute.itemSize,
				isString: srcAttribute.isString,
				array: new Array(destPrimitivesCount * srcAttribute.itemSize),
			};
			ThreejsPrimitiveTriangle.addAttribute(mesh, primitiveAttributeName, destAttribute);
			const srcArray = srcAttribute.array;
			const destArray = destAttribute.array;
			const srcArraySize = srcArray.length;
			let j = 0;
			for (let i = 0; i < srcArraySize; i++) {
				// 1 quad -> 2 triangles
				destArray[j] = srcArray[i];
				destArray[j + 1] = srcArray[i];

				j += 2;
			}
		}
	}

	return mesh;
}
function quadToLine(quadObject: QuadObject) {
	const quadGeometry = quadObject.geometry;
	const quadsCount = quadGeometry.quadsCount();
	const indices = quadGeometry.index;
	const srcPositions = quadGeometry.attributes.position.array;

	const newIndices = new Array();
	const geometry = new BufferGeometry();
	const edges = new Map<number, number>();

	const addEdge = (a: number, b: number) => {
		if (edges.get(a) == b || edges.get(b) == a) {
			return;
		}
		edges.set(a, b);
		edges.set(b, a);
		newIndices.push(a, b);
	};

	for (let i = 0; i < quadsCount; i++) {
		_v4.fromArray(indices, i * 4);
		addEdge(_v4.x, _v4.y);
		addEdge(_v4.y, _v4.z);
		addEdge(_v4.z, _v4.w);
		addEdge(_v4.w, _v4.x);
	}

	const positions = [...(srcPositions as number[])];
	geometry.setAttribute(Attribute.POSITION, new BufferAttribute(new Float32Array(positions), 3));
	geometry.setIndex(newIndices);
	return new LineSegments(geometry, DEFAULT_MATERIALS[ObjectType.LINE_SEGMENTS]);
}
function quadToCenter(quadObject: QuadObject, options: QUADTesselationParams) {
	const quadGeometry = quadObject.geometry;
	const quadsCount = quadGeometry.quadsCount();
	const indices = quadGeometry.index;
	const srcPositions = quadGeometry.attributes.position.array;

	const geometry = new BufferGeometry();
	const newIndices = new Array(quadsCount);
	const positions = new Array(quadsCount * 3);
	for (let i = 0; i < quadsCount; i++) {
		_v4.fromArray(indices, i * 4);
		_p0.fromArray(srcPositions, _v4.x * 3);
		_p1.fromArray(srcPositions, _v4.y * 3);
		_p2.fromArray(srcPositions, _v4.z * 3);
		_p3.fromArray(srcPositions, _v4.w * 3);
		_center.copy(_p0).add(_p1).add(_p2).add(_p3).multiplyScalar(0.25);
		_center.toArray(positions, i * 3);

		newIndices[i] = i;
	}

	geometry.setAttribute(Attribute.POSITION, new BufferAttribute(new Float32Array(positions), 3));
	geometry.setIndex(newIndices);
	const points = new Points(geometry, DEFAULT_MATERIALS[ObjectType.POINTS]);

	// copy quad primitive attributes to new point attributes
	const primitiveAttributes = QuadPrimitive.attributesFromGeometry(quadGeometry);
	if (primitiveAttributes) {
		const primitiveAttributeNames = Object.keys(primitiveAttributes);
		for (const primitiveAttributeName of primitiveAttributeNames) {
			const srcAttribute = primitiveAttributes[primitiveAttributeName];
			if (srcAttribute.isString == false) {
				const destArray: number[] = [...(srcAttribute.array as number[])];
				const destAttribute = new BufferAttribute(new Float32Array(destArray), srcAttribute.itemSize);
				geometry.setAttribute(primitiveAttributeName, destAttribute);
			}
		}
	}
	if (options.innerRadius) {
		const innerRadiusValues = new Array(quadsCount);
		for (let i = 0; i < quadsCount; i++) {
			const innerRadius = quadInnerRadius(quadObject, i);
			innerRadiusValues[i] = innerRadius;
		}
		geometry.setAttribute(
			QuadTriangulationAttribute.INNER_RADIUS,
			new BufferAttribute(new Float32Array(innerRadiusValues), 1)
		);
	}
	if (options.outerRadius) {
		const outerRadiusValues = new Array(quadsCount);
		for (let i = 0; i < quadsCount; i++) {
			const outerRadius = quadOuterRadius(quadObject, i);
			outerRadiusValues[i] = outerRadius;
		}
		geometry.setAttribute(
			QuadTriangulationAttribute.OUTER_RADIUS,
			new BufferAttribute(new Float32Array(outerRadiusValues), 1)
		);
	}
	return points;
}

export function quadToObject3D(quadObject: QuadObject, options: QUADTesselationParams): Object3D[] | undefined {
	const objects: Object3D[] = [];
	if (options.triangles) {
		objects.push(quadToMesh(quadObject));
	}
	if (options.wireframe) {
		objects.push(quadToLine(quadObject));
	}
	if (options.center) {
		objects.push(quadToCenter(quadObject, options));
	}
	return objects;
}
