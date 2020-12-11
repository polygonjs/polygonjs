export class EventHelper {
  constructor(element) {
    this.element = element;
  }
  set_element(element) {
    this.element = element;
  }
  static element_position(event, element, position) {
    const dim = element.getBoundingClientRect();
    if (event.changedTouches) {
      event = event;
      const touch = event.changedTouches[0];
      position.x = touch.pageX - dim.x;
      position.y = touch.pageY - dim.y;
    } else {
      event = event;
      position.x = event.pageX - dim.x;
      position.y = event.pageY - dim.y;
    }
  }
  static normalized_position(event, element, position) {
    this.element_position(event, element, position);
    const dim = element.getBoundingClientRect();
    position.x = (position.x - window.scrollX) / dim.width * 2 - 1;
    position.y = -((position.y - window.scrollY) / dim.height * 2 - 1);
  }
  static normalized_position_0_1(event, element, position) {
    this.element_position(event, element, position);
    const dim = element.getBoundingClientRect();
    position.x = (position.x - window.scrollX) / dim.width;
    position.y = (position.y - window.scrollY) / dim.height;
  }
  element_position(event, position) {
    EventHelper.element_position(event, this.element, position);
  }
  normalized_position(event, position) {
    EventHelper.normalized_position(event, this.element, position);
  }
}
