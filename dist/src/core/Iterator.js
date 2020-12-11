export class CoreIterator {
  constructor(options = {}) {
    this._array_index = 0;
    this._count = 0;
    this._current_count_index = 0;
    this._resolve = null;
    this._max_time_per_chunk = options.max_time_per_chunk || 10;
    this._check_every_interations = options.check_every_interations || 100;
  }
  async start_with_count(count, iteratee_method) {
    this._count = count;
    this._current_count_index = 0;
    this._iteratee_method_count = iteratee_method;
    this._bound_next_with_count = this.next_with_count.bind(this);
    if (this._resolve) {
      throw "an iterator cannot be started twice";
    }
    return new Promise((resolve, reject) => {
      this._resolve = resolve;
      this.next_with_count();
    });
  }
  next_with_count() {
    const start_time = performance.now();
    if (this._iteratee_method_count && this._bound_next_with_count) {
      while (this._current_count_index < this._count) {
        this._iteratee_method_count(this._current_count_index);
        this._current_count_index++;
        if (this._current_count_index % this._check_every_interations == 0) {
          if (performance.now() - start_time > this._max_time_per_chunk) {
            setTimeout(this._bound_next_with_count, 1);
            break;
          }
        }
      }
    }
    if (this._current_count_index >= this._count) {
      if (this._resolve) {
        this._resolve();
      }
    }
  }
  async start_with_array(array, iteratee_method) {
    this._array = array;
    this._array_index = 0;
    this._iteratee_method_array = iteratee_method;
    this._bound_next_with_array = this.next_with_array.bind(this);
    if (this._resolve) {
      throw "an iterator cannot be started twice";
    }
    return new Promise((resolve, reject) => {
      this._resolve = resolve;
      this.next_with_array();
    });
  }
  next_with_array() {
    const start_time = performance.now();
    if (this._iteratee_method_array && this._bound_next_with_array && this._array) {
      while (this._current_array_element = this._array[this._array_index]) {
        this._iteratee_method_array(this._current_array_element, this._array_index);
        this._array_index++;
        if (this._array_index % this._check_every_interations == 0) {
          if (performance.now() - start_time > this._max_time_per_chunk) {
            setTimeout(this._bound_next_with_array, 1);
            break;
          }
        }
      }
    }
    if (this._current_array_element === void 0) {
      if (this._resolve) {
        this._resolve();
      }
    }
  }
}
