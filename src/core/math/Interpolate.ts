import {Vector3} from 'three';
import {ArrayUtils} from '../ArrayUtils';
import {CorePoint} from '../geometry/Point';
import {CoreType} from '../Type';

const _positionSrc = new Vector3();
const _positionDest = new Vector3();

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
				return point_dest.attribValue(attrib_name) as number;
			case 1:
				return this._interpolate_with_1_point(
					point_dest,
					points_src[0],
					attrib_name,
					distance_threshold,
					blend_with
				);
			default:
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
		point_dest.position(_positionDest);
		point_src.position(_positionSrc);
		const distance = _positionDest.distanceTo(_positionSrc);

		const value_src = point_src.attribValue(attrib_name);
		if (CoreType.isNumber(value_src)) {
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
			const value_dest = point_dest.attribValue(attrib_name);
			if (CoreType.isNumber(value_dest)) {
				const blend = this._weight_from_distance(distance, distance_threshold, blend_with);
				return blend * value_dest + (1 - blend) * value_src;
			} else {
				console.warn('value is not a number', value_dest);
				return 0;
			}
		}
	}

	static _interpolate_with_multiple_points(
		point_dest: CorePoint,
		points_src: CorePoint[],
		attrib_name: string,
		distance_threshold: number,
		blend_with: number
	): number {
		const weighted_values_src = points_src.map((point_src) => {
			return this._interpolate_with_1_point(point_dest, point_src, attrib_name, distance_threshold, blend_with);
		});
		return ArrayUtils.max(weighted_values_src) || 0;
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

		const distance_total = ArrayUtils.sum(dist_to_positions);

		return [dist_to_positions[1] / distance_total, dist_to_positions[0] / distance_total];
	}

	static _weights_from_3(current_position: Vector3, other_positions: Vector3[]) {
		const dist_to_positions = other_positions.map((other_position) => current_position.distanceTo(other_position));

		const distance_total = ArrayUtils.sum([
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
