import {BufferAttribute, BufferGeometry, Points, Vector3, Vector4, Line3} from 'three';
import {QuadObject} from '../QuadObject';
import {QUADTesselationParams, QuadTriangulationAttribute} from '../QuadCommon';
import {QuadPrimitive} from '../QuadPrimitive';
import {DEFAULT_MATERIALS, ObjectType} from '../../../Constant';
import {Attribute} from '../../../Attribute';
import {stringMatchMask} from '../../../../String';
import {quadInnerRadius, quadOuterRadius} from '../utils/QuadUtils';
import {prepareObject} from './QuadToObject3DCommon';
import {HalfEdgeIndices, quadHalfEdgeIndices} from '../graph/QuadGraphCommon';
import {Number4} from '../../../../../types/GlobalTypes';

const _p0 = new Vector3();
const _p1 = new Vector3();
const _center = new Vector3();
const _v4 = new Vector4();
const _v4Array: Number4 = [0, 0, 0, 0];
const _line = new Line3();
const _halfEdgeIndices: HalfEdgeIndices = {index0: 0, index1: 0};

export function quadToCenterEdgeCenterVectorAttributeName(edgeIndex: number) {
	return `${QuadTriangulationAttribute.EDGE_CENTER_VECTOR}_${edgeIndex}`;
}
export function quadToCenterEdgeNearestPointVectorAttributeName(edgeIndex: number) {
	return `${QuadTriangulationAttribute.EDGE_NEAREST_POINT_VECTOR}_${edgeIndex}`;
}

export function quadToCenter(quadObject: QuadObject, options: QUADTesselationParams) {
	const quadGeometry = quadObject.geometry;
	const quadsCount = quadGeometry.quadsCount();

	const srcIndices = quadObject.geometry.index;
	const srcPositionAttribute = quadGeometry.attributes[Attribute.POSITION];
	const srcPositions = srcPositionAttribute.array;

	const geometry = new BufferGeometry();
	const newIndices = new Array(quadsCount);
	const newPositions = new Array(quadsCount * 3);
	for (let i = 0; i < quadsCount; i++) {
		QuadPrimitive.position(quadObject, i, _center);
		_center.toArray(newPositions, i * 3);

		newIndices[i] = i;
	}

	geometry.setAttribute(Attribute.POSITION, new BufferAttribute(new Float32Array(newPositions), 3));
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
	if (options.innerRadius == true) {
		const innerRadiusValues: number[] = new Array(quadsCount);
		for (let i = 0; i < quadsCount; i++) {
			const innerRadius = quadInnerRadius(quadObject, i);
			innerRadiusValues[i] = innerRadius;
		}
		geometry.setAttribute(
			QuadTriangulationAttribute.INNER_RADIUS,
			new BufferAttribute(new Float32Array(innerRadiusValues), 1)
		);
	}
	if (options.outerRadius == true) {
		const outerRadiusValues: number[] = new Array(quadsCount);
		for (let i = 0; i < quadsCount; i++) {
			const outerRadius = quadOuterRadius(quadObject, i);
			outerRadiusValues[i] = outerRadius;
		}
		geometry.setAttribute(
			QuadTriangulationAttribute.OUTER_RADIUS,
			new BufferAttribute(new Float32Array(outerRadiusValues), 1)
		);
	}
	if (options.edgeCenterVectors == true) {
		for (let edgeIndex = 0; edgeIndex < 4; edgeIndex++) {
			const attributeName = quadToCenterEdgeCenterVectorAttributeName(edgeIndex);
			const edgeCenterVectors: number[] = new Array(quadsCount * 3).fill(-1);

			for (let i = 0; i < quadsCount; i++) {
				//
				_v4.fromArray(srcIndices, i * 4);
				_v4.toArray(_v4Array);
				quadHalfEdgeIndices(_v4Array, edgeIndex, _halfEdgeIndices);
				_p0.fromArray(srcPositions, _halfEdgeIndices.index0 * 3);
				_p1.fromArray(srcPositions, _halfEdgeIndices.index1 * 3);
				_p0.add(_p1).multiplyScalar(0.5);

				//
				QuadPrimitive.position(quadObject, i, _center);
				_p0.sub(_center);

				//
				_p0.toArray(edgeCenterVectors, i * 3);
			}
			geometry.setAttribute(attributeName, new BufferAttribute(new Float32Array(edgeCenterVectors), 3));
		}
	}
	if (options.edgeNearestPointVectors == true) {
		for (let edgeIndex = 0; edgeIndex < 4; edgeIndex++) {
			const attributeName = quadToCenterEdgeNearestPointVectorAttributeName(edgeIndex);
			const edgeNearestPointVectors: number[] = new Array(quadsCount * 3).fill(-1);

			for (let i = 0; i < quadsCount; i++) {
				//
				QuadPrimitive.position(quadObject, i, _center);

				//
				_v4.fromArray(srcIndices, i * 4);
				_v4.toArray(_v4Array);
				quadHalfEdgeIndices(_v4Array, edgeIndex, _halfEdgeIndices);
				_line.start.fromArray(srcPositions, _halfEdgeIndices.index0 * 3);
				_line.end.fromArray(srcPositions, _halfEdgeIndices.index1 * 3);
				_line.closestPointToPoint(_center, true, _p0);

				//
				_p0.sub(_center);

				//
				_p0.toArray(edgeNearestPointVectors, i * 3);
			}
			geometry.setAttribute(attributeName, new BufferAttribute(new Float32Array(edgeNearestPointVectors), 3));
		}
	}

	prepareObject(points, {shadow: false});
	return points;
}
