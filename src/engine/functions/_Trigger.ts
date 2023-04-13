import {NamedFunction1, NamedFunction3} from './_Base';

export class triggerFilter extends NamedFunction1<[boolean]> {
	static override type() {
		return 'triggerFilter';
	}
	func(condition: boolean): boolean {
		return condition;
	}
	override asString(condition: string): string {
		return `if(${condition}==false) { return }`;
	}
}

export class triggerTwoWaySwitch extends NamedFunction3<[boolean, Function, Function]> {
	static override type() {
		return 'triggerTwoWaySwitch';
	}
	func(condition: boolean, _func0: Function, _func1: Function): void {
		if (condition) {
			_func0();
		} else {
			_func1();
		}
	}
}
