import {_matchArrayLength} from './_ArrayUtils';
import {NamedFunction0, NamedFunction1, NamedFunction2, NamedFunction3, NamedFunction4, NamedFunction5} from './_Base';
import {
	clamp as _clamp,
	smoothstep as _smoothstep,
	smootherstep as _smootherstep,
	fit as _fit,
	fitClamp as _fitClamp,
	mix as _mix,
	randFloat as _randFloat,
	degToRad as _degToRad,
	radToDeg as _radToDeg,
} from '../../core/math/_Module';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';
import {isBoolean} from '../../core/Type';

export class clamp extends NamedFunction3<[number, number, number]> {
	static override type() {
		return 'clamp';
	}
	func(value: number, min: number, max: number): number {
		return _clamp(value, min, max);
	}
}
export class complement extends NamedFunction1<[number]> {
	static override type() {
		return 'complement';
	}
	func(value: number): number {
		return 1 - value;
	}
}

export class degToRad extends NamedFunction1<[number]> {
	static override type() {
		return 'degToRad';
	}
	func(value: number): number {
		return _degToRad(value);
	}
}
export class radToDeg extends NamedFunction1<[number]> {
	static override type() {
		return 'radToDeg';
	}
	func(value: number): number {
		return _radToDeg(value);
	}
}

export class fit extends NamedFunction5<[number, number, number, number, number]> {
	static override type() {
		return 'fit';
	}
	func(value: number, srcMin: number, srcMax: number, destMin: number, destMax: number): number {
		return _fit(value, srcMin, srcMax, destMin, destMax);
	}
}

export class fitClamp extends NamedFunction5<[number, number, number, number, number]> {
	static override type() {
		return 'fitClamp';
	}
	func(value: number, srcMin: number, srcMax: number, destMin: number, destMax: number): number {
		return _fitClamp(value, srcMin, srcMax, destMin, destMax);
	}
}
export class mix extends NamedFunction3<[number, number, number]> {
	static override type() {
		return 'mix';
	}
	func(value0: number, value1: number, blend: number): number {
		return _mix(value0, value1, blend);
	}
}
export class multAdd extends NamedFunction4<[number, number, number, number]> {
	static override type() {
		return 'multAdd';
	}
	func(value: number, preAdd: number, mult: number, postAdd: number): number {
		return (value + preAdd) * mult + postAdd;
	}
}
export class negate<T extends number | boolean> extends NamedFunction1<[T]> {
	static override type() {
		return 'negate';
	}
	func(value: T): T {
		if (isBoolean(value)) {
			return !value as T;
		} else {
			return -value as T;
		}
	}
}
export class rand extends NamedFunction2<[number, number]> {
	static override type() {
		return 'rand';
	}
	func(value0: number, value1: number): number {
		return _randFloat(value0, value1);
	}
}
export class random extends NamedFunction0 {
	static override type() {
		return 'random';
	}
	func(): number {
		dummyReadRefVal(this.timeController.timeUniform().value);
		return Math.random();
	}
}

export class smoothstep extends NamedFunction3<[number, number, number]> {
	static override type() {
		return 'smoothstep';
	}
	func(value: number, min: number, max: number): number {
		return _smoothstep(value, min, max);
	}
}
export class smootherstep extends NamedFunction3<[number, number, number]> {
	static override type() {
		return 'smootherstep';
	}
	func(value: number, min: number, max: number): number {
		return _smootherstep(value, min, max);
	}
}
