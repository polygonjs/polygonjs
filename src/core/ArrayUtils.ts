export class ArrayUtils {
	static min<T>(array: Array<T>):T {
		let min = array[0]
		for(let element of array){
			if (element < min){
				min = element
			}
		}
		return min
	}
	static max<T>(array: Array<T>):T {
		let min = array[0]
		for(let element of array){
			if (element > min){
				min = element
			}
		}
		return min
	}
	static sum(array: number[]):number {
		let sum = 0
		for(let element of array){
			sum += element
		}
		return sum
	}

	static range(start:number, end?:number, step:number=1):number[] {
		if(end == null){
			end = start;
			start = 0;
		}
		const length  = Math.floor((end-start)/step);
		const array:number[] = new Array(length);

		for (let i=0;i<array.length;i++) {
			array[i] = start + i*step;
		}
		return array
	}
}