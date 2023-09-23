/**
 * Snaps points onto one another.
 *
 * @remarks
 * Based on a distance threshold.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BufferAttribute, BufferGeometry, Object3D, Vector2, Vector3, Vector4, Mesh, Points, LineSegments} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {MapUtils} from '../../../core/MapUtils';
import {ObjectType, objectTypeFromConstructor} from '../../../core/geometry/Constant';
import {arrayUniq} from '../../../core/ArrayUtils';
import {mergeFaces} from '../../../core/geometry/operation/Fuse';
import {CoreMask} from '../../../core/geometry/Mask';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const roundedPosition = new Vector3();
const vector2 = new Vector2();
const vector3 = new Vector3();
const vector4 = new Vector4();

function clearAttributes(geometry: BufferGeometry) {
	const attributeNames = Object.keys(geometry.attributes);
	for (const attributeName of attributeNames) {
		const attribute = geometry.getAttribute(attributeName);
		if (attribute instanceof BufferAttribute) {
			const newAttribValues: number[] = [];
			geometry.setAttribute(
				attributeName,
				new BufferAttribute(new Float32Array(newAttribValues), attribute.itemSize)
			);
		}
	}
}

class FuseSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING('', {
		objectMask: true,
	});
	/** @param distance threshold */
	dist = ParamConfig.FLOAT(0.001, {
		range: [0, 1],
		rangeLocked: [true, false],
		step: 0.001,
	});
	/** @param recompute normals */
	computeNormals = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new FuseSopParamsConfig();

export class FuseSopNode extends TypedSopNode<FuseSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.FUSE;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const inputCoreGroup = inputCoreGroups[0];

		const selectedObjects = CoreMask.filterThreejsObjects(inputCoreGroup, this.pv);

		for (const object of selectedObjects) {
			this._filterObject(object);
		}
		this.setCoreGroup(inputCoreGroup);
	}

	private _filterObject(object: Object3D) {
		const objectType = objectTypeFromConstructor(object.constructor);
		switch (objectType) {
			case ObjectType.MESH: {
				return this._filterMesh(object as Mesh);
			}
			case ObjectType.LINE_SEGMENTS: {
				this._fuseGeometry((object as Mesh).geometry);
				return this._filterLineSegments(object as LineSegments);
			}
			case ObjectType.POINTS: {
				this._fuseGeometry((object as Mesh).geometry);
				return this._filterPoints(object as Points);
			}
		}
	}

	private _filterMesh(object: Mesh) {
		const geometry = object.geometry;
		const index = geometry.getIndex();
		if (!index) {
			return;
		}
		mergeFaces(geometry, this.pv.dist);
	}
	private _filterLineSegments(object: LineSegments) {
		const geometry = object.geometry;
		const index = geometry.getIndex();
		if (!index) {
			return;
		}
		const newIndices: number[] = [];
		const indexArray = index.array as number[];
		const segmentsCount = indexArray.length / 2;
		for (let i = 0; i < segmentsCount; i++) {
			vector2.fromArray(indexArray, i * 2);
			const a = vector2.x;
			const b = vector2.y;
			const segmentSnapped = a == b;
			if (!segmentSnapped) {
				vector2.toArray(newIndices, newIndices.length);
			}
		}
		geometry.setIndex(newIndices);
		if (newIndices.length == 0) {
			clearAttributes(geometry);
		}
	}

	private _filterPoints(object: Points) {
		const geometry = object.geometry;
		const index = geometry.getIndex();
		if (!index) {
			return;
		}
		const indexArray = index.array as number[];
		const newIndices:number[] =[]
		arrayUniq(indexArray,newIndices)
		newIndices.sort((a, b) => a - b);
		geometry.setIndex(newIndices);
		if (newIndices.length == 0) {
			clearAttributes(geometry);
		}
	}

	private _fuseGeometry(geometry: BufferGeometry) {
		const index = geometry.getIndex();
		if (!index) {
			return;
		}
		const indexArray = index.array as number[];
		const precision = this.pv.dist;
		const position = geometry.getAttribute('position') as BufferAttribute;
		const pointsCount = position.array.length / 3;

		function roundedPos(index: number, target: Vector3) {
			target.fromBufferAttribute(position, index);

			if (precision > 0) {
				target.x = Math.round(target.x / precision) * precision;
				target.y = Math.round(target.y / precision) * precision;
				target.z = Math.round(target.z / precision) * precision;
			}
		}

		const indicesByPosKey: Map<string, Array<number>> = new Map();
		const posKeyByIndex: Map<number, string> = new Map();
		for (let index = 0; index < pointsCount; index++) {
			roundedPos(index, roundedPosition);
			const posKey = `${roundedPosition.x},${roundedPosition.y},${roundedPosition.z}`;
			MapUtils.pushOnArrayAtEntry(indicesByPosKey, posKey, index);
			posKeyByIndex.set(index, posKey);
		}

		indicesByPosKey.forEach((indices, posKey) => {
			indices.sort((a, b) => a - b);
		});

		const newIndicesAfterGapsCreated: Map<number, number> = new Map();
		let nextAvailableIndex = 0;
		for (let index = 0; index < pointsCount; index++) {
			const posKey = posKeyByIndex.get(index)!;
			const indices = indicesByPosKey.get(posKey)!;
			if (indices.length <= 1 || indices[0] == index) {
				newIndicesAfterGapsCreated.set(index, nextAvailableIndex);
				nextAvailableIndex++;
			}
		}

		const newIndexByOldIndex: Map<number, number> = new Map();
		indicesByPosKey.forEach((indices, posKey) => {
			const firstIndex = indices[0];
			for (let i = 1; i < indices.length; i++) {
				const index = indices[i];
				newIndexByOldIndex.set(index, firstIndex);
			}
		});

		const newIndices: number[] = [];
		const newIndexByOldIndexAfterAssignment: Map<number, number> = new Map();
		for (let i = 0; i < indexArray.length; i++) {
			const index = indexArray[i];
			const targetIndex = newIndexByOldIndex.get(index);
			// const offsetIndex = newIndicesAfterGapsCreated.get(index);
			const targetOffset =
				targetIndex != null
					? newIndicesAfterGapsCreated.get(targetIndex)
					: newIndicesAfterGapsCreated.get(index);
			// const offset2 = offsetIndex != null ? newIndexByOldIndex.get(offsetIndex) : undefined;
			let newIndex = index;
			if (targetOffset != null) {
				newIndex = targetOffset;
			} else {
				if (targetIndex != null) {
					newIndex = targetIndex;
				}
			}
			newIndices.push(newIndex);
			newIndexByOldIndexAfterAssignment.set(index, newIndex);
		}

		const attributeNames = Object.keys(geometry.attributes);
		for (const attributeName of attributeNames) {
			const attribute = geometry.getAttribute(attributeName);
			if (attribute instanceof BufferAttribute) {
				const itemSize = attribute.itemSize;
				const newAttribValues: number[] = [];

				function getVector() {
					if (itemSize == 2) {
						return vector2;
					}
					if (itemSize == 3) {
						return vector3;
					}
					if (itemSize == 4) {
						return vector4;
					}
				}
				const vector = getVector();

				for (let i = 0; i < pointsCount; i++) {
					let index = newIndexByOldIndexAfterAssignment.get(i);
					if (index == null) {
						index = i;
					}
					if (vector) {
						vector.fromBufferAttribute(attribute, i);
						vector.toArray(newAttribValues, index * itemSize);
					} else {
						const currentVal = attribute.array[i];
						newAttribValues[index] = currentVal;
					}
				}

				geometry.setAttribute(attributeName, new BufferAttribute(new Float32Array(newAttribValues), itemSize));
			}
		}
		geometry.setIndex(newIndices);
	}
}
