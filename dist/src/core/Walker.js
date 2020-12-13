const TypedPathParamValue2 = class {
  constructor(_path = "") {
    this._path = _path;
    this._node = null;
  }
  set_path(path) {
    this._path = path;
  }
  set_node(node) {
    this._node = node;
  }
  path() {
    return this._path;
  }
  node() {
    return this._node;
  }
  resolve(node_start) {
    this._node = CoreWalker.find_node(node_start, this._path);
  }
  clone() {
    const cloned = new TypedPathParamValue2(this._path);
    cloned.set_node(this._node);
    return cloned;
  }
  ensure_node_context(context, error_state) {
    const found_node = this.node();
    if (!found_node) {
      error_state?.set(`no node found at ${this.path()}`);
      return;
    }
    const node_context = found_node.node_context();
    if (node_context == context) {
      return found_node;
    } else {
      error_state?.set(`expected ${context} node, but got a ${node_context}`);
      return;
    }
  }
};
export let TypedPathParamValue = TypedPathParamValue2;
TypedPathParamValue.DEFAULT = {
  UV: "/COP/file_uv",
  ENV_MAP: "/COP/env_map"
};
const CoreWalker2 = class {
  static split_parent_child(path) {
    const elements = path.split(CoreWalker2.SEPARATOR).filter((e) => e.length > 0);
    const child_path = elements.pop();
    const parent_path = elements.join(CoreWalker2.SEPARATOR);
    return {parent: parent_path, child: child_path};
  }
  static find_node(node_src, path, decomposed_path) {
    if (!node_src) {
      return null;
    }
    const elements = path.split(CoreWalker2.SEPARATOR).filter((e) => e.length > 0);
    const first_element = elements[0];
    let next_node = null;
    if (path[0] === CoreWalker2.SEPARATOR) {
      const path_from_root = path.substr(1);
      next_node = this.find_node(node_src.root, path_from_root, decomposed_path);
    } else {
      switch (first_element) {
        case CoreWalker2.PARENT:
          decomposed_path?.add_path_element(first_element);
          next_node = node_src.parent;
          break;
        case CoreWalker2.CURRENT:
          decomposed_path?.add_path_element(first_element);
          next_node = node_src;
          break;
        default:
          next_node = node_src.node(first_element);
          if (next_node) {
            decomposed_path?.add_node(first_element, next_node);
          }
      }
      if (next_node != null && elements.length > 1) {
        const remainder = elements.slice(1).join(CoreWalker2.SEPARATOR);
        next_node = this.find_node(next_node, remainder, decomposed_path);
      }
      return next_node;
    }
    return next_node;
  }
  static find_param(node_src, path, decomposed_path) {
    if (!node_src) {
      return null;
    }
    const elements = path.split(CoreWalker2.SEPARATOR);
    if (elements.length === 1) {
      return node_src.params.get(elements[0]);
    } else {
      const node_path = elements.slice(0, +(elements.length - 2) + 1 || void 0).join(CoreWalker2.SEPARATOR);
      const node = this.find_node(node_src, node_path, decomposed_path);
      if (node != null) {
        const param_name = elements[elements.length - 1];
        const param = node.params.get(param_name);
        if (decomposed_path && param) {
          decomposed_path.add_node(param_name, param);
        }
        return param;
      } else {
        return null;
      }
    }
  }
  static relative_path(src_graph_node, dest_graph_node) {
    const parent = this.closest_common_parent(src_graph_node, dest_graph_node);
    if (!parent) {
      return dest_graph_node.full_path();
    } else {
      const distance = this.distance_to_parent(src_graph_node, parent);
      let up = "";
      if (distance - 1 > 0) {
        let i = 0;
        const ups = [];
        while (i++ < distance - 1) {
          ups.push(CoreWalker2.PARENT);
        }
        up = ups.join(CoreWalker2.SEPARATOR) + CoreWalker2.SEPARATOR;
      }
      const parent_path_elements = parent.full_path().split(CoreWalker2.SEPARATOR).filter((e) => e.length > 0);
      const dest_path_elements = dest_graph_node.full_path().split(CoreWalker2.SEPARATOR).filter((e) => e.length > 0);
      const remaining_elements = [];
      let cmptr = 0;
      for (let dest_path_element of dest_path_elements) {
        if (!parent_path_elements[cmptr]) {
          remaining_elements.push(dest_path_element);
        }
        cmptr++;
      }
      const down = remaining_elements.join(CoreWalker2.SEPARATOR);
      return `${up}${down}`;
    }
  }
  static closest_common_parent(graph_node1, graph_node2) {
    const parents1 = this.parents(graph_node1).reverse();
    const parents2 = this.parents(graph_node2).reverse();
    const min_depth = Math.min(parents1.length, parents2.length);
    let found_parent = null;
    for (let i = 0; i < min_depth; i++) {
      if (parents1[i].graph_node_id == parents2[i].graph_node_id) {
        found_parent = parents1[i];
      }
    }
    return found_parent;
  }
  static parents(graph_node) {
    const parents = [];
    let parent = graph_node.parent;
    while (parent) {
      parents.push(parent);
      parent = parent.parent;
    }
    return parents;
  }
  static distance_to_parent(graph_node, dest) {
    let distance = 0;
    let current = graph_node;
    const dest_id = dest.graph_node_id;
    while (current && current.graph_node_id != dest_id) {
      distance += 1;
      current = current.parent;
    }
    if (current && current.graph_node_id == dest_id) {
      return distance;
    } else {
      return -1;
    }
  }
  static make_absolute_path(node_src, path) {
    if (path[0] == CoreWalker2.SEPARATOR) {
      return path;
    }
    const path_elements = path.split(CoreWalker2.SEPARATOR);
    const first_element = path_elements.shift();
    if (first_element) {
      switch (first_element) {
        case "..": {
          if (node_src.parent) {
            return this.make_absolute_path(node_src.parent, path_elements.join(CoreWalker2.SEPARATOR));
          } else {
            return null;
          }
        }
        case ".": {
          return this.make_absolute_path(node_src, path_elements.join(CoreWalker2.SEPARATOR));
        }
        default: {
          return [node_src.full_path(), path].join(CoreWalker2.SEPARATOR);
        }
      }
    } else {
      return node_src.full_path();
    }
  }
};
export let CoreWalker = CoreWalker2;
CoreWalker.SEPARATOR = "/";
CoreWalker.DOT = ".";
CoreWalker.CURRENT = CoreWalker2.DOT;
CoreWalker.PARENT = "..";
CoreWalker.CURRENT_WITH_SLASH = `${CoreWalker2.CURRENT}/`;
CoreWalker.PARENT_WITH_SLASH = `${CoreWalker2.PARENT}/`;
CoreWalker.NON_LETTER_PREFIXES = [CoreWalker2.SEPARATOR, CoreWalker2.DOT];
