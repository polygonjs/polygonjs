export class TypedContainer {
  constructor(_node) {
    this._node = _node;
  }
  set_node(node) {
    this._node = node;
  }
  node() {
    return this._node;
  }
  set_content(content) {
    this._content = content;
    this._post_set_content();
  }
  has_content() {
    return this._content != null;
  }
  content() {
    return this._content;
  }
  _post_set_content() {
  }
  core_content() {
    return this._content;
  }
  core_content_cloned() {
    return this._content;
  }
  infos() {
    return [];
  }
}
export class BaseContainer extends TypedContainer {
}
