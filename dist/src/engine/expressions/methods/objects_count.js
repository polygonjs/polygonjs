import {BaseMethod} from "./_Base";
export class ObjectsCountExpression extends BaseMethod {
  constructor() {
    super(...arguments);
    this._require_dependency = true;
  }
  static required_arguments() {
    return [["string", "path to node"]];
  }
  find_dependency(index_or_path) {
    return this.create_dependency_from_index_or_path(index_or_path);
  }
  process_arguments(args) {
    return new Promise(async (resolve, reject) => {
      if (args.length == 1) {
        const index_or_path = args[0];
        let container;
        try {
          container = await this.get_referenced_node_container(index_or_path);
        } catch (e) {
          reject(e);
          return;
        }
        if (container) {
          const value = container.objects_count();
          resolve(value);
        }
      } else {
        resolve(0);
      }
    });
  }
}
