import {AllNodesRegister} from './nodes/All';
import {AllExpressionsRegister} from './expressions/All';
import {AllAssemblersRegister} from './assemblers/All';
import {AllCamerasRegister} from './cameras/All';
import {Poly} from '../../Poly';
import {CoreFeaturesController} from '../../../core/FeaturesController';
import {AllModulesRegister} from './modules/All';

export class AllRegister {
	private static _started = false;
	static async registerAll() {
		if (this._started) {
			return;
		}
		this._started = true;
		AllNodesRegister.run(Poly);
		AllCamerasRegister.run(Poly);
		AllExpressionsRegister.run(Poly);

		const noAssemblers = CoreFeaturesController.noAssemblers();
		if (!noAssemblers) {
			AllAssemblersRegister.run(Poly);
		}

		AllModulesRegister.run(Poly);
	}
}
