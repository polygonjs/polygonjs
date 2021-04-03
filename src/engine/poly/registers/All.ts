import {AllNodesRegister} from './nodes/All';
import {AllExpressionsRegister} from './expressions/All';
import {AllAssemblersRegister} from './assemblers/All';
import {AllCamerasRegister} from './cameras/All';

import {Poly} from '../../Poly';
export class AllRegister {
	private static _started = false;
	static async run() {
		if (this._started) {
			return;
		}
		this._started = true;
		AllNodesRegister.run(Poly);
		AllCamerasRegister.run(Poly);
		AllExpressionsRegister.run(Poly);
		AllAssemblersRegister.run(Poly);

		// modules are not registered separately
		// AllModulesRegister.run(Poly);
	}
}
