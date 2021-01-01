import {AllNodesRegister} from './nodes/All';
import {AllExpressionsRegister} from './expressions/All';
import {AllModulesRegister} from './modules/All';
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
		const poly = Poly.instance();
		AllNodesRegister.run(poly);
		AllCamerasRegister.run(poly);
		AllExpressionsRegister.run(poly);
		AllModulesRegister.run(poly);
		AllAssemblersRegister.run(poly);
	}
}
