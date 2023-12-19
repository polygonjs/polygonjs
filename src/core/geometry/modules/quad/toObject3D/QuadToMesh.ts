import {BufferGeometry, Mesh, Vector4, Vector3, BufferAttribute} from 'three';
import {QUADTesselationParams} from '../QuadCommon';
import {QuadObject} from '../QuadObject';
import {ObjectType} from '../../../Constant';
import {Attribute} from '../../../Attribute';
import {DEFAULT_MATERIALS} from '../../../Constant';
import {stringMatchMask} from '../../../../String';
import {QuadPrimitive} from '../QuadPrimitive';
import {ThreejsPrimitiveTriangle} from '../../three/ThreejsPrimitiveTriangle';
import {prepareObject} from './QuadToObject3DCommon';

const _v4 = new Vector4();
const _p0 = new Vector3();
const _p1 = new Vector3();
const _p2 = new Vector3();
const _p3 = new Vector3();

export function quadToMesh(quadObject: QuadObject, options: QUADTesselationParams) {
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
	const normalAttribute = geometry.attributes[Attribute.NORMAL];
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
