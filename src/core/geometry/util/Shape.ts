// import {CoreGeometryUtilCircle} from './Circle';
// import {ShapeBufferGeometry} from 'three/src/geometries/ShapeGeometry';
// import {Shape} from 'three/src/extras/core/Shape';
// import {Vector3} from 'three/src/math/Vector3';

// export class CoreGeometryUtilShape {
// 	static geometry_from_points(positions: Vector3[]) {
// 		const positions_2d = CoreGeometryUtilCircle.positions(1, positions.length);

// 		const shape = new Shape();

// 		const first_position_2d = positions_2d[0];
// 		shape.moveTo(first_position_2d.x, first_position_2d.y);
// 		positions_2d.forEach((position_2d, i) => {
// 			if (i > 0) {
// 				shape.lineTo(position_2d.x, position_2d.y);
// 			}
// 		});

// 		const geometry = new ShapeBufferGeometry(shape);

// 		const position_array = geometry.attributes['position'].array as number[];
// 		positions.forEach(function (position, i) {
// 			// const position = point.position()
// 			position_array[3 * i + 0] = position.x;
// 			position_array[3 * i + 1] = position.y;
// 			position_array[3 * i + 2] = position.z;
// 		});

// 		return geometry;
// 	}
// }
