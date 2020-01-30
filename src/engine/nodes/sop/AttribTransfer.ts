import {TypedSopNode} from './_Base';
import {CorePoint} from 'src/core/geometry/Point';
import {CoreGroup} from 'src/core/geometry/Group';
// import {CoreMath} from 'src/core/math/_Module';
import {CoreInterpolate} from 'src/core/math/Interpolate';
import {CoreOctree} from 'src/core/math/octree/Octree';
import {CoreIterator} from 'src/core/Iterator';
// import lodash_sum from 'lodash/sum';

// enum TransferMethod {
// 	AUTO = 0,
// 	ARTISTIC = 1,
// }
// const TransferMethodMenuEntries = [
// 	{name: 'auto', value: TransferMethod.AUTO},
// 	{name: 'artistic', value: TransferMethod.ARTISTIC},
// ];

// const LATITUDE = 'Latitude'
// const LONGITUDE = 'Longitude'
import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {InputCloneMode} from 'src/engine/poly/InputCloneMode';
class AttribTransferSopParamsConfig extends NodeParamsConfig {
	src_group = ParamConfig.STRING();
	dest_group = ParamConfig.STRING();
	name = ParamConfig.STRING();
	max_samples_count = ParamConfig.INTEGER(1, {
		range: [1, 10],
		range_locked: [true, false],
	});
	// method = ParamConfig.INTEGER(TransferMethod.AUTO, {
	// 	menu: {
	// 		entries: TransferMethodMenuEntries,
	// 	},
	// });
	distance_threshold = ParamConfig.FLOAT(1);
	blend_width = ParamConfig.FLOAT(0);
}
const ParamsConfig = new AttribTransferSopParamsConfig();

export class AttribTransferSopNode extends TypedSopNode<AttribTransferSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attrib_transfer';
	}

	_core_group_dest!: CoreGroup;
	_core_group_src!: CoreGroup;

	// utils
	_attrib_names!: string[];
	_octree_timestamp: number | undefined;
	_prev_param_src_group: string | undefined;
	_octree: CoreOctree | undefined;

	static displayed_input_names(): string[] {
		return ['geometry to transfer attributes to', 'geometry to transfer attributes from'];
	}

	initialize_node() {
		this.io.inputs.set_count(2);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	async cook(input_contents: CoreGroup[]) {
		// this._group_dest = input_containers[0].group();
		// const container1 = input_containers[1];

		this._core_group_dest = input_contents[0]; //new CoreGroup(this._group_dest);
		const dest_points = this._core_group_dest.points_from_group(this.pv.dest_group);

		// this._group_src = input_containers[1] //container1.group({ clone: false });
		this._core_group_src = input_contents[1]; //new CoreGroup(this._group_src);

		this._attrib_names = this._core_group_src.attrib_names_matching_mask(this.pv.name);
		this._error_if_attribute_not_found_on_second_input();
		this._build_octree_if_required(this._core_group_src);
		this._add_attribute_if_required();

		await this._transfer_attributes(dest_points);
		this.set_core_group(this._core_group_dest);
	}

	_error_if_attribute_not_found_on_second_input() {
		for (let attrib_name of this._attrib_names) {
			if (!this._core_group_src.has_attrib(attrib_name)) {
				this.states.error.set(`attribute '${attrib_name}' not found on second input`);
			}
		}
	}

	private _build_octree_if_required(core_group: CoreGroup) {
		const second_input_changed =
			this._octree_timestamp == null || this._octree_timestamp !== core_group.timestamp();
		const src_group_changed = this._prev_param_src_group !== this.pv.src_group;

		if (src_group_changed || second_input_changed) {
			this._octree_timestamp = core_group.timestamp();
			this._prev_param_src_group = this.pv.src_group;

			const points_src = this._core_group_src.points_from_group(this.pv.src_group);

			this._octree = new CoreOctree(this._core_group_src.bounding_box());
			this._octree.set_points(points_src);
		}
	}

	private _add_attribute_if_required() {
		this._attrib_names.forEach((attrib_name) => {
			if (!this._core_group_dest.has_attrib(attrib_name)) {
				const attrib_size = this._core_group_src.attrib_size(attrib_name);
				this._core_group_dest.add_numeric_vertex_attrib(attrib_name, attrib_size, 0);
			}
		});
	}

	private async _transfer_attributes(dest_points: CorePoint[]) {
		// const start_time = performance.now()
		const iterator = new CoreIterator();
		await iterator.start_with_array(dest_points, this._transfer_attributes_for_point.bind(this));
		// for(let dest_point of dest_points){

		// 	this._transfer_attributes_for_point(dest_point)

		// }
	}
	private _transfer_attributes_for_point(dest_point: CorePoint) {
		const total_dist = this.pv.distance_threshold + this.pv.blend_width;
		const nearest_points: CorePoint[] =
			this._octree?.find_points(dest_point.position(), total_dist, this.pv.max_samples_count) || [];

		// test[nearest_points.length] = test[nearest_points.length] || 0
		// test[nearest_points.length] += 1

		for (let attrib_name of this._attrib_names) {
			this._interpolate_points(dest_point, nearest_points, attrib_name);
		}
	}

	// if @_param_draw_connections
	// 	lodash_each nearest_points, (nearest_point)=>
	// 		@_connection_point_pairs.push([ nearest_point.position(), dest_point.position() ])

	// if @_param_draw_connections
	// 	this._draw_connections()

	private _interpolate_points(point_dest: CorePoint, src_points: CorePoint[], attrib_name: string) {
		let new_value: number;
		// if (this.pv.method == TransferMethod.ARTISTIC) {

		new_value = CoreInterpolate.perform(
			point_dest,
			src_points,
			attrib_name,
			this.pv.distance_threshold,
			this.pv.blend_width
		);
		// } else {
		// 	new_value = this._select(point_dest, src_points, attrib_name);
		// 	console.log('B new_value', new_value);
		// }

		if (new_value != null) {
			point_dest.set_attrib_value(attrib_name, new_value);
		}
	}

	// private _select(point_dest: CorePoint, src_points: CorePoint[], attrib_name: string) {
	// 	const src_values = [];
	// 	const inverse_distances = [];
	// 	const dest_position = point_dest.position();
	// 	const dest_lng_lat = {lng: dest_position.x, lat: dest_position.z};
	// 	for (let src_point of src_points) {
	// 		// const dist = dest_position.distanceTo(src_point.position()) //* 0.1
	// 		const src_position = src_point.position();
	// 		const src_lng_lat = {lng: src_position.x, lat: src_position.z};
	// 		const dist = CoreMath.geodesic_distance(src_lng_lat, dest_lng_lat);
	// 		const dist_squared = dist * dist;
	// 		const attrib_value = src_point.attrib_value(attrib_name);

	// 		src_values.push(attrib_value / dist_squared);
	// 		inverse_distances.push(1 / dist_squared);
	// 	}

	// 	const sum = lodash_sum(src_values) / lodash_sum(inverse_distances);
	// 	return sum;
	// }

	// ROUND(

	// 	SUM(
	// 		Value
	// 		/
	// 		(dist_meters*dist_meters)
	// 		)
	// 	/
	// 	SUM(
	// 		1
	// 		/
	// 		(dist_meters*dist_meters)
	// 		)

	// 	,1

	// )

	// _draw_connections() {
	// 	let positions = [];
	// 	const indices = [];

	// 	lodash_each(this._connection_point_pairs, function(current_positions, i) {

	// 		positions.push(current_positions[0].toArray());
	// 		positions.push(current_positions[1].toArray());

	// 		indices.push((2 * i) + 0);
	// 		return indices.push((2 * i) + 1);
	// 	});

	// 	positions = lodash_flatten(positions);
	// 	const geometry = new THREE.BufferGeometry();
	// 	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
	// 	geometry.setIndex(indices);
	// 	const object = this.create_object(geometry, Core.Geometry.Constant.OBJECT_TYPE.LINE_SEGMENTS);
	// 	return this._group_dest.add(object);
	// }
}
