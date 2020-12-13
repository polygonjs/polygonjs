export class EntitySelectionHelper {
  constructor(node) {
    this.node = node;
    this.selected_state = new Map();
    this._entities_count = 0;
    this._selected_entities_count = 0;
  }
  init(entities) {
    this.selected_state.clear();
    for (let entity of entities) {
      this.selected_state.set(entity, false);
    }
    this._entities_count = entities.length;
    this._selected_entities_count = 0;
  }
  select(entity) {
    const state = this.selected_state.get(entity);
    if (state != null) {
      if (state == false) {
        this.selected_state.set(entity, true);
        this._selected_entities_count++;
      }
    }
  }
  entities_to_keep() {
    return this._entities_for_state(this.node.pv.invert);
  }
  entities_to_delete() {
    return this._entities_for_state(!this.node.pv.invert);
  }
  _entities_for_state(state) {
    const required_state = state ? true : false;
    const array_size = state ? this._selected_entities_count : this._entities_count - this._selected_entities_count;
    if (array_size == 0) {
      return [];
    } else {
      const array = new Array(array_size);
      let i = 0;
      this.selected_state.forEach((state2, entity) => {
        if (state2 == required_state) {
          array[i] = entity;
          i++;
        }
      });
      return array;
    }
  }
}
