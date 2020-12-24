import {Vector2} from 'three/src/math/Vector2'
import {BufferGeometry} from 'three/src/core/BufferGeometry'
import {BufferAttribute} from 'three/src/core/BufferAttribute'

export class CoreGeometryOperationHexagon {
	constructor(
		private _param_size: Vector2,
		private _param_hexagon_radius: number,
		private _param_points_only: boolean
	) {}

	process(): BufferGeometry {
		const side_length = this._param_hexagon_radius
		const half_side_length = side_length * 0.5
		const step_size = {
			x: side_length,
			y: Math.cos(Math.PI / 6) * this._param_hexagon_radius,
		}
		const steps_count = {
			x: Math.floor(this._param_size.x / step_size.x),
			y: Math.floor(this._param_size.y / step_size.y),
		}
		let positions:number[][] = []
		let indices:number[][] = []
		for (let y = 0; y < steps_count.y; y++) {
			for (let x = 0; x < steps_count.x; x++) {
				positions.push([
					-(this._param_size.x * 0.5) +
						x * step_size.x +
						(y % 2 == 0 ? half_side_length : 0),
					0,
					-(this._param_size.y * 0.5) + y * step_size.y,
				])

				if (!this._param_points_only) {
					if (y >= 1) {
						if (x == 0 || x == steps_count.x - 1) {
							if (x == 0) {
								indices.push([
									x + 1 + (y - 1) * steps_count.x,
									x + (y - 1) * steps_count.x,
									x + y * steps_count.x,
								])
							} else {
								indices.push([
									x + y * steps_count.x,
									x + (y - 1) * steps_count.x,
									x - 1 + y * steps_count.x,
								])
							}
						} else {
							indices.push([
								x + y * steps_count.x,
								x + (y - 1) * steps_count.x,
								x - 1 + y * steps_count.x,
							])
							indices.push([
								x + y * steps_count.x,
								x + 1 + (y - 1) * steps_count.x,
								x + (y - 1) * steps_count.x,
							])
						}
					}
				}
			}
		}

		const geometry = new BufferGeometry()
		geometry.setAttribute(
			'position',
			new BufferAttribute(new Float32Array(positions.flat()), 3)
		);

		if (!this._param_points_only) {
			geometry.setIndex(indices.flat());
			geometry.computeVertexNormals();
		}

		return geometry
	}
}
