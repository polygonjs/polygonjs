import {CoreMath} from '../../math/_Module'
import {Vector2} from 'three/src/math/Vector2'
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute'
import {BufferGeometry} from 'three/src/core/BufferGeometry'

export class CoreGeometryUtilCircle {
	static positions(
		radius: number,
		segments_count: number,
		arc_angle: number = 360
	) {
		const radian_per_segment =
			CoreMath.degrees_to_radians(arc_angle) / segments_count

		const positions = []
		for (let i = 0; i < segments_count; i++) {
			const point_radian = radian_per_segment * i
			const x = radius * Math.cos(point_radian)
			const y = radius * Math.sin(point_radian)

			positions.push(new Vector2(x, y))
		}

		return positions
	}

	static create(
		radius: number,
		segments_count: number,
		arc_angle: number = 360
	) {
		const positions_2d = this.positions(radius, segments_count, arc_angle)

		const positions = []
		const indices = []
		let position_2d
		for (let i = 0; i < positions_2d.length; i++) {
			position_2d = positions_2d[i]

			positions.push(position_2d.x)
			positions.push(position_2d.y)
			positions.push(0)

			if (i > 0) {
				indices.push(i - 1)
				indices.push(i)
			}
		}

		// also add the last segment
		indices.push(segments_count - 1)
		indices.push(0)

		const geometry = new BufferGeometry()
		geometry.setAttribute(
			'position',
			new Float32BufferAttribute(positions, 3)
		)
		geometry.setIndex(indices)

		return geometry
	}
}
