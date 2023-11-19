import {
	Object3D,
	Color,
	LineBasicMaterial,
	Mesh,
	LineSegments,
	BufferGeometry,
	Vector3,
	Vector4,
	BufferAttribute,
	Points,
} from 'three';
import {ThreejsPrimitiveTriangle} from '../../three/ThreejsPrimitiveTriangle';
import {QuadObject} from '../QuadObject';
import {QUADTesselationParams, QuadTriangulationAttribute} from '../QuadCommon';
import {Attribute} from '../../../Attribute';
import {DEFAULT_MATERIALS} from '../../../Constant';
import {ObjectType} from '../../../Constant';
import {QuadPrimitive} from '../QuadPrimitive';
import {quadInnerRadius, quadOuterRadius} from '../utils/QuadUtils';
import {stringMatchMask} from '../../../../String';

// const _v3 = new Vector3();
const _v4 = new Vector4();
const _p0 = new Vector3();
const _p1 = new Vector3();
const _p2 = new Vector3();
const _p3 = new Vector3();
const _center = new Vector3();

interface PrepareObjectOptions {
	shadow: boolean;
}
function prepareObject(object3D: Object3D, options: PrepareObjectOptions): void {
	object3D.matrixAutoUpdate = false;
	object3D.updateMatrix();
	object3D.castShadow = options.shadow;
	object3D.receiveShadow = options.shadow;
}

const _lineMaterialByColorStyle: Map<string, LineBasicMaterial> = new Map();
function _createOrFindLineMaterial(color: Color) {
	let material = _lineMaterialByColorStyle.get(color.getStyle());
	if (!material) {
		material = new LineBasicMaterial({
			color,
			linewidth: 1,
		});
		_lineMaterialByColorStyle.set(color.getStyle(), material);
	}
	return material;
}

function quadToMesh(quadObject: QuadObject, options: QUADTesselationParams) {
	const quadGeometry = quadObject.geometry;
	const quadsCount = quadGeometry.quadsCount();
	const geometry = new BufferGeometry();
	const mesh = new Mesh(geometry, DEFAULT_MATERIALS[ObjectType.MESH]);

	// indices and positions
	const srcPositions = quadGeometry.attributes[Attribute.POSITION].array;
	const indices = quadGeometry.index;
	const newIndices = new Array(quadsCount * 6);
	if (options.splitQuads) {
		const newPositions: number[] = [];
		for (let i = 0; i < quadsCount; i++) {
			_v4.fromArray(indices, i * 4);

			// new positions
			_p0.fromArray(srcPositions, _v4.x * 3);
			_p1.fromArray(srcPositions, _v4.y * 3);
			_p2.fromArray(srcPositions, _v4.z * 3);
			_p3.fromArray(srcPositions, _v4.w * 3);
			newPositions.push(_p0.x, _p0.y, _p0.z);
			newPositions.push(_p1.x, _p1.y, _p1.z);
			newPositions.push(_p2.x, _p2.y, _p2.z);
			newPositions.push(_p3.x, _p3.y, _p3.z);

			// index
			const i6 = i * 6;
			const i4 = i * 4;
			newIndices[i6 + 0] = i4 + 0;
			newIndices[i6 + 1] = i4 + 1;
			newIndices[i6 + 2] = i4 + 2;
			newIndices[i6 + 3] = i4 + 0;
			newIndices[i6 + 4] = i4 + 2;
			newIndices[i6 + 5] = i4 + 3;
		}
		geometry.setAttribute(Attribute.POSITION, new BufferAttribute(new Float32Array(newPositions), 3));
	} else {
		for (let i = 0; i < quadsCount; i++) {
			_v4.fromArray(indices, i * 4);
			const i6 = i * 6;
			newIndices[i6 + 0] = _v4.x;
			newIndices[i6 + 1] = _v4.y;
			newIndices[i6 + 2] = _v4.z;
			newIndices[i6 + 3] = _v4.x;
			newIndices[i6 + 4] = _v4.z;
			newIndices[i6 + 5] = _v4.w;
		}
		geometry.setAttribute(Attribute.POSITION, new BufferAttribute(new Float32Array(srcPositions), 3));
	}
	geometry.setIndex(newIndices);

	// point attributes (except position)
	const pointAttributeNames = Object.keys(quadGeometry.attributes).filter(
		(attributeName) =>
			stringMatchMask(attributeName, options.pointAttributes) && attributeName != Attribute.POSITION
	);
	for (const attribName of pointAttributeNames) {
		const attribute = quadGeometry.attributes[attribName];
		const values = attribute.array;
		geometry.setAttribute(attribName, new BufferAttribute(new Float32Array(values), attribute.itemSize));
	}

	// update normals if not provided
	const normalAttribute = quadGeometry.attributes[Attribute.NORMAL];
	if (!normalAttribute) {
		geometry.computeVertexNormals();
	}

	// primitive attributes
	const primitiveAttributes = QuadPrimitive.attributesFromGeometry(quadGeometry);
	if (primitiveAttributes) {
		const primitiveAttributeNames = Object.keys(primitiveAttributes).filter((attributeName) =>
			stringMatchMask(attributeName, options.primitiveAttributes)
		);
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

	prepareObject(mesh, {shadow: true});
	return mesh;
}
function quadToLine(quadObject: QuadObject, options: QUADTesselationParams) {
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
	const material = _createOrFindLineMaterial(options.wireframeColor);
	const lineSegments = new LineSegments(geometry, material);
	prepareObject(lineSegments, {shadow: false});
	return lineSegments;
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
		const primitiveAttributeNames = Object.keys(primitiveAttributes).filter((attributeName) =>
			stringMatchMask(attributeName, options.primitiveAttributes)
		);
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
	prepareObject(points, {shadow: false});
	return points;
}

export function quadToObject3D(quadObject: QuadObject, options: QUADTesselationParams): Object3D[] | undefined {
	const objects: Object3D[] = [];
	if (options.triangles) {
		objects.push(quadToMesh(quadObject, options));
	}
	if (options.wireframe) {
		objects.push(quadToLine(quadObject, options));
	}
	if (options.center) {
		objects.push(quadToCenter(quadObject, options));
	}
	return objects;
}
