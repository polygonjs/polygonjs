import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Float32BufferAttribute, Object3D, Vector3, Mesh, BufferAttribute} from 'three';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {Attribute} from '../../../core/geometry/Attribute';
import {CoreAttribute} from '../../../core/geometry/Attribute';
import {filterThreejsObjectsWithGroup} from '../../../core/geometry/Mask';

export enum TangentMode {
	MESH = 'Normal Maps',
	CURVE = 'Curve',
}
export const TANGENT_MODES: TangentMode[] = [TangentMode.MESH, TangentMode.CURVE];

interface TangentSopParams extends DefaultOperationParams {
	group: string;
	mode: number;
	closed: boolean;
	tangentName: string;
}
const tangent = new Vector3();
const currentPosition = new Vector3();
const nextPosition = new Vector3();
const STRIDE = 3;

export class TangentSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: TangentSopParams = {
		group: '*',
		mode: TANGENT_MODES.indexOf(TangentMode.MESH),
		closed: false,
		tangentName: 'tangent',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<SopType.TANGENT> {
		return SopType.TANGENT;
	}
	override cook(inputCoreGroups: CoreGroup[], params: TangentSopParams) {
		const inputCoreGroup = inputCoreGroups[0];

		const objects = filterThreejsObjectsWithGroup(inputCoreGroup, params);
		return this._process(objects, params);
	}
	private _process(objects: Object3D[], params: TangentSopParams) {
		const mode = TANGENT_MODES[params.mode];
		switch (mode) {
			case TangentMode.MESH:
				return this._processForMesh(objects, params);
			case TangentMode.CURVE:
				return this._processForCurve(objects, params);
		}
	}
	private _processForMesh(objects: Object3D[], params: TangentSopParams) {
		for (const object of objects) {
			const geometry = (object as Mesh).geometry;
			if (geometry) {
				geometry.computeTangents();
			}
		}
		return this.createCoreGroupFromObjects(objects);
	}
	private _processForCurve(objects: Object3D[], params: TangentSopParams) {
		const newObjects: Object3D[] = [];

		for (const object of objects) {
			const objectWithTangent = this._createTangentForCurve(object, params);
			if (objectWithTangent) {
				newObjects.push(objectWithTangent);
			}
		}

		return this.createCoreGroupFromObjects(newObjects);
	}

	private _createTangentForCurve(object: Object3D, params: TangentSopParams) {
		const {closed} = params;
		const tangentName = CoreAttribute.remapName(params.tangentName);

		const geometry = (object as Mesh).geometry;
		if (!geometry) {
			return;
		}
		const positionAttribute = geometry.getAttribute(Attribute.POSITION) as BufferAttribute | undefined;
		if (!positionAttribute) {
			return;
		}
		const positionArray = positionAttribute.array;
		const pointsCount = positionArray.length / STRIDE;

		// add attribute if not present
		let tangentAttribute = geometry.getAttribute(tangentName) as BufferAttribute;
		if (!tangentAttribute) {
			const values = new Array(pointsCount * STRIDE).fill(1);
			geometry.setAttribute(tangentName, new Float32BufferAttribute(values, STRIDE));
			tangentAttribute = geometry.getAttribute(tangentName) as BufferAttribute;
		}
		const tangentArray = tangentAttribute.array;

		for (let i = 0; i < pointsCount - 1; i++) {
			currentPosition.fromArray(positionArray, i * STRIDE);
			nextPosition.fromArray(positionArray, (i + 1) * STRIDE);
			tangent.copy(nextPosition).sub(currentPosition).normalize();
			tangent.toArray(tangentArray, i * STRIDE);
		}
		// handle last point separately
		const lastIndex = pointsCount - 1;
		currentPosition.fromArray(positionArray, lastIndex * STRIDE);
		if (closed) {
			nextPosition.fromArray(positionArray, 0);
			tangent.copy(nextPosition).sub(currentPosition).normalize();
		} else {
			nextPosition.fromArray(positionArray, (lastIndex - 1) * STRIDE);
			tangent.copy(currentPosition).sub(nextPosition).normalize(); // note that it is inverted
		}
		tangent.toArray(tangentArray, lastIndex * STRIDE);

		return object;
	}
}
