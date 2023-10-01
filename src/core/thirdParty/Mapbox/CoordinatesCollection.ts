import type {Vector2} from 'three';
import {arrayMin} from '../../ArrayUtils';

export class CoordinatesCollection {
	constructor(public coordinates: Vector2[]) {}
	first() {
		return this.coordinates[0];
	}
	last() {
		return this.coordinates[this.coordinates.length - 1];
	}
	private distanceTo(features_coordinates: CoordinatesCollection): number {
		const d00 = this.first().distanceTo(features_coordinates.first());
		const d01 = this.first().distanceTo(features_coordinates.last());
		const d10 = this.last().distanceTo(features_coordinates.first());
		const d11 = this.last().distanceTo(features_coordinates.last());
		return arrayMin([d00, d01, d10, d11]) as number;
	}
	// previous_id(features_coordinates_array: CoordinatesCollection[]): number{
	// }
	next_id(features_coordinates_array: CoordinatesCollection[]): number {
		let nearest_id = -1;
		let dist = -1;
		let i = 0;
		for (const features_coordinates of features_coordinates_array) {
			const current_dist = this.distanceTo(features_coordinates);
			if (dist == -1 || current_dist < dist) {
				dist = current_dist;
				nearest_id = i;
			}
			i += 1;
		}
		return nearest_id;
	}
	perimeter(): number {
		let perimeter = 0;
		let prev_coordinate = this.coordinates[0];
		for (const coordinate of this.coordinates) {
			perimeter += coordinate.distanceTo(prev_coordinate);
			prev_coordinate = coordinate;
		}

		return perimeter;
	}

	static sort(features_coordinates_array: CoordinatesCollection[]): CoordinatesCollection[] {
		let current_feature = features_coordinates_array.shift() as CoordinatesCollection;
		const remaining_features = features_coordinates_array;
		const sorted_features = [current_feature];

		while (remaining_features.length > 0) {
			const next_id = current_feature.next_id(remaining_features);
			current_feature = remaining_features.splice(next_id, 1)[0];
			sorted_features.push(current_feature);
		}
		return sorted_features;
	}
}
