import {BaseMethod} from "./_Base";
export class CentroidExpression extends BaseMethod {
  constructor() {
    super(...arguments);
    this._require_dependency = true;
  }
  static required_arguments() {
    return [
      ["string", "path to node"],
      ["string", "component_name, x,y or z"]
    ];
  }
  find_dependency(index_or_path) {
    return this.create_dependency_from_index_or_path(index_or_path);
  }
  process_arguments(args) {
    return new Promise(async (resolve, reject) => {
      if (args.length == 2) {
        const index_or_path = args[0];
        const component_name = args[1];
        let container = null;
        try {
          container = await this.get_referenced_node_container(index_or_path);
        } catch (e) {
          reject(e);
        }
        if (container) {
          const bbox = container.bounding_box();
          const center = bbox.min.clone().add(bbox.max).multiplyScalar(0.5);
          const value = center[component_name];
          if (value != null) {
            resolve(value);
          } else {
            resolve(0);
          }
        }
      } else {
        resolve(0);
      }
    });
  }
}
