import {PolyhedronBufferGeometry} from "./Polyhedron";
export class TetrahedronBufferGeometry extends PolyhedronBufferGeometry {
  constructor(radius, detail, points_only) {
    const vertices = [1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1];
    const indices = [2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1];
    super(vertices, indices, radius, detail, points_only);
    this.type = "TetrahedronBufferGeometry";
    this.parameters = {
      radius,
      detail
    };
  }
}
