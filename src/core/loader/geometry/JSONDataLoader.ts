import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Poly} from '../../../engine/Poly';
import {CoreBaseLoader} from '../_Base';
import {PolyScene} from '../../../engine/index_all';
import {JSONDataParser} from './JSONDataParser';

export interface JsonDataLoaderOptions {
	dataKeysPrefix?: string;
	skipEntries?: string;
	doConvert?: boolean;
	convertToNumeric?: string;
}

export class JsonDataLoader extends CoreBaseLoader {
	private _parser: JSONDataParser;

	constructor(url: string, scene: PolyScene, options: JsonDataLoaderOptions = {}) {
		super(url, scene);
		this._parser = new JSONDataParser(options);
	}

	async load(
		success_callback: (geometry: BufferGeometry) => void,
		progress_callback: (() => void) | undefined,
		error_callback: (error: ErrorEvent) => void | undefined
	) {
		const url = await this._urlToLoad();

		fetch(url)
			.then(async (response) => {
				let json = await response.json();
				const dataKeysPrefix = this._parser.dataKeysPrefix();
				if (dataKeysPrefix != null && dataKeysPrefix != '') {
					json = this._parser.get_prefixed_json(json, dataKeysPrefix.split('.'));
				}
				this._parser.setJSON(json);
				const object = this._parser.createObject();
				success_callback(object);
			})
			.catch((error: ErrorEvent) => {
				Poly.error('error', error);
				error_callback(error);
			});
	}
}
