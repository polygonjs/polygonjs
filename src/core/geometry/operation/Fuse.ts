import {BufferGeometry, BufferAttribute, Vector2, Vector3, Vector4} from 'three';
import {addToSetAtEntry} from '../../MapUtils';
import {triangleGraphFromGeometry} from '../modules/three/graph/triangle/TriangleGraphUtils';
import {setToArray} from '../../SetUtils';

const tmpV2 = new Vector2();
const tmpV3 = new Vector3();
const tmpV4 = new Vector4();

class FusePosition {
	public readonly originalPosition: Vector3 = new Vector3();
	public readonly snappedPosition: Vector3 = new Vector3();
	public readonly snappedKey: string;
	constructor(public readonly positionAttribute: BufferAttribute, public readonly index: number, tolerance: number) {
		this.originalPosition.fromBufferAttribute(positionAttribute, this.index);
		roundedPos(positionAttribute, this.index, this.snappedPosition, tolerance);
		this.snappedKey = `${this.snappedPosition.x}:${this.snappedPosition.y}:${this.snappedPosition.z}`;
	}
	addAttribValue(geometry: BufferGeometry, attribName: string, targetArray: number[]) {
		const attribute = geometry.getAttribute(attribName) as BufferAttribute;
		switch (attribute.itemSize) {
			case 1: {
				const val = attribute.getX(this.index);
				targetArray.push(val);
				break;
			}
			case 2: {
				tmpV2.fromBufferAttribute(attribute, this.index);
				tmpV2.toArray(targetArray, targetArray.length);
				break;
			}
			case 3: {
				tmpV3.fromBufferAttribute(attribute, this.index);
				tmpV3.toArray(targetArray, targetArray.length);
				break;
			}
			case 4: {
				tmpV4.fromBufferAttribute(attribute, this.index);
				tmpV4.toArray(targetArray, targetArray.length);
				break;
			}
		}
	}
}

class FuseFace {
	constructor(public a: FusePosition, public b: FusePosition, public c: FusePosition) {}
}

function averagePosition(positions: Set<FusePosition>, target: Vector3) {
	target.set(0, 0, 0);
	positions.forEach((position) => {
		target.add(position.originalPosition);
	});
	target.divideScalar(positions.size);
}

function roundedPos(position: BufferAttribute, index: number, target: Vector3, tolerance: number) {
	target.fromBufferAttribute(position, index);

	if (tolerance > 0) {
		target.x = Math.round(target.x / tolerance) * tolerance;
		target.y = Math.round(target.y / tolerance) * tolerance;
		target.z = Math.round(target.z / tolerance) * tolerance;
	}
}
function isFaceCollapsed(face: FuseFace): boolean {
	return (
		face.a.snappedKey == face.b.snappedKey ||
		face.a.snappedKey == face.c.snappedKey ||
		face.b.snappedKey == face.c.snappedKey
	);
}
const tmpAttribute: BufferAttribute = new BufferAttribute(new Float32Array(0), 0);
const _positions: [FusePosition, FusePosition, FusePosition] = [
	new FusePosition(tmpAttribute, 0, 0.1),
	new FusePosition(tmpAttribute, 0, 0.1),
	new FusePosition(tmpAttribute, 0, 0.1),
];

export function mergeFacesWithUnsharedEdges(geometry: BufferGeometry, tolerance: number) {
	function getUnsharedPointAndFaceIndices(
		geometry: BufferGeometry,
		pointIndices: number[]
		// , faceIndices: number[]
	) {
		const graph = triangleGraphFromGeometry(geometry)!;
		const edgeIds: string[] = [];
		graph.edgeIds(edgeIds);
		const unsharedPointIndicesSet: Set<number> = new Set();
		const unsharedFaceIndicesSet: Set<number> = new Set();
		for (const edgeId of edgeIds) {
			const edge = graph.edge(edgeId)!;
			// if (!edge) continue;
			if (edge.triangleIds.length == 1) {
				unsharedPointIndicesSet.add(edge.pointIdPair.id0);
				unsharedPointIndicesSet.add(edge.pointIdPair.id1);
				unsharedFaceIndicesSet.add(edge.triangleIds[0]);
			}
		}
		setToArray(unsharedPointIndicesSet, pointIndices);
		// setToArray(unsharedFaceIndicesSet, faceIndices);
	}
	const index = geometry.getIndex();
	if (!index) {
		return;
	}

	const fusablePointIndices: number[] = [];
	// const fusableFaceIndices: number[] = [];
	getUnsharedPointAndFaceIndices(geometry, fusablePointIndices);

	const indexArray = index.array;
	const positionAttribute = geometry.getAttribute('position') as BufferAttribute;
	const positionsCount = positionAttribute.count;
	const facesCount = indexArray.length / 3;

	const fusedPositions: FusePosition[] = new Array(positionsCount);
	// const faces: FuseFace[] = new Array(facesCount);
	const pointsBySnappedPos: Map<string, Set<FusePosition>> = new Map();
	const firstPointBySnappedPos: Map<string, FusePosition> = new Map();
	const averagePosBySnappedKey: Map<string, Vector3> = new Map();
	const newIndexBySnappedKey: Map<string, number> = new Map();
	const newPositions: number[] = [];
	const newIndices: number[] = [];
	const newAttributeValues: Record<string, number[]> = {};
	const otherAttributeNames = Object.keys(geometry.attributes).filter((attribName) => attribName != 'position');
	const otherAttributeNamesCount = otherAttributeNames.length;
	for (let k = 0; k < otherAttributeNamesCount; k++) {
		const otherAttributeName = otherAttributeNames[k];
		newAttributeValues[otherAttributeName] = [];
	}

	for (let i = 0; i < fusablePointIndices.length; i++) {
		const index = fusablePointIndices[i];
		const position = new FusePosition(positionAttribute, index, tolerance);
		fusedPositions[index] = position;

		addToSetAtEntry(pointsBySnappedPos, position.snappedKey, position);
		if (!firstPointBySnappedPos.has(position.snappedKey)) {
			firstPointBySnappedPos.set(position.snappedKey, position);
		}
	}
	const snappedIndicesSet: Set<number> = new Set();
	pointsBySnappedPos.forEach((points, snappedKey) => {
		const averageV3 = new Vector3();
		if (points.size > 1) {
			const pointIndices: number[] = [];
			let i = 0;
			points.forEach((point) => {
				pointIndices.push(point.index);
				snappedIndicesSet.add(point.index);
				i++;
			});
			pointIndices.sort((a, b) => a - b);

			averagePosition(points, averageV3);
			averagePosBySnappedKey.set(snappedKey, averageV3);
		}
	});

	const newIndexByOldIndex: number[] = [];
	const indicesToReplace: Set<number> = new Set();
	const indicesInUse: Set<number> = new Set();
	for (let fi = 0; fi < facesCount; fi++) {
		for (let vi = 0; vi < 3; vi++) {
			const currentIndexIndex = fi * 3 + vi;
			const index = indexArray[currentIndexIndex];

			if (snappedIndicesSet.has(index)) {
				const fusedPosition = fusedPositions[index];
				let newIndex = newIndexBySnappedKey.get(fusedPosition.snappedKey);
				const averagePos = averagePosBySnappedKey.get(fusedPosition.snappedKey)!;
				if (newIndex == null) {
					newIndex = newPositions.length / 3;
					newIndexBySnappedKey.set(fusedPosition.snappedKey, newIndex);

					// const firstPoint = firstPointBySnappedPos.get(fusedPosition.snappedKey)!;
					// for (let k = 0; k < otherAttributeNamesCount; k++) {
					// 	const otherAttribName = otherAttributeNames[k];
					// 	firstPoint.addAttribValue(geometry, otherAttribName, newAttributeValues[otherAttribName]);
					// }
				}
				newIndices.push(newIndex);
				averagePos.toArray(newPositions, newIndex * 3);

				if (newIndex != index && indicesInUse.has(index) == false) {
					indicesToReplace.add(index);
				}
				indicesInUse.add(newIndex);
			} else {
				let newIndex = newIndexByOldIndex[index];
				if (newIndex == null) {
					newIndex = newPositions.length / 3; //index - removedPointsCount;
					newIndexByOldIndex[index] = newIndex;
				}
				indicesInUse.add(newIndex);
				if (newIndex != index && indicesInUse.has(index) == false) {
					indicesToReplace.add(index);
				}
				tmpV3.fromBufferAttribute(positionAttribute, index);
				newIndices.push(newIndex);
				tmpV3.toArray(newPositions, newIndex * 3);
			}
		}
	}

	geometry.setAttribute('position', new BufferAttribute(new Float32Array(newPositions), 3));
	// for (let k = 0; k < otherAttributeNamesCount; k++) {
	// 	const attribName = otherAttributeNames[k];
	// 	const attribute = geometry.getAttribute(attribName) as BufferAttribute;
	// 	const newValues = newAttributeValues[attribName];
	// 	geometry.setAttribute(attribName, new BufferAttribute(new Float32Array(newValues), attribute.itemSize));
	// }

	geometry.setIndex(newIndices);
}

export function mergeFaces(geometry: BufferGeometry, tolerance: number) {
	const index = geometry.getIndex();
	if (!index) {
		return;
	}
	const indexArray = index.array;
	const positionAttribute = geometry.getAttribute('position') as BufferAttribute;
	const positionsCount = positionAttribute.count;
	const facesCount = indexArray.length / 3;

	const positions: FusePosition[] = new Array(positionsCount);
	const faces: FuseFace[] = new Array(facesCount);
	const pointsBySnappedPos: Map<string, Set<FusePosition>> = new Map();
	const firstPointBySnappedPos: Map<string, FusePosition> = new Map();
	const averagePosBySnappedKey: Map<string, Vector3> = new Map();
	const newIndexBySnappedKey: Map<string, number> = new Map();
	const newPositions: number[] = [];
	const newIndices: number[] = [];
	const newAttributeValues: Record<string, number[]> = {};
	const otherAttributeNames = Object.keys(geometry.attributes).filter((attribName) => attribName != 'position');
	const otherAttributeNamesCount = otherAttributeNames.length;
	for (let k = 0; k < otherAttributeNamesCount; k++) {
		const otherAttributeName = otherAttributeNames[k];
		newAttributeValues[otherAttributeName] = [];
	}

	for (let i = 0; i < positionsCount; i++) {
		const position = new FusePosition(positionAttribute, i, tolerance);
		positions[i] = position;

		addToSetAtEntry(pointsBySnappedPos, position.snappedKey, position);
		if (!firstPointBySnappedPos.has(position.snappedKey)) {
			firstPointBySnappedPos.set(position.snappedKey, position);
		}
	}

	pointsBySnappedPos.forEach((points, snappedKey) => {
		const averageV3 = new Vector3();
		averagePosition(points, averageV3);
		averagePosBySnappedKey.set(snappedKey, averageV3);
	});

	for (let i = 0; i < facesCount; i++) {
		const a = positions[indexArray[i * 3]];
		const b = positions[indexArray[i * 3 + 1]];
		const c = positions[indexArray[i * 3 + 2]];
		const face = new FuseFace(a, b, c);
		faces[i] = face;
	}

	const fusedFacesToKeep: FuseFace[] = [];
	for (let i = 0; i < facesCount; i++) {
		const face = faces[i];
		if (!isFaceCollapsed(face)) {
			fusedFacesToKeep.push(face);
		}
	}

	const fusedFacesToKeepCount = fusedFacesToKeep.length;
	for (let i = 0; i < fusedFacesToKeepCount; i++) {
		const face = fusedFacesToKeep[i];
		_positions[0] = face.a;
		_positions[1] = face.b;
		_positions[2] = face.c;
		for (let j = 0; j < 3; j++) {
			const position = _positions[j];
			let newIndex = newIndexBySnappedKey.get(position.snappedKey);
			const averagePos = averagePosBySnappedKey.get(position.snappedKey)!;
			if (newIndex == null) {
				newIndex = newPositions.length / 3;
				newIndexBySnappedKey.set(position.snappedKey, newIndex);
				averagePos.toArray(newPositions, newPositions.length);

				const firstPoint = firstPointBySnappedPos.get(position.snappedKey)!;
				for (let k = 0; k < otherAttributeNamesCount; k++) {
					const otherAttribName = otherAttributeNames[k];
					firstPoint.addAttribValue(geometry, otherAttribName, newAttributeValues[otherAttribName]);
				}
			}
			newIndices.push(newIndex);
		}
	}
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(newPositions), 3));
	for (let k = 0; k < otherAttributeNamesCount; k++) {
		const attribName = otherAttributeNames[k];
		const attribute = geometry.getAttribute(attribName) as BufferAttribute;
		const newValues = newAttributeValues[attribName];
		geometry.setAttribute(attribName, new BufferAttribute(new Float32Array(newValues), attribute.itemSize));
	}

	geometry.setIndex(newIndices);
}
