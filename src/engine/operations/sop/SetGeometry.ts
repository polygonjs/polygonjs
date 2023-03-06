import {TypeAssert} from './../../poly/Assert';
import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Mesh, BufferGeometry} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';

export enum SetGeometryMode {
	ONE_GEO_PER_OBJECT = 'One Geometry Per Object',
	FIRST_GEO_TO_EACH_OBJECT = 'First Geometry To Each Object',
}
export const SET_GEOMETRY_MODES: SetGeometryMode[] = [
	SetGeometryMode.ONE_GEO_PER_OBJECT,
	SetGeometryMode.FIRST_GEO_TO_EACH_OBJECT,
];

interface SetGeometrySopParams extends DefaultOperationParams {
	mode: number;
}

export class SetGeometrySopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: SetGeometrySopParams = {
		mode: SET_GEOMETRY_MODES.indexOf(SetGeometryMode.ONE_GEO_PER_OBJECT),
	};
	static override readonly INPUT_CLONED_STATE = [InputCloneMode.FROM_NODE, InputCloneMode.NEVER];
	static override type(): Readonly<'setGeometry'> {
		return 'setGeometry';
	}

	override cook(inputCoreGroups: CoreGroup[], params: SetGeometrySopParams) {
		const coreGroupDest = inputCoreGroups[0];
		const coreGroupSrc = inputCoreGroups[1];

		this._applyMode(coreGroupDest, coreGroupSrc, params);

		return coreGroupDest;
	}

	private _applyMode(coreGroupDest: CoreGroup, coreGroupSrc: CoreGroup, params: SetGeometrySopParams) {
		const mode = SET_GEOMETRY_MODES[params.mode];
		switch (mode) {
			case SetGeometryMode.ONE_GEO_PER_OBJECT: {
				return this._oneGeoPerObject(coreGroupDest, coreGroupSrc);
			}
			case SetGeometryMode.FIRST_GEO_TO_EACH_OBJECT: {
				return this._firstGeoToEachObject(coreGroupDest, coreGroupSrc);
			}
		}
		TypeAssert.unreachable(mode);
	}

	private _oneGeoPerObject(coreGroupDest: CoreGroup, coreGroupSrc: CoreGroup) {
		const destObjects = coreGroupDest.threejsObjects();
		const srcObjects = coreGroupSrc.threejsObjects();
		for (let i = 0; i < destObjects.length; i++) {
			const destObject = destObjects[i] as Mesh | undefined;
			const srcObject = srcObjects[i] as Mesh | undefined;

			if (destObject) {
				destObject.geometry = srcObject ? srcObject.geometry : SetGeometrySopOperation._emptyGeometry();
			}
		}
	}
	private _firstGeoToEachObject(coreGroupDest: CoreGroup, coreGroupSrc: CoreGroup) {
		const destObjects = coreGroupDest.threejsObjects();
		const srcObjects = coreGroupSrc.threejsObjects();
		let firstGeometry: BufferGeometry | undefined;
		for (let srcObject of srcObjects) {
			if ((srcObject as Mesh).geometry) {
				firstGeometry = (srcObject as Mesh).geometry;
			}
		}
		for (let i = 0; i < destObjects.length; i++) {
			const destObject = destObjects[i] as Mesh | undefined;

			if (destObject) {
				destObject.geometry = firstGeometry || SetGeometrySopOperation._emptyGeometry();
			}
		}
	}

	private static __emptyGeometry: BufferGeometry | undefined;
	private static _emptyGeometry() {
		return (this.__emptyGeometry = this.__emptyGeometry || new BufferGeometry());
	}
}
