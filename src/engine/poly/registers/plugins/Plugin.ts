import {Poly} from '../../../Poly';

type PolyPluginCallback = (poly: Poly) => void;
interface PolyPluginOptions {
	libraryName: string;
}

export class PolyPlugin {
	constructor(private _name: string, private _callback: PolyPluginCallback, private _options: PolyPluginOptions) {}

	name() {
		return this._name;
	}
	libraryName() {
		return this._options.libraryName;
	}

	init(poly: Poly) {
		this._callback(poly);
	}
}
