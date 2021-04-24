import {PolyEngine} from '../../../Poly';

type PolyPluginCallback = (poly: PolyEngine) => void;
interface PolyPluginOptions {
	libraryName: string;
	libraryImportPath: string;
	// no need yet to have a CND entry
	// as using the plugins is currently only possible
	// when doing js or ts export, NOT with html export
}
export interface PolyPluginData {
	name: string;
	libraryName: string;
	libraryImportPath: string;
}

// export interface PolyPluginInterface {
// 	name(): string;
// 	libraryName(): string;
// 	init(poly: PolyEngine): void;
// 	toJSON(): PolyPluginData;
// }
export class PolyPlugin {
	constructor(
		protected _name: string,
		protected _callback: PolyPluginCallback,
		protected _options: PolyPluginOptions
	) {}

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
			libraryName: this._options.libraryName,
			libraryImportPath: this._options.libraryImportPath,
		};
	}
}
