import {BaseSopOperation} from "./_Base";
import {SubdivisionModifier as SubdivisionModifier2} from "../../../modules/three/examples/jsm/modifiers/SubdivisionModifier";
export class SubdivideSopOperation extends BaseSopOperation {
  static type() {
    return "subdivide";
  }
  cook(input_contents, params) {
    const core_group = input_contents[0];
    const modifier = new SubdivisionModifier2(params.subdivisions);
    for (let object of core_group.objects()) {
      const geometry = object.geometry;
      if (geometry) {
        const subdivided_geometry = modifier.modify(geometry);
        object.geometry = subdivided_geometry;
      }
    }
    return core_group;
  }
}
SubdivideSopOperation.DEFAULT_PARAMS = {
  subdivisions: 1
};
