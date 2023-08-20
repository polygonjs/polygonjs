export declare type TypedArray =
	| Uint8Array
	| Int8Array
	| Uint16Array
	| Int16Array
	| Uint32Array
	| Int32Array
	| Float32Array
	| Float64Array;

export interface TypedArrayConstructor<T> {
	new (length: number): T;
	new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): T;
}

export class BoolArray {
	private buf: Uint8Array;

	public readonly length: number;

	constructor(length: number) {
		this.length = length;
		this.buf = new Uint8Array(Math.ceil(length / 8));
	}

	check(x: number) {
		if (x < 0 || x >= this.length || !Number.isInteger(x)) debugger;
	}

	get(x: number) {
		// this.check(x);
		const mask = 1 << x % 8;
		return Boolean(this.buf[x >>> 3] & mask);
	}

	set(x: number, value: boolean) {
		// this.check(x);

		const mask = 1 << x % 8;
		value
			? (this.buf[x >>> 3] |= mask) // set bit
			: (this.buf[x >>> 3] &= 0xff ^ mask); // clear bit
	}

	fill() {
		this.buf.fill(0xff);
	}

	clear() {
		this.buf.fill(0);
	}

	copy(other: BoolArray) {
		if (this.length !== other.length) throw Error('Mismatched dimension');
		this.buf.set(other.buf);
	}
}

export class BoolArray2DRow {
	private readonly ref: BoolArray2D;
	private readonly y: number;

	constructor(ref: BoolArray2D, y: number) {
		this.ref = ref;
		this.y = y;
	}

	get(x: number) {
		return this.ref.get(x, this.y);
	}

	set(x: number, value: boolean) {
		this.ref.set(x, this.y, value);
	}
}

// when will google add a BitSet class sigh
export class BoolArray2D {
	private buf: Uint8Array;

	private readonly MX: number;
	private readonly MY: number;

	public get ROWS() {
		return this.MY;
	}

	public get COLS() {
		return this.MX;
	}

	constructor(x: number, y: number) {
		this.MX = x;
		this.MY = y;
		this.buf = new Uint8Array(Math.ceil((x * y) / 8));
	}

	check(x: number, y: number) {
		if (x < 0 || x >= this.MX || !Number.isInteger(x) || y < 0 || y >= this.MX || !Number.isInteger(y)) debugger;
	}

	get(x: number, y: number) {
		// this.check(x, y);

		const offset = y * this.MX + x;
		const mask = 1 << offset % 8;
		return Boolean(this.buf[offset >>> 3] & mask);
	}

	set(x: number, y: number, value: boolean) {
		// this.check(x, y);

		const offset = y * this.MX + x;
		const mask = 1 << offset % 8;
		value
			? (this.buf[offset >>> 3] |= mask) // set bit
			: (this.buf[offset >>> 3] &= 0xff ^ mask); // clear bit
	}

	row(y: number) {
		return new BoolArray2DRow(this, y);
	}

	fill() {
		this.buf.fill(0xff);
	}

	clear() {
		this.buf.fill(0);
	}

	copy(other: BoolArray2D) {
		if (this.MX !== other.MX || this.MY !== other.MY) throw Error('Mismatched dimension');
		this.buf.set(other.buf);
	}
}

export class BoolArray3D {
	private buf: Uint8Array;

	private readonly MX: number;
	private readonly MY: number;
	private readonly MZ: number;

	constructor(x: number, y: number, z: number, init: boolean) {
		this.MX = x;
		this.MY = y;
		this.MZ = z;
		this.buf = new Uint8Array(Math.ceil((x * y * z) / 8));
		init ? this.fill() : this.clear();
	}

	check(x: number, y: number, z: number) {
		if (
			x < 0 ||
			x >= this.MX ||
			!Number.isInteger(x) ||
			y < 0 ||
			y >= this.MY ||
			!Number.isInteger(y) ||
			z < 0 ||
			z >= this.MZ ||
			!Number.isInteger(z)
		)
			debugger;
	}

	get(x: number, y: number, z: number) {
		// this.check(x, y, z);
		const offset = z * this.MY * this.MX + y * this.MX + x;
		const mask = 1 << offset % 8;

		return Boolean(this.buf[offset >>> 3] & mask);
	}

	set(x: number, y: number, z: number, value: boolean) {
		// this.check(x, y, z);

		const offset = z * this.MY * this.MX + y * this.MX + x;
		const mask = 1 << offset % 8;

		value
			? (this.buf[offset >>> 3] |= mask) // set bit
			: (this.buf[offset >>> 3] &= 0xff ^ mask); // clear bit
	}

	fill() {
		this.buf.fill(0xff);
	}

	clear() {
		this.buf.fill(0);
	}
}

export class Array2D<T extends TypedArray> {
	public readonly arr: T;
	private readonly MX: number;
	private readonly MY: number;

	public get ROWS() {
		return this.MY;
	}

	public get COLS() {
		return this.MX;
	}

	constructor(
		typeOrValue: TypedArrayConstructor<T> | T,
		MX: number,
		MY: number,
		funcOrValue?: number | ((x: number, y: number) => number)
	) {
		if (typeof typeOrValue === 'function') {
			this.arr = new typeOrValue(MX * MY);
		} else {
			if (typeOrValue.length !== MX * MY) throw new Error('Array2D value constructor dimension mismatch');
			this.arr = typeOrValue;
		}

		if (typeof funcOrValue === 'number') {
			this.arr.fill(funcOrValue);
		} else if (typeof funcOrValue === 'function') {
			for (let y = 0; y < MY; y++) {
				for (let x = 0; x < MX; x++) {
					this.arr[y * MX + x] = funcOrValue(x, y);
				}
			}
		}
		this.MX = MX;
		this.MY = MY;
	}

	check(x: number, y: number) {
		if (x < 0 || x >= this.MX || !Number.isInteger(x) || y < 0 || y >= this.MX || !Number.isInteger(y)) debugger;
	}

	get(x: number, y: number) {
		// this.check(x, y);
		return this.arr[y * this.MX + x];
	}

	set(x: number, y: number, value: number) {
		// this.check(x, y);
		this.arr[y * this.MX + x] = value;
	}

	fill(value: number) {
		this.arr.fill(value);
	}

	row(y: number) {
		return <T>this.arr.subarray(y * this.MX, (y + 1) * this.MX);
	}

	incre(x: number, y: number) {
		// this.check(x, y);
		this.arr[y * this.MX + x]++;
	}

	static from<T2 extends TypedArray>(type: TypedArrayConstructor<T2>, arr: T2[]) {
		if (!arr?.length) return null;

		const mat = new Array2D(type, arr[0].length, arr.length);
		for (let y = 0; y < arr.length; y++) {
			mat.row(y).set(arr[y]);
		}
		return mat;
	}

	copy(other: Array3D<T>) {
		if (this.MX !== other.MX || this.MY !== other.MY) throw Error('Mismatched dimension');
		this.arr.set(other.arr);
	}
}

export class Array3D<T extends TypedArray> {
	public readonly arr: T;
	public readonly MX: number;
	public readonly MY: number;
	public readonly MZ: number;

	constructor(
		type: TypedArrayConstructor<T>,
		MX: number,
		MY: number,
		MZ: number,
		func?: (x: number, y: number, z: number) => number
	) {
		this.arr = new type(MX * MY * MZ);
		if (func) {
			for (let z = 0; z < MZ; z++) {
				for (let y = 0; y < MY; y++) {
					for (let x = 0; x < MX; x++) {
						this.arr[z * MX * MY + y * MX + x] = func(x, y, z);
					}
				}
			}
		}
		this.MX = MX;
		this.MY = MY;
		this.MZ = MZ;
	}

	check(x: number, y: number, z: number) {
		if (
			x < 0 ||
			x >= this.MX ||
			!Number.isInteger(x) ||
			y < 0 ||
			y >= this.MX ||
			!Number.isInteger(y) ||
			z < 0 ||
			z >= this.MX ||
			!Number.isInteger(z)
		)
			debugger;
	}

	get(x: number, y: number, z: number) {
		// this.check(x, y, z);
		return this.arr[z * this.MX * this.MY + y * this.MX + x];
	}

	set(x: number, y: number, z: number, value: number) {
		// this.check(x, y, z);
		this.arr[z * this.MX * this.MY + y * this.MX + x] = value;
	}

	postDecre(x: number, y: number, z: number) {
		return --this.arr[z * this.MX * this.MY + y * this.MX + x];
	}

	copy(other: Array3D<T>) {
		if (this.MX !== other.MX || this.MY !== other.MY || this.MZ !== other.MZ) throw Error('Mismatched dimension');
		this.arr.set(other.arr);
	}
}

export const Array3Dflat = <T extends Uint8Array | Int8Array>(
	type: TypedArrayConstructor<T>,
	MX: number,
	MY: number,
	MZ: number,
	func: (x: number, y: number, z: number) => number
) => {
	const arr = new type(MX * MY * MZ);
	for (let z = 0; z < MZ; z++) {
		for (let y = 0; y < MY; y++) {
			for (let x = 0; x < MX; x++) {
				arr[z * MX * MY + y * MX + x] = func(x, y, z);
			}
		}
	}
	return arr;
};

export class HashMap<K, T> {
	private _size = 0;
	public map: Map<number, {k: K; v: T}[]> = new Map();

	private copyFunc: (k: K) => K;
	private hashFunc: (k: K) => number;
	private eqFunc: (k1: K, k2: K) => boolean;

	constructor(copyFunc: (k: K) => K, hashFunc: (k: K) => number, eqFunc: (k1: K, k2: K) => boolean) {
		this.copyFunc = copyFunc;
		this.hashFunc = hashFunc;
		this.eqFunc = eqFunc;
	}

	get size() {
		return this._size;
	}

	clear() {
		this.map.clear();
	}

	get(k: K) {
		const hash = this.hashFunc(k);
		const list = this.map.get(hash);
		if (!list) return null;
		const obj = list.find((o) => this.eqFunc(k, o.k));
		return obj ? obj.v : null;
	}

	greedy_get(hash: number, eq: (k: K) => boolean) {
		const list = this.map.get(hash);
		if (!list) return null;
		const obj = list.find((o) => eq(o.k));
		return obj ? obj.v : null;
	}

	set(k: K, v: T, hash = this.hashFunc(k)) {
		const list = this.map.get(hash);

		if (!list) {
			this.map.set(hash, [{k: this.copyFunc(k), v}]);
			this._size++;
		} else {
			// very lucky or hashFunc is bad
			// console.log(`hash collision: ${hash}`);
			const index = list.findIndex((o) => this.eqFunc(k, o.k));
			if (index < 0) {
				list.push({k: this.copyFunc(k), v});
				this._size++;
			} else {
				list[index].v = v;
			}
		}
	}

	delete(k: K) {
		const hash = this.hashFunc(k);
		const list = this.map.get(hash);
		if (!list) return false;
		if (list.length === 1) {
			this.map.delete(hash);
			this._size--;
			return true;
		}
		const index = list.findIndex((o) => this.eqFunc(k, o.k));
		if (index < 0) return false;
		list.splice(index, 1);
		this._size--;
		return true;
	}

	keys() {
		return [...this.map.values()].flat().map((o) => o.k);
	}

	values() {
		return [...this.map.values()].flat().map((o) => o.v);
	}

	entries() {
		return [...this.map.values()].flat().map((o) => [o.k, o.v]);
	}
}

const top = 0;
const parent = (i: number) => ((i + 1) >>> 1) - 1;
const left = (i: number) => (i << 1) + 1;
const right = (i: number) => (i + 1) << 1;

export class PriorityQueue<T> {
	private heap: T[] = [];
	private comparator: (a: T, b: T) => boolean;

	constructor(comparator = (a: T, b: T) => a > b) {
		this.heap = [];
		this.comparator = comparator;
	}

	get size() {
		return this.heap.length;
	}

	isEmpty() {
		return !this.heap.length;
	}

	peek() {
		return this.heap[top];
	}

	enqueue(...values: T[]) {
		values.forEach((value) => {
			this.heap.push(value);
			this._siftUp();
		});
		return this.size;
	}

	dequeue() {
		const poppedValue = this.peek();
		const bottom = this.size - 1;
		if (bottom > top) {
			this._swap(top, bottom);
		}
		this.heap.pop();
		this._siftDown();
		return poppedValue;
	}

	private _greater(i: number, j: number) {
		return this.comparator(this.heap[i], this.heap[j]);
	}

	private _swap(i: number, j: number) {
		[this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
	}

	private _siftUp() {
		let node = this.size - 1;
		while (node > top && this._greater(node, parent(node))) {
			this._swap(node, parent(node));
			node = parent(node);
		}
	}

	private _siftDown() {
		let node = top;
		while (
			(left(node) < this.size && this._greater(left(node), node)) ||
			(right(node) < this.size && this._greater(right(node), node))
		) {
			let maxChild = right(node) < this.size && this._greater(right(node), left(node)) ? right(node) : left(node);
			this._swap(node, maxChild);
			node = maxChild;
		}
	}
}
