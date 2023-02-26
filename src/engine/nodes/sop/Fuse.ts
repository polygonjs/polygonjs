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
import {ArrayUtils} from '../../../core/ArrayUtils';
import {isBooleanTrue} from '../../../core/Type';

const roundedPosition = new Vector3();
const vector2 = new Vector2();
const vector3 = new Vector3();
const vector4 = new Vector4();

function clearAttributes(geometry: BufferGeometry) {
	const attributeNames = Object.keys(geometry.attributes);
	for (let attributeName of attributeNames) {
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
	/** @param distance threshold */
	dist = ParamConfig.FLOAT(0.1, {
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
		return 'fuse';
	}

	static override displayedInputNames(): string[] {
		return ['points to fuse together'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const inputCoreGroup = inputCoreGroups[0];

		const newObjects: Object3D[] = [];
		for (let object of inputCoreGroup.objects()) {
			const geometry = (object as Mesh).geometry;
			this._fuseGeometry(geometry);
			this._filterObject(object);
			newObjects.push(object);
		}

		this.setObjects(newObjects);
	}

	// private _fuseCoreObject(coreObject: CoreObject) {
	// 	const object = coreObject.object();
	// 	if (!object) {
	// 		return;
	// 	}
	// 	const points = coreObject.points();

	// 	const precision = this.pv.dist;
	// 	const pointsByPosition: Map<string, CorePoint[]> = new Map();
	// 	for (let point of points) {
	// 		const position = point.position();
	// 		roundedPosition.set(
	// 			Math.round(position.x / precision),
	// 			Math.round(position.y / precision),
	// 			Math.round(position.z / precision)
	// 		);
	// 		const key = rounded_position.toArray().join('-');
	// 		MapUtils.pushOnArrayAtEntry(pointsByPosition, key, point);
	// 	}

	// 	const keptPoints: CorePoint[] = [];
	// 	pointsByPosition.forEach((points, key) => {
	// 		keptPoints.push(points[0]);
	// 	});

	// 	(object as Mesh).geometry.dispose();
	// 	if (keptPoints.length > 0) {
	// 		const objectType = objectTypeFromConstructor(object.constructor);
	// 		if (objectType) {
	// 			const builder = geometryBuilder(objectType);
	// 			if (builder) {
	// 				const geometry = builder.from_points(keptPoints);
	// 				if (geometry) {
	// 					(object as Mesh).geometry = geometry;
	// 				}
	// 			}
	// 		}
	// 		return object;
	// 	} else {
	// 		// if(object.material){ object.material.dispose() }
	// 		// if(object.parent){ object.parent.remove(object) }
	// 	}
	// }

	private _filterObject(object: Object3D) {
		const objectType = objectTypeFromConstructor(object.constructor);
		switch (objectType) {
			case ObjectType.MESH: {
				return this._filterMesh(object as Mesh);
			}
			case ObjectType.LINE_SEGMENTS: {
				return this._filterLineSegments(object as LineSegments);
			}
			case ObjectType.POINTS: {
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
		const newIndices: number[] = [];
		const indexArray = index.array as number[];
		const facesCount = indexArray.length / 3;
		for (let i = 0; i < facesCount; i++) {
			vector3.fromArray(indexArray, i * 3);
			const a = vector3.x;
			const b = vector3.y;
			const c = vector3.z;
			const isFaceSnapped = a == b || a == c || b == c;
			if (!isFaceSnapped) {
				vector3.toArray(newIndices, newIndices.length);
			}
		}
		geometry.setIndex(newIndices);

		if (newIndices.length == 0) {
			clearAttributes(geometry);
		}
		if (isBooleanTrue(this.pv.computeNormals)) {
			geometry.computeVertexNormals();
		}
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
		const newIndices = ArrayUtils.uniq(indexArray).sort((a, b) => a - b);
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
		for (let attributeName of attributeNames) {
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
