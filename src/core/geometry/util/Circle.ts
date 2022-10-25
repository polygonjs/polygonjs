import {degToRad} from '../../math/_Module';
import {Vector2} from 'three';
import {Float32BufferAttribute} from 'three';
import {BufferGeometry} from 'three';

export interface CirclePositionOptions {
	radius: number;
	segments: number;
	arcAngle?: number;
}
export interface CircleCreateOptions extends CirclePositionOptions {
	connectLastPoint: boolean;
}

export class CoreGeometryUtilCircle {
	static positions(options: CirclePositionOptions) {
		const {radius, segments} = options;
		const arcAngle = options.arcAngle || 360;
		const segmentsCount = segments + 1;
		const radianPerSegment = degToRad(arcAngle) / (segmentsCount - 1);

		const positions = [];
		for (let i = 0; i < segmentsCount; i++) {
			const pointRadian = radianPerSegment * i;
			const x = radius * Math.cos(pointRadian);
			const y = radius * Math.sin(pointRadian);

			if (!(arcAngle == 360 && i == segmentsCount - 1)) {
				positions.push(new Vector2(x, y));
			}
		}

		return positions;
	}

	static create(options: CircleCreateOptions) {
		const {segments, arcAngle} = options;
		let {connectLastPoint} = options;
		if (arcAngle == 360) {
			connectLastPoint = true;
		}
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

		if (connectLastPoint) {
			// also add the last segment
			if (arcAngle == 360) {
				indices.push(segmentsCount - 1);
			} else {
				indices.push(segmentsCount);
			}
			indices.push(0);
		}

		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.setIndex(indices);

		return geometry;
	}
}
