import {
	BufferGeometry,
	Geometry
} from 'three';

export class SubdivisionModifier {

	constructor( subdivisions?: number );
	subdivisions: number;

	modify( geometry: BufferGeometry | Geometry ): Geometry;
	smooth( geometry: Geometry ): void;

}
