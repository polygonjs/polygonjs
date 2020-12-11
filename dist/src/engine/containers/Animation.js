import {TypedContainer} from "./_Base";
export class AnimationContainer extends TypedContainer {
  set_content(content) {
    super.set_content(content);
  }
  set_timeline_builder(timeline_builder) {
    return this.set_content(timeline_builder);
  }
  timeline_builder() {
    return this.content();
  }
  core_content_cloned() {
    if (this._content) {
      return this._content.clone();
    }
  }
}
