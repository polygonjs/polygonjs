import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {Vector3} from 'three/src/math/Vector3';
import {ObjectType} from '../../../core/geometry/Constant';
import {Object3D} from 'three/src/core/Object3D';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
interface AddSopParams extends DefaultOperationParams {
	create_point: boolean;
	points_count: number;
	position: Vector3;
	open: boolean;
	connect_to_last_point: boolean;
}

export class AddSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: AddSopParams = {
		create_point: true,
		points_count: 1,
		position: new Vector3(0, 0, 0),
		open: false,
		connect_to_last_point: false,
	};
	static type(): Readonly<'add'> {
		return 'add';
	}

	cook(input_contents: CoreGroup[], params: AddSopParams) {
		const objects: Object3D[] = [];
		this._create_point(objects, params);
		// if (params.create_polygon) {
		// 	this._create_polygon(input_contents[0]);
		// }

		return this.create_core_group_from_objects(objects);
	}
	private _create_point(objects: Object3D[], params: AddSopParams) {
		if (params.create_point) {
			const geometry = new BufferGeometry();
			const positions: number[] = [];
			for (let i = 0; i < params.points_count; i++) {
				params.position.toArray(positions, i * 3);
			}
			geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
			const object = this.create_object(geometry, ObjectType.POINTS);

			if (objects) {
				objects.push(object);
			}
		}
	}

	// private _create_polygon(core_group: CoreGroup) {
	// 	const points = core_group.points();
	// 	const is_polygon_closed = !params.open && points.length >= 3;
	// 	if (points.length > 0) {
	// 		if (is_polygon_closed) {
	// 			this._create_polygon_closed(core_group);
	// 		} else {
	// 			this._create_polygon_open(core_group);
	// 		}
	// 	}
	// }

	// _create_polygon_closed(core_group: CoreGroup) {
	// 	const points = core_group.points();

	// 	const geometry = CoreGeometryUtilShape.geometry_from_points(points);
	// 	const object = this.create_object(geometry);
	// 	this._objects.push(object);
	// }

	// _create_polygon_open(core_group:CoreGroup) {
	// 	const points = core_group.points();

	// 	let positions:number[][] = [];
	// 	const indices:number[] = [];
	// 	points.forEach((point, i) => {
	// 		point.position().toArray(positions, i * 3);
	// 		// positions.push(point.position().toArray());

	// 		if (i > 0) {
	// 			indices.push(i - 1);
	// 			indices.push(i);
	// 		}
	// 	});

	// 	if (points.length > 2 && params.connect_to_last_point) {
	// 		positions.push(points[0].position().toArray());
	// 		indices.push(lodash_last(indices));
	// 		indices.push(0);
	// 	}

	// 	positions = lodash_flatten(positions);
	// 	const geometry = new BufferGeometry();
	// 	geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	// 	geometry.setIndex(indices);
	// 	const object = this.create_object(geometry, CoreConstant.OBJECT_TYPE.LINE_SEGMENTS);
	// 	this._objects.push(object);
	// }
}
