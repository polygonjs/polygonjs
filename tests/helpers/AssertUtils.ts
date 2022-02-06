const PRECISION = 1000;

export class AssertUtils {
	static arrayWithPrecision(array: number[] | Float32Array): string {
		const values = new Array(array.length);
		for (let i = 0; i < array.length; i++) {
			const val = array[i];
			const new_val = Math.round(val * PRECISION) / PRECISION;
			values[i] = new_val;
		}
		return values.join(':');
	}
}
