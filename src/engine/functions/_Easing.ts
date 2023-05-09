import {_matchArrayLength} from './_ArrayUtils';
import {NamedFunction1} from './_Base';
import {Easing} from '../../core/math/Easing';

export class easeI2 extends NamedFunction1<[number]> {
	static override type() {
		return 'easeI2';
	}
	func = Easing.easeI2;
}
export class easeO2 extends NamedFunction1<[number]> {
	static override type() {
		return 'easeO2';
	}
	func = Easing.easeO2;
}

export class easeIO2 extends NamedFunction1<[number]> {
	static override type() {
		return 'easeIO2';
	}
	func = Easing.easeIO2;
}
export class easeI3 extends NamedFunction1<[number]> {
	static override type() {
		return 'easeI3';
	}
	func = Easing.easeI3;
}
export class easeO3 extends NamedFunction1<[number]> {
	static override type() {
		return 'easeO3';
	}
	func = Easing.easeO3;
}
export class easeIO3 extends NamedFunction1<[number]> {
	static override type() {
		return 'easeIO3';
	}
	func = Easing.easeIO3;
}
export class easeI4 extends NamedFunction1<[number]> {
	static override type() {
		return 'easeI4';
	}
	func = Easing.easeI4;
}
export class easeO4 extends NamedFunction1<[number]> {
	static override type() {
		return 'easeO4';
	}
	func = Easing.easeO4;
}
export class easeIO4 extends NamedFunction1<[number]> {
	static override type() {
		return 'easeIO4';
	}
	func = Easing.easeIO4;
}
export class easeSinI extends NamedFunction1<[number]> {
	static override type() {
		return 'easeSinI';
	}
	func = Easing.easeSinI;
}
export class easeSinO extends NamedFunction1<[number]> {
	static override type() {
		return 'easeSinO';
	}
	func = Easing.easeSinO;
}
export class easeSinIO extends NamedFunction1<[number]> {
	static override type() {
		return 'easeSinIO';
	}
	func = Easing.easeSinIO;
}
export class easeElasticI extends NamedFunction1<[number]> {
	static override type() {
		return 'easeElasticI';
	}
	func = Easing.easeElasticI;
}
export class easeElasticO extends NamedFunction1<[number]> {
	static override type() {
		return 'easeElasticO';
	}
	func = Easing.easeElasticO;
}
export class easeElasticIO extends NamedFunction1<[number]> {
	static override type() {
		return 'easeElasticIO';
	}
	func = Easing.easeElasticIO;
}
