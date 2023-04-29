import {_matchArrayLength} from './_ArrayUtils';
import {NamedFunction0} from './_Base';
import {Poly} from '../Poly';

export class playerMode extends NamedFunction0 {
	static override type() {
		return 'playerMode';
	}
	func(): boolean {
		return Poly.playerMode();
	}
}
