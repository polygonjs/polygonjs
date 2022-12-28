import {CoreFeaturesController} from './../../../../core/FeaturesController';
import {SceneJsonImporter} from './Scene';

export class ImportReport {
	private _warnings: string[] = [];
	private _readonly: boolean = false;
	private _loadedWithoutAssemblers: boolean = false;
	constructor(_sceneImporter: SceneJsonImporter) {}

	warnings() {
		return this._warnings;
	}
	readonly() {
		return this._readonly;
	}
	loadedWithoutAssemblers() {
		return this._loadedWithoutAssemblers;
	}

	reset() {
		this._warnings = [];
	}

	markAsLoadedWithoutAssemblers() {
		this._readonly = true;
		this._loadedWithoutAssemblers = true;
	}
	addWarning(message: string) {
		this._warnings.push(message);
		if (CoreFeaturesController.debugLoadProgress()) {
			console.warn(message);
		}
	}
}
