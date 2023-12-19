import {BufferAttribute, BufferGeometry, Points, Vector3} from 'three';
import {QuadObject} from '../QuadObject';
import {QUADTesselationParams, QuadTriangulationAttribute} from '../QuadCommon';
import {QuadPrimitive} from '../QuadPrimitive';
import {DEFAULT_MATERIALS, ObjectType} from '../../../Constant';
import {Attribute} from '../../../Attribute';
import {stringMatchMask} from '../../../../String';
import {quadInnerRadius, quadOuterRadius} from '../utils/QuadUtils';
import {prepareObject} from './QuadToObject3DCommon';

const _center = new Vector3();

export function quadToCenter(quadObject: QuadObject, options: QUADTesselationParams) {
	const quadGeometry = quadObject.geometry;
	const quadsCount = quadGeometry.quadsCount();

	const geometry = new BufferGeometry();
	const newIndices = new Array(quadsCount);
	const positions = new Array(quadsCount * 3);
	for (let i = 0; i < quadsCount; i++) {
		QuadPrimitive.position(quadObject, i, _center);
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
