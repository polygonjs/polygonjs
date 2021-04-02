import {SceneJsonImporter} from './Scene';

export class ImportReport {
	private _warnings: string[] = [];
	constructor(_scene_importer: SceneJsonImporter) {}

	warnings() {
		return this._warnings;
	}

	reset() {
		this._warnings = [];
	}
	addWarning(message: string) {
		this._warnings.push(message);
	}
}
