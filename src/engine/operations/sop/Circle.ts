import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3} from 'three';
import {CoreGeometryUtilCircle} from '../../../core/geometry/util/Circle';
import {ObjectType} from '../../../core/geometry/Constant';
import {CoreTransform} from '../../../core/Transform';
import {CircleBufferGeometry} from 'three';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {BufferGeometry} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {degToRad} from 'three/src/math/MathUtils';

interface CircleSopParams extends DefaultOperationParams {
	radius: number;
	segments: number;
	open: boolean;
	arcAngle: number;
	direction: Vector3;
	center: Vector3;
	connectLastPoint: boolean;
}
const DEFAULT_UP = new Vector3(0, 0, 1);

export class CircleSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CircleSopParams = {
		radius: 1,
		segments: 12,
		open: true,
		arcAngle: 360,
		direction: new Vector3(0, 1, 0),
		center: new Vector3(0, 0, 0),
		connectLastPoint: true,
	};
	static override type(): Readonly<'circle'> {
		return 'circle';
	}

	private _coreTransform = new CoreTransform();
	override cook(input_contents: CoreGroup[], params: CircleSopParams) {
		if (isBooleanTrue(params.open)) {
			return this._createCircle(params);
		} else {
			return this._createDisk(params);
		}
	}
	private _createCircle(params: CircleSopParams) {
		const geometry = CoreGeometryUtilCircle.create(params);
		this._setCenterAndDirection(geometry, params);
		return this.createCoreGroupFromGeometry(geometry, ObjectType.LINE_SEGMENTS);
	}

	private _createDisk(params: CircleSopParams) {
		const geometry = new CircleBufferGeometry(params.radius, params.segments);
		this._setCenterAndDirection(geometry, params);
		return this.createCoreGroupFromGeometry(geometry);
	}
	private _setCenterAndDirection(geometry: BufferGeometry, params: CircleSopParams) {
		// rotate 30 deg to:
		// - align with the tube
		// - so that copying circles on hexagon points gives an hexagon grid immediately
		geometry.rotateY(degToRad(30));
		this._coreTransform.rotateGeometry(geometry, DEFAULT_UP, params.direction);
		geometry.translate(params.center.x, params.center.y, params.center.z);
	}
}
