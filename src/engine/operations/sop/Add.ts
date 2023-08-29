import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Object3D, BufferGeometry, Vector3, BufferAttribute, Float32BufferAttribute} from 'three';
import {ObjectType} from '../../../core/geometry/Constant';
import {CorePoint} from '../../../core/geometry/Point';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';

const _position = new Vector3();
interface AddSopParams extends DefaultOperationParams {
	// create point
	createPoint: boolean;
	pointsCount: number;
	position: Vector3;
	// connect input points
	connectInputPoints: boolean;
	// open: boolean; // creating a polygon when this is closed still needs work
	connectToLastPoint: boolean;
}

export class AddSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AddSopParams = {
		createPoint: true,
		pointsCount: 1,
		position: new Vector3(0, 0, 0),
		connectInputPoints: false,
		connectToLastPoint: false,
	};
	static override type(): Readonly<'add'> {
		return 'add';
	}

	override cook(input_contents: CoreGroup[], params: AddSopParams) {
		const objects: Object3D[] = [];
		this._createPoint(objects, params);
		this._createPolygon(input_contents[0], objects, params);

		if (this._node) {
			let i = 0;
			for (let object of objects) {
				object.name = `${this._node.name()}-${i}`;
				i++;
			}
		}

		return this.createCoreGroupFromObjects(objects);
	}
	private _createPoint(objects: Object3D[], params: AddSopParams) {
		if (!isBooleanTrue(params.createPoint)) {
			return;
		}
		const geometry = new BufferGeometry();
		const positions: number[] = [];
		for (let i = 0; i < params.pointsCount; i++) {
			params.position.toArray(positions, i * 3);
		}
		geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
		const object = this.createObject(geometry, ObjectType.POINTS);

		if (objects) {
			objects.push(object);
		}
	}

	private _createPolygon(core_group: CoreGroup, objects: Object3D[], params: AddSopParams) {
		if (!isBooleanTrue(params.connectInputPoints)) {
			return;
		}
		const points = core_group.points();
		if (points.length > 0) {
			// const is_polygon_closed = !params.open && points.length >= 3;
			// if (is_polygon_closed) {
			// 	this._create_polygon_closed(core_group, objects);
			// } else {
			this._create_polygon_open(core_group, objects, params);
			// }
		}
	}

	// private _create_polygon_closed(core_group: CoreGroup, objects: Object3D[]) {
	// 	const points = core_group.points();

	// 	const geometry = CoreGeometryUtilShape.geometryFromPoints(points.map((p) => p.position()));
	// 	const object = this.createObject(geometry, ObjectType.MESH);
	// 	objects.push(object);
	// }

	private _create_polygon_open(core_group: CoreGroup, objects: Object3D[], params: AddSopParams) {
		const points = core_group.points();

		let positions: number[] = [];
		const indices: number[] = [];
		let point: CorePoint;
		for (let i = 0; i < points.length; i++) {
			point = points[i];
			point.position(_position).toArray(positions, i * 3);
			// positions.push(point.position().toArray());

			if (i > 0) {
				indices.push(i - 1);
				indices.push(i);
			}
		}

		if (points.length > 2 && params.connectToLastPoint) {
			points[0].position(_position).toArray(positions, positions.length);
			const last_index = indices[indices.length - 1];
			indices.push(last_index);
			indices.push(0);
		}
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.setIndex(indices);
		const object = this.createObject(geometry, ObjectType.LINE_SEGMENTS);
		objects.push(object);
	}
}
