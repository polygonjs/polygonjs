import {BufferGeometry} from 'three';
import {Geometry} from '../deprecated/Geometry';

export class SubdivisionModifier {
	constructor(subdivisions?: number);
	subdivisions: number;

	modify(geometry: Geometry | BufferGeometry): Geometry | BufferGeometry;
	smooth(geometry: Geometry): void;
}
