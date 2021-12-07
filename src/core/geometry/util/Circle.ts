import {CoreMath} from '../../math/_Module';
import {Vector2} from 'three/src/math/Vector2';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';

interface PositionOptions {
	radius: number;
	segments: number;
	arcAngle?: number;
}
interface CreateOptions extends PositionOptions {
	connectLastPoint: boolean;
}

export class CoreGeometryUtilCircle {
	static positions(options: PositionOptions) {
		const {radius, segments} = options;
		const segmentsCount = segments;
		const arcAngle = options.arcAngle || 360;
		const radianPerSegment = CoreMath.degrees_to_radians(arcAngle) / segmentsCount;

		const positions = [];
		for (let i = 0; i < segmentsCount; i++) {
			const point_radian = radianPerSegment * i;
			const x = radius * Math.cos(point_radian);
			const y = radius * Math.sin(point_radian);

			positions.push(new Vector2(x, y));
		}

		return positions;
	}

	static create(options: CreateOptions) {
		const {segments} = options;
		const segmentsCount = segments;
		const positions2d = this.positions(options);

		const positions = [];
		const indices = [];
		let position2d;
		for (let i = 0; i < positions2d.length; i++) {
			position2d = positions2d[i];

			positions.push(position2d.x);
			positions.push(position2d.y);
			positions.push(0);

			if (i > 0) {
				indices.push(i - 1);
				indices.push(i);
			}
		}

		if (options.connectLastPoint) {
			// also add the last segment
			indices.push(segmentsCount - 1);
			indices.push(0);
		}

		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.setIndex(indices);

		return geometry;
	}
}
