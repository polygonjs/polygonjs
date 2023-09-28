import {BaseSopOperation} from './_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {Vector3, BufferAttribute, BufferGeometry} from 'three';
import {ObjectType} from '../../../core/geometry/Constant';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {Attribute} from '../../../core/geometry/Attribute';
import {TypeAssert} from '../../poly/Assert';

const _geoCenter: Vector3 = new Vector3();

export enum CenterMode {
	OBJECT_ORIGIN = 'object origin',
	GEOMETRY_CENTER = 'geometry center',
}
export const CENTER_MODES: CenterMode[] = [CenterMode.OBJECT_ORIGIN, CenterMode.GEOMETRY_CENTER];

interface CenterSopParams extends DefaultOperationParams {
	mode: number;
}

export class CenterSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CenterSopParams = {
		mode: CENTER_MODES.indexOf(CenterMode.OBJECT_ORIGIN),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'center'> {
		return 'center';
	}

	override cook(inputCoreGroups: CoreGroup[], params: CenterSopParams) {
		const coreGroup = inputCoreGroups[0];
		const srcObjects = coreGroup.threejsObjectsWithGeo();
		const mode = CENTER_MODES[params.mode];

		const positions: number[] = new Array(srcObjects.length * 3);
		positions.fill(0);
		for (let i = 0; i < srcObjects.length; i++) {
			const srcObject = srcObjects[i];

			this._applyCenter(mode, srcObject, positions, i);
		}
		const geometry = new BufferGeometry();
		geometry.setAttribute(Attribute.POSITION, new BufferAttribute(new Float32Array(positions), 3));
		const object = this.createObject(geometry, ObjectType.POINTS);
		if (this._node) {
			object.name = this._node.name();
		}
		return this.createCoreGroupFromObjects([object]);
	}
	private _applyCenter(mode: CenterMode, object: Object3DWithGeometry, positions: number[], i: number) {
		object.updateMatrixWorld();
		switch (mode) {
			case CenterMode.OBJECT_ORIGIN: {
				object.getWorldPosition(_geoCenter);
				_geoCenter.toArray(positions, i * 3);
				return;
			}
			case CenterMode.GEOMETRY_CENTER: {
				const srcGeometry = object.geometry;
				srcGeometry.computeBoundingBox();
				if (srcGeometry.boundingBox) {
					srcGeometry.boundingBox?.getCenter(_geoCenter);

					_geoCenter.applyMatrix4(object.matrixWorld);
					_geoCenter.toArray(positions, i * 3);
				}
				return;
			}
		}
		TypeAssert.unreachable(mode);
	}
}
