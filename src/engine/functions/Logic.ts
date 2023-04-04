import {NamedFunction1} from './_Base';
import {_matchArrayLength} from './_ArrayUtils';

//
//
// And
//
//
export class andArrays extends NamedFunction1<[Array<boolean[]>]> {
	static override type() {
		return 'andArrays';
	}
	override func(arrays: Array<boolean[]>): boolean {
		for (let array of arrays) {
			for (let element of array) {
				if (!element) {
					return false;
				}
			}
		}
		return true;
	}
}
export class andBooleans extends NamedFunction1<[boolean[]]> {
	static override type() {
		return 'andBooleans';
	}
	override func(arrays: boolean[]): boolean {
		for (let element of arrays) {
			if (!element) {
				return false;
			}
		}
		return true;
	}
}
//
//
// Or
//
//
export class orArrays extends NamedFunction1<[Array<boolean[]>]> {
	static override type() {
		return 'orArrays';
	}
	override func(arrays: Array<boolean[]>): boolean {
		for (let array of arrays) {
			for (let element of array) {
				if (element) {
					return true;
				}
			}
		}
		return false;
	}
}
export class orBooleans extends NamedFunction1<[boolean[]]> {
	static override type() {
		return 'orBooleans';
	}
	override func(arrays: boolean[]): boolean {
		for (let element of arrays) {
			if (element) {
				return true;
			}
		}
		return false;
	}
}
