import {PolyScene} from '../scene/PolyScene';

export class ScenesRegister {
	private _lastRegisteredScene: PolyScene | undefined;
	private _scenes: Set<PolyScene> = new Set();
	private _registerTimeByScene: Map<PolyScene, number> = new Map();

	registerScene(scene: PolyScene) {
		if (this._scenes.has(scene)) {
			console.warn('scene was already registered');
			return;
		}

		this._scenes.add(scene);
		this._registerTimeByScene.set(scene, performance.now());
		this._updateCache();
	}
	deregisterScene(scene: PolyScene) {
		this._scenes.delete(scene);
		this._registerTimeByScene.delete(scene);
		this._updateCache();
	}
	lastRegisteredScene() {
		return this._lastRegisteredScene;
	}
	scenes() {
		const scenes: PolyScene[] = [];
		this._scenes.forEach((scene) => scenes.push(scene));
		return scenes;
	}

	private _updateCache() {
		this._lastRegisteredScene = undefined;
		this._registerTimeByScene.forEach((registerTime, scene) => {
			if (this._lastRegisteredScene == undefined) {
				this._lastRegisteredScene = scene;
			} else {
				const lastRegisterTime = this._registerTimeByScene.get(this._lastRegisteredScene);
				if (registerTime != null && lastRegisterTime != null) {
					if (registerTime > lastRegisterTime) {
						this._lastRegisteredScene = scene;
					}
				}
			}
		});
	}
}
