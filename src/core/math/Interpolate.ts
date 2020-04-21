import lodash_max from 'lodash/max';
import lodash_isNumber from 'lodash/isNumber';
import lodash_sum from 'lodash/sum';

import {Vector3} from 'three/src/math/Vector3';
// import {Vector2} from 'three/src/math/Vector2';
// import {_Math} from 'three/src/math/MathU';
// const THREE = {Math: _Math, Vector2, Vector3}
import {CorePoint} from '../geometry/Point';

export class CoreInterpolate {
	static perform(
		point_dest: CorePoint,
		points_src: CorePoint[],
		attrib_name: string,
		distance_threshold: number,
		blend_with: number
	): number {
		switch (points_src.length) {
			case 0:
				return 0;
			case 1:
				return this._interpolate_with_1_point(
					point_dest,
					points_src[0],
					attrib_name,
					distance_threshold,
					blend_with
				);
			default:
				// positions_src = lodash_map(points_src, (point) -> point.position())
				// values_src = lodash_map(points_src, (point) -> point.attrib_value(attrib_name))
				// position_dest = point_dest.position()
				//if positions_src.length > 3
				//	positions_src = positions_src.slice(0,3)
				//this._interpolate_with_3_points_max(positions_src, values_src, position_dest, dest_value)
				return this._interpolate_with_multiple_points(
					point_dest,
					points_src,
					attrib_name,
					distance_threshold,
					blend_with
				);
		}
	}

	static _interpolate_with_1_point(
		point_dest: CorePoint,
		point_src: CorePoint,
		attrib_name: string,
		distance_threshold: number,
		blend_with: number
	): number {
		const position_dest = point_dest.position();
		const position_src = point_src.position();
		const distance = position_dest.distanceTo(position_src);

		const value_src = point_src.attrib_value(attrib_name);
		if (lodash_isNumber(value_src)) {
			return this._weighted_value_from_distance(
				point_dest,
				value_src,
				attrib_name,
				distance,
				distance_threshold,
				blend_with
			);
		} else {
			console.warn('value is not a number', value_src);
			return 0;
		}
	}

	static _weight_from_distance(distance: number, distance_threshold: number, blend_with: number) {
		return (distance - distance_threshold) / blend_with;
	}

	static _weighted_value_from_distance(
		point_dest: CorePoint,
		value_src: number,
		attrib_name: string,
		distance: number,
		distance_threshold: number,
		blend_with: number
	): number {
		if (distance <= distance_threshold) {
			return value_src;
		} else {
			const value_dest = point_dest.attrib_value(attrib_name);
			if (lodash_isNumber(value_dest)) {
				const blend = this._weight_from_distance(distance, distance_threshold, blend_with);
				return blend * value_dest + (1 - blend) * value_src;
			} else {
				console.warn('value is not a number', value_dest);
				return 0;
			}
			// switch (point_dest.attrib_size(attrib_name)) {
			// 	case 1:
			// 		// const value_src_as_number = value_src as number;
			// 		return blend * value_dest + (1 - blend) * value_src;
			// 	case 2:
			// 		const value_src_as_vec2 = value_src as Vector2Like;
			// 		return new Vector2(
			// 			blend * value_dest.x + (1 - blend) * value_src_as_vec2.x,
			// 			blend * value_dest.y + (1 - blend) * value_src_as_vec2.y
			// 		);
			// 	case 3:
			// 		const value_src_as_vec3 = value_src as Vector3Like;
			// 		return new Vector3(
			// 			blend * value_dest.x + (1 - blend) * value_src_as_vec3.x,
			// 			blend * value_dest.y + (1 - blend) * value_src_as_vec3.y,
			// 			blend * value_dest.z + (1 - blend) * value_src_as_vec3.z
			// 		);
			// 	default:
			// 		return 0;
			// }
		}
	}

	// @_interpolate_with_3_points_max: (positions_src, values_src, position_dest, dest_value)->
	// 	weights = this.weights( position_dest, positions_src )
	// 	interpolated_value = lodash_sum lodash_map values_src, (src_value, i)=>
	// 		weights[i] * src_value

	// 	if dest_value?
	// 		0.5 * (dest_value + src_value)
	// 	else
	// 		interpolated_value

	// weights: http://www.sidefx.com/docs/houdini/nodes/vop/pcfilter.html
	// w_i = 1-smooth(0, maxd*1.1, d_i);
	// maxd is the farthest point, and w_i is the weight for a given point at distance (d_i). Points that are closer to the center will be weighted higher with that formula, rather than it being an average.
	static _interpolate_with_multiple_points(
		point_dest: CorePoint,
		points_src: CorePoint[],
		attrib_name: string,
		distance_threshold: number,
		blend_with: number
	): number {
		// let new_value
		// const positions_src = lodash_map(points_src, (point) =>
		// 	point.position()
		// )
		// const values_src = lodash_map(points_src, (point) =>
		// 	point.attrib_value(attrib_name)
		// )
		// const position_dest = point_dest.position()
		// const attrib_size = point_dest.attrib_size(attrib_name);

		// const distances = lodash_map(positions_src, (src_position) =>
		// 	src_position.distanceTo(position_dest)
		// )
		// distances = distances.sort()
		// max_dist = lodash_last(distances)
		// const max_dist = distance_threshold + blend_with

		// const weights = lodash_map(positions_src, (src_position, i) => {
		// 	const distance = distances[i]
		// 	//1 - Math.smootherstep(distance, 0, max_dist*1.1)
		// 	return this._weight_from_distance(
		// 		distance,
		// 		distance_threshold,
		// 		blend_with
		// 	)
		// })

		// const total_weight = lodash_sum(weights)

		// weighted_values = lodash_map values_src, (src_value, i)->
		// 	switch attrib_size
		// 		when 1 then src_value * weights[i]
		// 		else
		// 			src_value.clone().multiplyScalar(weights[i])
		const weighted_values_src = points_src.map((point_src) => {
			return this._interpolate_with_1_point(point_dest, point_src, attrib_name, distance_threshold, blend_with);
		});
		return lodash_max(weighted_values_src) || 0;

		// // TODO: we could have 2 modes of interpolation?
		// // return (new_value = (() => {
		// switch (attrib_size) {
		// 	// when 1 then lodash_sum(weighted_values_src) / values_src.length # mode 1
		// 	case 1:
		// 		return lodash_max(weighted_values_src); // mode 2
		// 	default:
		// 		throw 'interpolation with multiple vectors not implemented yet';
		// 	// var new_vector = weighted_values_src[0].clone();
		// 	// new_vector.x = lodash_sum(lodash_map(weighted_values, 'x')) / total_weight;
		// 	// new_vector.y = lodash_sum(lodash_map(weighted_values, 'y')) / total_weight;
		// 	// if (new_vector.z != null) {
		// 	// 	new_vector.z = lodash_sum(lodash_map(weighted_values, 'z')) / total_weight;
		// 	// }
		// 	// return new_vector;
		// }
		// })())
	}

	// https://math.stackexchange.com/questions/1336386/weighted-average-distance-between-3-or-more-positions
	static weights(current_position: Vector3, other_positions: Vector3[]) {
		switch (other_positions.length) {
			case 1:
				return 1;
			case 2:
				return this._weights_from_2(current_position, other_positions);
			default:
				other_positions = other_positions.slice(0, 3);
				return this._weights_from_3(current_position, other_positions);
		}
	}

	static _weights_from_2(current_position: Vector3, other_positions: Vector3[]) {
		const dist_to_positions = other_positions.map((other_position) => current_position.distanceTo(other_position));

		const distance_total = lodash_sum(dist_to_positions);

		return [dist_to_positions[1] / distance_total, dist_to_positions[0] / distance_total];
	}

	static _weights_from_3(current_position: Vector3, other_positions: Vector3[]) {
		const dist_to_positions = other_positions.map((other_position) => current_position.distanceTo(other_position));

		const distance_total = lodash_sum([
			dist_to_positions[0] * dist_to_positions[1],
			dist_to_positions[0] * dist_to_positions[2],
			dist_to_positions[1] * dist_to_positions[2],
		]);

		return [
			(dist_to_positions[1] * dist_to_positions[2]) / distance_total,
			(dist_to_positions[0] * dist_to_positions[2]) / distance_total,
			(dist_to_positions[0] * dist_to_positions[1]) / distance_total,
		];
	}
}
