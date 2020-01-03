type IterateeMethod = (element: any, index?: number) => void
type IterateeMethodArray = IterateeMethod // TODO: check this, as the element may be an array
type IterateeMethodCount = (index: number) => {}

interface CoreIteratorOptions {
	max_time_per_chunk: number
	check_every_interations: number
}

export class CoreIterator {
	// array
	private _array: any[]
	private _iteratee_method_array: IterateeMethodArray
	private _bound_next_with_array: () => {}
	private _current_array_element: any
	private _array_index: number = 0

	// count
	private _count: number
	private _iteratee_method_count: IterateeMethodCount
	private _bound_next_with_count: () => {}
	private _current_count_index: number

	private _max_time_per_chunk: number
	private _check_every_interations: number

	private _resolve: () => void

	constructor(options: CoreIteratorOptions) {
		this._max_time_per_chunk = options.max_time_per_chunk || 10
		this._check_every_interations = options.check_every_interations || 100
	}

	async start_with_count(
		count: number,
		iteratee_method: IterateeMethodCount
	) {
		this._count = count
		this._current_count_index = 0
		this._iteratee_method_count = iteratee_method
		this._bound_next_with_count = this.next_with_count.bind(this)

		if (this._resolve) {
			throw 'an iterator cannot be started twice'
		}
		return new Promise((resolve, reject) => {
			this._resolve = resolve
			this.next_with_count()
		})
	}
	next_with_count() {
		const start_time = performance.now()

		while (this._current_count_index < this._count) {
			this._iteratee_method_count(this._current_count_index)

			this._current_count_index++

			if (
				this._current_count_index % this._check_every_interations ==
				0
			) {
				if (performance.now() - start_time > this._max_time_per_chunk) {
					setTimeout(this._bound_next_with_count, 1)
					break
				}
			}
		}

		if (this._current_count_index >= this._count) {
			this._resolve()
		}
	}

	//
	//
	// ARRAY
	//
	//
	async start_with_array(array: any[], iteratee_method: IterateeMethod) {
		this._array = array
		this._array_index = 0
		this._iteratee_method_array = iteratee_method
		this._bound_next_with_array = this.next_with_array.bind(this)

		if (this._resolve) {
			throw 'an iterator cannot be started twice'
		}
		return new Promise((resolve, reject) => {
			this._resolve = resolve
			this.next_with_array()
		})
	}
	next_with_array() {
		const start_time = performance.now()

		while ((this._current_array_element = this._array[this._array_index])) {
			this._iteratee_method_array(
				this._current_array_element,
				this._array_index
			)

			this._array_index++

			if (this._array_index % this._check_every_interations == 0) {
				if (performance.now() - start_time > this._max_time_per_chunk) {
					setTimeout(this._bound_next_with_array, 1)
					break
				}
			}
		}

		if (this._current_array_element === undefined) {
			this._resolve()
		}
	}
}
