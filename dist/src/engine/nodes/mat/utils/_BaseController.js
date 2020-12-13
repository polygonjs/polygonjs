export class BaseController {
  constructor(node) {
    this.node = node;
  }
  add_params() {
  }
  update() {
  }
  get material() {
    return this.node.material;
  }
}
