import {BufferGeometry, BufferAttribute, Vector2, Vector3, Vector4} from 'three';
import {MapUtils} from '../../MapUtils';

const tmpV2 = new Vector2();
const tmpV3 = new Vector3();
const tmpV4 = new Vector4();

class Position {
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

class Face {
	constructor(public a: Position, public b: Position, public c: Position) {}
}

function averagePosition(positions: Set<Position>, target: Vector3) {
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
function isFaceCollapsed(face: Face): boolean {
	return (
		face.a.snappedKey == face.b.snappedKey ||
		face.a.snappedKey == face.c.snappedKey ||
		face.b.snappedKey == face.c.snappedKey
	);
}

export function mergeFaces(geometry: BufferGeometry, tolerance: number) {
	const index = geometry.getIndex();
	if (!index) {
		return;
	}
	const indexArray = index.array as number[];
	const positionAttribute = geometry.getAttribute('position') as BufferAttribute;
	const positionsCount = positionAttribute.count;
	const facesCount = indexArray.length / 3;

	const positions: Position[] = new Array(positionsCount);
	const faces: Face[] = new Array(facesCount);
	const pointsBySnappedPos: Map<string, Set<Position>> = new Map();
	const firstPointBySnappedPos: Map<string, Position> = new Map();
	const averagePosBySnappedKey: Map<string, Vector3> = new Map();
	const newIndexBySnappedKey: Map<string, number> = new Map();
	const newPositions: number[] = [];
	const newIndices: number[] = [];
	const newAttributeValues: Record<string, number[]> = {};
	const otherAttributeNames = Object.keys(geometry.attributes).filter((attribName) => attribName != 'position');
	for (const otherAttributeName of otherAttributeNames) {
		newAttributeValues[otherAttributeName] = [];
	}

	for (let i = 0; i < positionsCount; i++) {
		const position = new Position(positionAttribute, i, tolerance);
		positions[i] = position;

		MapUtils.addToSetAtEntry(pointsBySnappedPos, position.snappedKey, position);
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
		const face = new Face(a, b, c);
		faces[i] = face;
	}

	const remainingFaces = faces.filter((face) => !isFaceCollapsed(face));

	for (let face of remainingFaces) {
		const positions = [face.a, face.b, face.c];
		for (let position of positions) {
			let newIndex = newIndexBySnappedKey.get(position.snappedKey);
			const averagePos = averagePosBySnappedKey.get(position.snappedKey)!;
			if (newIndex == null) {
				newIndex = newPositions.length / 3;
				newIndexBySnappedKey.set(position.snappedKey, newIndex);
				averagePos.toArray(newPositions, newPositions.length);

				const firstPoint = firstPointBySnappedPos.get(position.snappedKey)!;
				for (const otherAttribName of otherAttributeNames) {
					firstPoint.addAttribValue(geometry, otherAttribName, newAttributeValues[otherAttribName]);
				}
			}
			newIndices.push(newIndex);
		}
	}
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(newPositions), 3));
	for (const attribName of otherAttributeNames) {
		const attribute = geometry.getAttribute(attribName) as BufferAttribute;
		const newValues = newAttributeValues[attribName];
		geometry.setAttribute(attribName, new BufferAttribute(new Float32Array(newValues), attribute.itemSize));
	}

	geometry.setIndex(newIndices);
}
