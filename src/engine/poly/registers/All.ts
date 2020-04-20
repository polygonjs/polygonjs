import {AllNodesRegister} from './nodes/All';
import {AllExpressionsRegister} from './expressions/All';

import {Poly} from '../../Poly';
export class AllRegister {
	private static _started = false;
	static async run() {
		if (this._started) {
			return;
		}
		this._started = true;
		AllNodesRegister.run(Poly.instance());
		AllExpressionsRegister.run(Poly.instance());
	}
}
