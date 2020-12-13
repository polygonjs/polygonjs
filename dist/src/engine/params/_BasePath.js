import {TypedParam} from "./_Base";
import {DecomposedPath as DecomposedPath2} from "../../core/DecomposedPath";
export class TypedPathParam extends TypedParam {
  constructor() {
    super(...arguments);
    this.decomposed_path = new DecomposedPath2();
  }
}
