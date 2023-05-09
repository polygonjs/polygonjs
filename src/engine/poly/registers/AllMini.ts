import {AllNodesRegister} from './nodes/All';
import {AllNamedFunctionRegister} from './functions/All';
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
		AllNamedFunctionRegister.run(Poly);
	}
}
