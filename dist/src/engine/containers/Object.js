import {TypedContainer} from "./_Base";
export class ObjectContainer extends TypedContainer {
  set_content(content) {
    super.set_content(content);
  }
  set_object(object) {
    return this.set_content(object);
  }
  has_object() {
    return this.has_content();
  }
  object() {
    return this.content();
  }
}
