/**
 * Fuses quads
 *
 *
 */
import {QuadSopNode} from './_BaseQuad';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {QuadGeometry} from '../../../core/geometry/modules/quad/QuadGeometry';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Vector2, Vector3, Vector4, BufferAttribute} from 'three';
import {addToSetAtEntry} from '../../../core/MapUtils';

class QuadFuseSopParamsConfig extends NodeParamsConfig {
	/** @param tolerance */
	tolerance = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new QuadFuseSopParamsConfig();

export class QuadFuseSopNode extends QuadSopNode<QuadFuseSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.QUAD_FUSE;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const objects = coreGroup.quadObjects();
		if (!objects) {
			this.states.error.set(`no quad objects found`);
			return;
		}
		// _axis.copy(this.pv.axis).normalize();
		// _plane.constant = -this.pv.center.dot(_axis);
		// _plane.normal.copy(_axis);
		const tolerance = this.pv.tolerance;
		for (const object of objects) {
			// this._fuseObject(object);
			mergeFaces(object.geometry, tolerance);
		}

		this.setQuadObjects(objects);
	}

	// private _fuseObject(quadObject: QuadObject) {
	// 	// const geometry = quadObject.geometry;
	// 	// if (!geometry) {
	// 	// 	return;
	// 	// }
	// 	// const position = geometry.attributes['position'];
	// 	// const pointsCount = position.count;
	// 	// const positions = position.array;
	// 	// for (let i = 0; i < pointsCount; i++) {
	// 	// 	_pos.fromArray(positions, i * 3);
	// 	// 	_plane.projectPoint(_pos, _projectedPos);
	// 	// 	_delta.copy(_pos).sub(_projectedPos);
	// 	// 	_projectedPos.sub(_delta);
	// 	// 	_projectedPos.toArray(positions, i * 3);
	// 	// }
	// 	// // if ((object as Mesh).isMesh) {
	// 	// quadObjectInverse(quadObject);
	// 	// }
	// }
}

const tmpV2 = new Vector2();
const tmpV3 = new Vector3();
const tmpV4 = new Vector4();

class QuadPointPosition {
	public readonly originalPosition: Vector3 = new Vector3();
	public readonly snappedPosition: Vector3 = new Vector3();
	public readonly snappedKey: string;
	constructor(public readonly positionAttribute: BufferAttribute, public readonly index: number, tolerance: number) {
		this.originalPosition.fromBufferAttribute(positionAttribute, this.index);
		roundedPos(positionAttribute, this.index, this.snappedPosition, tolerance);
		this.snappedKey = `${this.snappedPosition.x}:${this.snappedPosition.y}:${this.snappedPosition.z}`;
	}
	addAttribValue(geometry: QuadGeometry, attribName: string, targetArray: number[]) {
		const attribute = geometry.attributes[attribName];
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
	constructor(
		public a: QuadPointPosition,
		public b: QuadPointPosition,
		public c: QuadPointPosition,
		public d: QuadPointPosition
	) {}
}

function averagePosition(positions: Set<QuadPointPosition>, target: Vector3) {
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
		face.a.snappedKey == face.d.snappedKey ||
		face.b.snappedKey == face.c.snappedKey ||
		face.b.snappedKey == face.d.snappedKey ||
		face.c.snappedKey == face.d.snappedKey
	);
}
const tmpAttribute: BufferAttribute = new BufferAttribute(new Float32Array(0), 0);
const _positions: [QuadPointPosition, QuadPointPosition, QuadPointPosition, QuadPointPosition] = [
	new QuadPointPosition(tmpAttribute, 0, 0.1),
	new QuadPointPosition(tmpAttribute, 0, 0.1),
	new QuadPointPosition(tmpAttribute, 0, 0.1),
	new QuadPointPosition(tmpAttribute, 0, 0.1),
];
export function mergeFaces(geometry: QuadGeometry, tolerance: number) {
	const index = geometry.index;
	const indexArray = index;
	const positionAttribute = geometry.attributes['position'];
	const positionsCount = positionAttribute.count;
	const facesCount = indexArray.length / 4;

	const positions: QuadPointPosition[] = new Array(positionsCount);
	const faces: Face[] = new Array(facesCount);
	const pointsBySnappedPos: Map<string, Set<QuadPointPosition>> = new Map();
	const firstPointBySnappedPos: Map<string, QuadPointPosition> = new Map();
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
		const position = new QuadPointPosition(positionAttribute, i, tolerance);
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
		const a = positions[indexArray[i * 4]];
		const b = positions[indexArray[i * 4 + 1]];
		const c = positions[indexArray[i * 4 + 2]];
		const d = positions[indexArray[i * 4 + 3]];
		const face = new Face(a, b, c, d);
		faces[i] = face;
	}

	const remainingFaces = faces.filter((face) => !isFaceCollapsed(face));

	const remainingFacesCount = remainingFaces.length;
	for (let i = 0; i < remainingFacesCount; i++) {
		const face = remainingFaces[i];
		_positions[0] = face.a;
		_positions[1] = face.b;
		_positions[2] = face.c;
		_positions[3] = face.d;
		for (let j = 0; j < 4; j++) {
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
		const attribute = geometry.attributes[attribName];
		const newValues = newAttributeValues[attribName];
		geometry.setAttribute(attribName, new BufferAttribute(new Float32Array(newValues), attribute.itemSize));
	}

	geometry.setIndex(newIndices);
}
