/**
 * Extrudes quads.
 *
 *
 */
import {QuadSopNode} from './_BaseQuad';
import {Vector3} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {QuadGeometry} from '../../../core/geometry/modules/quad/QuadGeometry';
import {QuadObject} from '../../../core/geometry/modules/quad/QuadObject';
import {QuadPrimitive} from '../../../core/geometry/modules/quad/QuadPrimitive';
import {primitivesFromObject} from '../../../core/geometry/entities/primitive/CorePrimitiveUtils';
import {Attribute} from '../../../core/geometry/Attribute';
import {
	QuadPrimitivePointPositions,
	quadPrimitivePointPositions,
	QuadPrimitivePointIndices,
	quadPrimitivePointIndices,
	quadPointInset,
} from '../../../core/geometry/modules/quad/utils/QuadUtils';

const _normal = new Vector3();
const _tmp = new Vector3();
const _primitives: QuadPrimitive[] = [];

export const _indices: QuadPrimitivePointIndices = {
	i0: 0,
	i1: 0,
	i2: 0,
	i3: 0,
};
export const _positions: QuadPrimitivePointPositions = {
	p0: new Vector3(),
	p1: new Vector3(),
	p2: new Vector3(),
	p3: new Vector3(),
};
export const _insetPositions: QuadPrimitivePointPositions = {
	p0: new Vector3(),
	p1: new Vector3(),
	p2: new Vector3(),
	p3: new Vector3(),
};
const _newPositions: [Vector3, Vector3, Vector3, Vector3] = [
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
];

class QuadExtrudeSopParamsConfig extends NodeParamsConfig {
	/** @param amount */
	amount = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		rangeLocked: [false, false],
	});
	/** @param inset */
	inset = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		rangeLocked: [false, false],
	});
	/** @param output side */
	sides = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new QuadExtrudeSopParamsConfig();

export class QuadExtrudeSopNode extends QuadSopNode<QuadExtrudeSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.QUAD_EXTRUDE;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const objects = coreGroup.quadObjects();
		if (!objects) {
			this.states.error.set(`no quad objects found`);
			return;
		}
		for (const object of objects) {
			this._extrudeObject(object);
		}

		this.setQuadObjects(objects);
	}

	private _extrudeObject(quadObject: QuadObject) {
		primitivesFromObject(quadObject, _primitives);
		const originalPrimitivesCount = _primitives.length;
		const geometry: QuadGeometry = quadObject.geometry;
		const sides: boolean = this.pv.sides;

		// index
		const indices = geometry.index;
		// we add 5 new quad for each current quad
		let _newIndicesIndex = indices.length;
		indices.length += _primitives.length * 4 * (sides ? 5 : 1);

		// position
		const positionAttribute = geometry.attributes[Attribute.POSITION];
		let newPointIndex = positionAttribute.array.length / 3;
		let newIndexValue = newPointIndex;

		// update attribute array lengths
		const pointAttributeNames = Object.keys(geometry.attributes);
		const additionalPointsCount = _primitives.length * 4;
		for (const pointAttributeName of pointAttributeNames) {
			const attribute = geometry.attributes[pointAttributeName];
			const array = attribute.array;
			const additionalPointAttributeItemsCount = additionalPointsCount * attribute.itemSize;
			attribute.count += additionalPointsCount;
			const newValues: number[] = [...(array as number[])];
			newValues.length += additionalPointAttributeItemsCount;
			attribute.array = new Float32Array(newValues);
		}
		const primitiveAttributes = QuadPrimitive.attributesFromGeometry(geometry);
		const primitiveAttributeNames = primitiveAttributes ? Object.keys(primitiveAttributes) : null;
		if (primitiveAttributes && primitiveAttributeNames) {
			for (const primitiveAttributeName of primitiveAttributeNames) {
				const primitiveAttribute = primitiveAttributes[primitiveAttributeName];
				primitiveAttribute.array.length += _primitives.length;
			}
		}
		const vertexAttributes = QuadPrimitive.attributesFromGeometry(geometry);
		const vertexAttributeNames = vertexAttributes ? Object.keys(vertexAttributes) : null;
		if (vertexAttributes && vertexAttributeNames) {
			for (const vertexAttributeName of vertexAttributeNames) {
				const vertexAttribute = vertexAttributes[vertexAttributeName];
				// TODO: we currently add 4 new vertices per new primitive,
				// but that will change when we merge adjacent quads
				vertexAttribute.array.length += _primitives.length * 4;
			}
		}
		//	ensure we have the new positionArray
		const positionArray = positionAttribute.array;
		// add primitives
		let newPrimitivesCount = 0;
		for (const primitive of _primitives) {
			primitive.normal(_normal);
			const primitiveIndex = primitive.index();

			quadPrimitivePointIndices(quadObject, primitiveIndex, _indices);
			quadPrimitivePointPositions(quadObject, primitiveIndex, _positions);
			quadPointInset(_positions, this.pv.inset, _insetPositions);

			_tmp.copy(_normal).multiplyScalar(this.pv.amount);
			_newPositions[0].copy(_insetPositions.p0).add(_tmp);
			_newPositions[1].copy(_insetPositions.p1).add(_tmp);
			_newPositions[2].copy(_insetPositions.p2).add(_tmp);
			_newPositions[3].copy(_insetPositions.p3).add(_tmp);

			// TODO: set vertex attributes

			// primitive attributes
			const _setPrimitiveAttributes = (targetIndex: number) => {
				if (!(primitiveAttributes && primitiveAttributeNames)) {
					return;
				}
				for (const primitiveAttributeName of primitiveAttributeNames) {
					const primitiveAttribute = primitiveAttributes[primitiveAttributeName];
					const array = primitiveAttribute.array as number[];
					const itemSize = primitiveAttribute.itemSize;
					for (let k = 0; k < itemSize; k++) {
						const srcIndex = primitiveIndex * itemSize + k;
						const destIndex = targetIndex * itemSize + k;
						array[destIndex] = array[srcIndex];
					}
				}
			};

			// index
			// - extruded face
			const currentPrimitiveIndex = _newIndicesIndex;
			indices[_newIndicesIndex] = newIndexValue;
			indices[_newIndicesIndex + 1] = newIndexValue + 1;
			indices[_newIndicesIndex + 2] = newIndexValue + 2;
			indices[_newIndicesIndex + 3] = newIndexValue + 3;
			_setPrimitiveAttributes(originalPrimitivesCount + newPrimitivesCount);
			_newIndicesIndex += 4;
			newPrimitivesCount++;
			if (sides == true) {
				// - side face 0
				indices[_newIndicesIndex] = _indices.i0;
				indices[_newIndicesIndex + 1] = _indices.i1;
				indices[_newIndicesIndex + 2] = indices[currentPrimitiveIndex + 1];
				indices[_newIndicesIndex + 3] = indices[currentPrimitiveIndex];
				_setPrimitiveAttributes(originalPrimitivesCount + newPrimitivesCount);
				_newIndicesIndex += 4;
				newPrimitivesCount++;
				// - side face 1
				indices[_newIndicesIndex] = _indices.i1;
				indices[_newIndicesIndex + 1] = _indices.i2;
				indices[_newIndicesIndex + 2] = indices[currentPrimitiveIndex + 2];
				indices[_newIndicesIndex + 3] = indices[currentPrimitiveIndex + 1];
				_setPrimitiveAttributes(originalPrimitivesCount + newPrimitivesCount);
				_newIndicesIndex += 4;
				newPrimitivesCount++;
				// - side face 2
				indices[_newIndicesIndex] = _indices.i2;
				indices[_newIndicesIndex + 1] = _indices.i3;
				indices[_newIndicesIndex + 2] = indices[currentPrimitiveIndex + 3];
				indices[_newIndicesIndex + 3] = indices[currentPrimitiveIndex + 2];
				_setPrimitiveAttributes(originalPrimitivesCount + newPrimitivesCount);
				_newIndicesIndex += 4;
				newPrimitivesCount++;
				// - side face 3
				indices[_newIndicesIndex] = _indices.i3;
				indices[_newIndicesIndex + 1] = _indices.i0;
				indices[_newIndicesIndex + 2] = indices[currentPrimitiveIndex];
				indices[_newIndicesIndex + 3] = indices[currentPrimitiveIndex + 3];
				_setPrimitiveAttributes(originalPrimitivesCount + newPrimitivesCount);
				_newIndicesIndex += 4;
				newPrimitivesCount++;
			}

			const _pointIndex = (_i: number) => {
				switch (_i) {
					case 0:
						return _indices.i0;
					case 1:
						return _indices.i1;
					case 2:
						return _indices.i2;
					case 3:
						return _indices.i3;
				}
				return -1;
			};
			let i = 0;
			for (const newPosition of _newPositions) {
				// point attributes
				for (const pointAttributeName of pointAttributeNames) {
					if (pointAttributeName == Attribute.POSITION) {
						continue;
					}
					const attribute = geometry.attributes[pointAttributeName];
					const array = attribute.array as number[];
					const itemSize = attribute.itemSize;
					for (let k = 0; k < itemSize; k++) {
						const pointIndex = _pointIndex(i);
						const srcIndex = pointIndex * itemSize + k;
						const destIndex = newPointIndex * itemSize + k;
						array[destIndex] = array[srcIndex];
					}
				}

				// position
				newPosition.toArray(positionArray, newPointIndex * 3);
				newPointIndex++;
				i++;
			}
			newIndexValue += 4;
		}
	}
}
