import {AllNodesRegister} from './nodes/All';
import {AllExpressionsRegister} from './expressions/All';

import {Poly} from '../../Poly';
export class AllRegister {
	static async run() {
		AllNodesRegister.run(Poly.instance());
		AllExpressionsRegister.run(Poly.instance());
	}
}
