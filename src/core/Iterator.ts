type IterateeMethod = (element: any, index?: number) => void;
type IterateeMethodArray = IterateeMethod; // TODO: check this, as the element may be an array
type IterateeMethodCount = (index: number) => void;

interface CoreIteratorOptions {
	max_time_per_chunk?: number;
	check_every_interations?: number;
}

export class CoreIterator {
	// array
	private _array: any[] | undefined;
	private _iteratee_method_array: IterateeMethodArray | undefined;
	private _bound_next_with_array: (() => void) | undefined;
	private _current_array_element: any;
	private _array_index: number = 0;

	// count
	private _count: number = 0;
	private _iteratee_method_count: IterateeMethodCount | undefined;
	private _bound_next_with_count: (() => void) | undefined;
	private _current_count_index: number = 0;

	private _max_time_per_chunk: number;
	private _check_every_interations: number;

	private _resolve: null | (() => void) = null;

	constructor(options: CoreIteratorOptions = {}) {
		this._max_time_per_chunk = options.max_time_per_chunk || 10;
		this._check_every_interations = options.check_every_interations || 100;
	}

	async startWithCount(count: number, iteratee_method: IterateeMethodCount): Promise<void> {
		this._count = count;
		this._current_count_index = 0;
		this._iteratee_method_count = iteratee_method;
		this._bound_next_with_count = this.nextWithCount.bind(this);

		if (this._resolve) {
			throw 'an iterator cannot be started twice';
		}
		return new Promise((resolve: () => void, reject) => {
			this._resolve = resolve;
			this.nextWithCount();
		});
	}
	nextWithCount() {
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

	//
	//
	// ARRAY
	//
	//
	async startWithArray(array: any[], iteratee_method: IterateeMethod): Promise<void> {
		this._array = array;
		this._array_index = 0;
		this._iteratee_method_array = iteratee_method;
		this._bound_next_with_array = this.nextWithArray.bind(this);

		if (this._resolve) {
			throw 'an iterator cannot be started twice';
		}
		return new Promise((resolve: () => void, reject) => {
			this._resolve = resolve;
			this.nextWithArray();
		});
	}
	nextWithArray() {
		const start_time = performance.now();

		if (this._iteratee_method_array && this._bound_next_with_array && this._array) {
			while ((this._current_array_element = this._array[this._array_index])) {
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

		if (this._current_array_element === undefined) {
			if (this._resolve) {
				this._resolve();
			}
		}
	}
}
