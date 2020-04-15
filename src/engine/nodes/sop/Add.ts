// import lodash_flatten from 'lodash/flatten';
// import lodash_last from 'lodash/last';
import lodash_times from 'lodash/times';
import {Object3D} from 'three/src/core/Object3D';
// import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {TypedSopNode} from './_Base';
// import {Core} from '../../../Core/_Module';
import {ObjectType} from '../../../core/geometry/Constant';
import {CoreGroup} from '../../../core/geometry/Group';
// import {CoreGeometryUtilShape} from '../../../core/geometry/util/Shape';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AddSopParamsConfig extends NodeParamsConfig {
	create_point = ParamConfig.BOOLEAN(1);
	points_count = ParamConfig.INTEGER(1, {
		range: [1, 100],
		range_locked: [true, false],
		visible_if: {create_point: true},
	});
	position = ParamConfig.VECTOR3([0, 0, 0], {visible_if: {create_point: true}});
	// create_polygon = ParamConfig.BOOLEAN(0);
	open = ParamConfig.BOOLEAN(0);
	connect_to_last_point = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new AddSopParamsConfig();

export class AddSopNode extends TypedSopNode<AddSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'add';
	}
	_objects: Object3D[] | undefined;

	static displayed_input_names(): string[] {
		return ['geometry to create polygons from (optional)'];
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);
	}

	cook(input_contents: CoreGroup[]) {
		this._objects = [];
		this._create_point();
		// if (this.pv.create_polygon) {
		// 	this._create_polygon(input_contents[0]);
		// }

		this.set_objects(this._objects);
	}

	private _create_point() {
		if (this.pv.create_point) {
			const geometry = new BufferGeometry();
			const positions: number[] = [];
			lodash_times(this.pv.points_count, (i) => {
				this.pv.position.toArray(positions, i * 3);
			});
			geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
			const object = this.create_object(geometry, ObjectType.POINTS);

			if (this._objects) {
				this._objects.push(object);
			}
		}
	}

	// private _create_polygon(core_group: CoreGroup) {
	// 	const points = core_group.points();
	// 	const is_polygon_closed = !this.pv.open && points.length >= 3;
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

	// 	if (points.length > 2 && this.pv.connect_to_last_point) {
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
