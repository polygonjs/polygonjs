import {PolyEngine} from '../../../Poly';
import {ModuleName} from './Common';
import {BaseModule} from './_BaseModule';

export class BaseModulesRegister {
	private _moduleByName: Map<ModuleName, any> = new Map();
	constructor(private poly: PolyEngine) {}
	register<K extends ModuleName>(moduleName: K, module: BaseModule<K>) {
		if (this._moduleByName.has(moduleName)) {
			console.warn('module already registered', moduleName);
			return;
		}
		this._moduleByName.set(moduleName, module);
		module.onRegister(this.poly);
	}

	moduleNames() {
		const list: ModuleName[] = [];
		this._moduleByName.forEach((module, moduleName) => {
			list.push(moduleName);
		});
		return list;
	}
}
