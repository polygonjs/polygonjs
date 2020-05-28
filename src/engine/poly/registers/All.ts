import {AllNodesRegister} from './nodes/All';
import {AllExpressionsRegister} from './expressions/All';
import {AllModulesRegister} from './modules/All';
import {AllAssemblersRegister} from './assemblers/All';

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
		AllModulesRegister.run(Poly.instance());
		AllAssemblersRegister.run(Poly.instance());
	}
}
