import lodash_sum from 'lodash/sum'

import {Vector3} from 'three/src/math/Vector3'
import {Vector2} from 'three/src/math/Vector2'
import {Triangle} from 'three/src/math/Triangle'
import {BufferGeometry} from 'three/src/core/BufferGeometry'
import {BufferAttribute} from 'three/src/core/BufferAttribute'
// const THREE = {BufferGeometry, Triangle, Vector2, Vector3}
import {CorePoint} from './Point'
import {CoreGeometry} from './Geometry'
import {CoreMath} from 'src/core/math/_Module'
// import {CoreInterpolate} from 'src/core/Math/Interpolate'

interface FaceLike {
	a: number
	b: number
	c: number
}

export class CoreFace {
	_geometry: BufferGeometry
	_points: [CorePoint, CorePoint, CorePoint]
	_triangle: Triangle
	_positions: Vector3[]
	_deltas: Vector3[]

	constructor(private _core_geometry: CoreGeometry, private _index: number) {
		this._geometry = this._core_geometry.geometry()
	}
	index() {
		return this._index
	}

	points(): [CorePoint, CorePoint, CorePoint] {
		const index_array = this._geometry.index.array
		const start = this._index * 3
		return [
			new CorePoint(this._core_geometry, index_array[start + 0]),
			new CorePoint(this._core_geometry, index_array[start + 1]),
			new CorePoint(this._core_geometry, index_array[start + 2]),
		]
	}
	positions(): [Vector3, Vector3, Vector3] {
		const points = this.points()
		return [
			points[0].position(),
			points[1].position(),
			points[2].position(),
		]
	}
	triangle(): Triangle {
		const positions = this.positions()
		return new Triangle(positions[0], positions[1], positions[2])
	}

	area(): number {
		return this.triangle().getArea()
	}
	center(target: Vector3) {
		const positions = this.positions()
		target.x = (positions[0].x + positions[1].x + positions[2].x) / 3
		target.y = (positions[0].y + positions[1].y + positions[2].y) / 3
		target.z = (positions[0].z + positions[1].z + positions[2].z) / 3

		return target
	}

	random_position(seed: number) {
		let weights = [
			CoreMath.rand_float(seed),
			CoreMath.rand_float(seed * 6541),
		]
		this._positions =
			this._positions || this.points().map((p) => p.position())
		this._deltas = this._deltas || [
			this._positions[1].clone().sub(this._positions[0]),
			this._positions[2].clone().sub(this._positions[0]),
		]

		if (weights[0] + weights[1] > 1) {
			weights[0] = 1 - weights[0]
			weights[1] = 1 - weights[1]
		}

		return this._positions[0]
			.clone()
			.add(this._deltas[0].clone().multiplyScalar(weights[0]))
			.add(this._deltas[1].clone().multiplyScalar(weights[1]))
	}
	// random_position(seed: number){
	// 	let weights = [
	// 		CoreMath.rand_float(seed),
	// 		CoreMath.rand_float(seed*524),
	// 		CoreMath.rand_float(seed*4631)
	// 	]
	// 	const sum = lodash_sum(weights)
	// 	weights = weights.map(w=>w/sum)
	// 	const pos = new Vector3()
	// 	let positions = this.positions().map((p,i)=> p.multiplyScalar(weights[i]))
	// 	positions.forEach(p=>{
	// 		pos.add(p)
	// 	})
	// 	return pos
	// }

	attrib_value_at_position(attrib_name: string, position: Vector3) {
		this._points = this._points || this.points()
		this._positions =
			this._positions || this._points.map((p) => p.position())
		this._triangle =
			this._triangle ||
			new Triangle(
				this._positions[0],
				this._positions[1],
				this._positions[2]
			)

		// const weights = CoreInterpolate._weights_from_3(position, this._positions)
		const barycentric_coordinates = new Vector3()
		this._triangle.getBarycoord(position, barycentric_coordinates)
		const weights = barycentric_coordinates.toArray()

		const attrib = this._geometry.attributes[attrib_name]
		const attrib_size = attrib.itemSize
		const point_values = this._points.map((point) =>
			point.attrib_value(attrib_name)
		)

		let new_attrib_value
		let sum
		let index = 0
		switch (attrib_size) {
			case 1: {
				sum = 0
				for (let point_value of point_values) {
					sum += point_value * weights[index]
					index++
				}
				new_attrib_value = sum
				break
			}
			default: {
				for (let point_value of point_values) {
					const weighted_value = point_value.multiplyScalar(
						weights[index]
					)
					if (sum) {
						sum.add(weighted_value)
					} else {
						sum = weighted_value
					}
					index++
				}
				new_attrib_value = sum
			}
		}
		return new_attrib_value
	}

	static interpolated_value(
		geometry: BufferGeometry,
		face: FaceLike,
		intersect_point: Vector3,
		attrib: BufferAttribute
	) {
		// let point_index, i, sum
		const point_indices = [face.a, face.b, face.c]
		const position_attrib = geometry.getAttribute('position')
		const position_attrib_array = position_attrib.array
		const point_positions = point_indices.map(
			(point_index) =>
				new Vector3(
					position_attrib_array[point_index * 3 + 0],
					position_attrib_array[point_index * 3 + 1],
					position_attrib_array[point_index * 3 + 2]
				)
		)

		const attrib_size = attrib.itemSize
		const attrib_array = attrib.array
		let attrib_values: NumericAttribValue[] = []
		switch (attrib_size) {
			case 1:
				attrib_values = point_indices.map(
					(point_index) => attrib_array[point_index]
				)
				break
			case 2:
				attrib_values = point_indices.map(
					(point_index) =>
						new Vector2(
							attrib_array[point_index * 2 + 0],
							attrib_array[point_index * 2 + 1]
						)
				)
				break
			case 3:
				attrib_values = point_indices.map(
					(point_index) =>
						new Vector3(
							attrib_array[point_index * 3 + 0],
							attrib_array[point_index * 3 + 1],
							attrib_array[point_index * 3 + 2]
						)
				)
				break
		}

		const dist_to_points = point_indices.map((point_index, i) =>
			intersect_point.distanceTo(point_positions[i])
		)

		// https://math.stackexchange.com/questions/1336386/weighted-average-distance-between-3-or-more-points
		// TODO: replace this with Core.Math.Interpolate
		const distance_total = lodash_sum([
			dist_to_points[0] * dist_to_points[1],
			dist_to_points[0] * dist_to_points[2],
			dist_to_points[1] * dist_to_points[2],
		])

		const weights = [
			(dist_to_points[1] * dist_to_points[2]) / distance_total,
			(dist_to_points[0] * dist_to_points[2]) / distance_total,
			(dist_to_points[0] * dist_to_points[1]) / distance_total,
		]

		let new_attrib_value
		switch (attrib_size) {
			case 1:
				new_attrib_value = lodash_sum(
					point_indices.map(
						(point_indx, i) =>
							weights[i] * (attrib_values[i] as number)
					)
				)
				break
			default:
				var values = point_indices.map((point_index, i) =>
					(attrib_values[i] as Vector3).multiplyScalar(weights[i])
				)
				new_attrib_value = null
				for (let value of values) {
					if (new_attrib_value) {
						new_attrib_value.add(value)
					} else {
						new_attrib_value = value
					}
				}
		}

		return new_attrib_value
	}
}
