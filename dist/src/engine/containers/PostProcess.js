import {TypedContainer} from "./_Base";
export class PostProcessContainer extends TypedContainer {
  set_content(content) {
    super.set_content(content);
  }
  render_pass() {
    return this._content;
  }
  object(options = {}) {
    return this.render_pass();
  }
}
