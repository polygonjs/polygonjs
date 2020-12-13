export class HelperController {
  constructor(node, _helper_constructor, _name) {
    this.node = node;
    this._helper_constructor = _helper_constructor;
    this._name = _name;
  }
  initialize_node() {
    this.node.flags.display.add_hook(() => {
      this.update();
    });
  }
  get helper() {
    if (this.node.flags.display.active) {
      return this._helper = this._helper || this._create_helper();
    }
  }
  get visible() {
    return this.node.flags.display.active && this.node.pv.show_helper;
  }
  _create_helper() {
    const helper = new this._helper_constructor(this.node, this._name);
    helper.object.matrixAutoUpdate = false;
    helper.build();
    return helper;
  }
  update() {
    if (this.visible) {
      if (!this._helper) {
        this._helper = this._create_helper();
      }
      if (this._helper) {
        this.node.light.add(this._helper.object);
        this._helper.update();
      }
    } else {
      if (this._helper) {
        this.node.light.remove(this._helper.object);
      }
    }
  }
}
