import {PolyEngine} from '../../../Poly';

type PolyPluginCallback = (poly: PolyEngine) => void;
interface PolyPluginOptions {
	libraryName: string;
	// no need yet to have a CND entry
	// as using the plugins is currently only possible
	// when doing js or ts export, NOT with html export
}
export interface PolyPluginData {
	name: string;
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

	init(poly: PolyEngine) {
		this._callback(poly);
	}

	toJSON(): PolyPluginData {
		return {
			name: this._name,
			libraryName: this.libraryName(),
		};
	}
}
