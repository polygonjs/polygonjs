import type {PolyEngine} from '../../../Poly';

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

// at the moment, when saving with typescript from the editor
// we are getting this error when registering a plugin:
//
// (alias) const polyPluginPhysics: PolyPlugin
// import polyPluginPhysics
// Argument of type 'import("/home/gui/work/web/nft/time_physics/node_modules/@polygonjs/polygonjs/dist/src/engine/poly/registers/plugins/Plugin").PolyPlugin' is not assignable to parameter of type 'import("/home/gui/work/web/nft/time_physics/node_modules/@polygonjs/polygonjs/src/engine/poly/registers/plugins/Plugin").PolyPlugin'.
//   Property '_name' is protected but type 'PolyPlugin' is not a class derived from 'PolyPlugin'.ts(2345)
//
// and the current way to avoid this is to have the poly.registerPlugin method accepts an interface as argument instead of a plugin
// export interface PolyPluginInterface {
// 	name(): string;
// 	libraryName(): string;
// 	init(poly: PolyEngine): void;
// 	toJSON(): PolyPluginData;
// }
// but even using an interface will lead to the following error:
//
/* Argument of type 'PolyPlugin' is not assignable to parameter of type 'PolyPluginInterface'.
  Types of property 'init' are incompatible.
    Type '(poly: import("/home/gui/work/web/nft/time_physics/node_modules/@polygonjs/polygonjs/dist/src/engine/Poly").PolyEngine) => void' is not assignable to type '(poly: import("/home/gui/work/web/nft/time_physics/node_modules/@polygonjs/polygonjs/src/engine/Poly").PolyEngine) => void'.
      Types of parameters 'poly' and 'poly' are incompatible.
        Type 'import("/home/gui/work/web/nft/time_physics/node_modules/@polygonjs/polygonjs/src/engine/Poly").PolyEngine' is not assignable to type 'import("/home/gui/work/web/nft/time_physics/node_modules/@polygonjs/polygonjs/dist/src/engine/Poly").PolyEngine'.
          Types of property 'renderersController' are incompatible.
            Type 'import("/home/gui/work/web/nft/time_physics/node_modules/@polygonjs/polygonjs/src/engine/poly/RenderersController").RenderersController' is not assignable to type 'import("/home/gui/work/web/nft/time_physics/node_modules/@polygonjs/polygonjs/dist/src/engine/poly/RenderersController").RenderersController'.
              Types have separate declarations of a private property '_next_renderer_id'.ts(2345) */
//
export type PolyPluginInterface = Pick<PolyPlugin, 'name' | 'libraryName' | 'init' | 'toJSON'>;
