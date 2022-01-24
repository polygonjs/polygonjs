import {PolyhedronBufferGeometry} from './Polyhedron';

// from three/src/geometries/TetrahedronGeometry
export class TetrahedronBufferGeometry extends PolyhedronBufferGeometry {
	override parameters: any; //{radius: number, detail:number}
	constructor(radius: number, detail: number, points_only: boolean) {
		const vertices = [1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1];

		const indices = [2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1];

		super(vertices, indices, radius, detail, points_only);

		this.type = 'TetrahedronBufferGeometry';

		this.parameters = {
			radius: radius,
			detail: detail,
		};
	}
}
