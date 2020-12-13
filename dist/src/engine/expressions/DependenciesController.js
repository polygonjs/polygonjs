export class DependenciesController {
  constructor(param) {
    this.param = param;
    this.cyclic_graph_detected = false;
    this.method_dependencies = [];
  }
  set_error(message) {
    this.error_message = this.error_message || message;
  }
  reset() {
    this.param.graph_disconnect_predecessors();
    this.method_dependencies.forEach((method_dependency) => {
      method_dependency.reset();
    });
    this.method_dependencies = [];
  }
  update(function_generator) {
    this.cyclic_graph_detected = false;
    this.connect_immutable_dependencies(function_generator);
    this.method_dependencies = function_generator.method_dependencies;
    this.handle_method_dependencies();
    this.listen_for_name_changes();
  }
  connect_immutable_dependencies(function_generator) {
    function_generator.immutable_dependencies.forEach((dependency) => {
      if (this.cyclic_graph_detected == false) {
        if (this.param.add_graph_input(dependency) == false) {
          this.cyclic_graph_detected = true;
          this.set_error("cannot create expression, infinite graph detected");
          this.reset();
          return;
        }
      }
    });
  }
  handle_method_dependencies() {
    this.method_dependencies.forEach((method_dependency) => {
      if (this.cyclic_graph_detected == false) {
        this.handle_method_dependency(method_dependency);
      }
    });
  }
  handle_method_dependency(method_dependency) {
    const node_simple = method_dependency.resolved_graph_node;
    if (node_simple) {
      if (!this.param.add_graph_input(node_simple)) {
        this.cyclic_graph_detected = true;
        this.set_error("cannot create expression, infinite graph detected");
        this.reset();
        return;
      }
    }
  }
  listen_for_name_changes() {
    this.method_dependencies.forEach((method_dependency) => {
      method_dependency.listen_for_name_changes();
    });
  }
}
