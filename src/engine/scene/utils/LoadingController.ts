import {PolyScene} from '../PolyScene';
import {SCENE_EVENT_CREATED_EVENT_CONTEXT, SCENE_EVENT_READY_EVENT_CONTEXT} from './events/SceneEventsController';

export class LoadingController {
	constructor(private scene: PolyScene) {}

	private _loadingState: boolean = true;
	private _autoUpdating: boolean = false;

	markAsLoading() {
		this._setLoadingState(true);
	}
	markAsLoaded() {
		this.scene.missingExpressionReferencesController.resolveMissingReferences();
		this._setLoadingState(false);
		this._triggerLoadedEvent();
	}
	dispatchReadyEvent() {
		if (globalThis.Event) {
			this.scene.eventsDispatcher.sceneEventsController.dispatch(SCENE_EVENT_READY_EVENT_CONTEXT);
		}
	}
	private _triggerLoadedEvent() {
		// we only dispatch events in the browser. If this is run from nodejs, we do not.
		if (globalThis.Event) {
			this.scene.eventsDispatcher.sceneEventsController.dispatch(SCENE_EVENT_CREATED_EVENT_CONTEXT);
		}
	}

	private _setLoadingState(state: boolean) {
		this._loadingState = state;
		this.setAutoUpdate(!this._loadingState);
		this.scene.cooker.unblock();
	}
	isLoading() {
		return this._loadingState;
	}
	loaded() {
		return !this._loadingState;
	}
	autoUpdating() {
		return this._autoUpdating;
	}
	setAutoUpdate(newState: boolean) {
		if (this._autoUpdating !== newState) {
			this._autoUpdating = newState;
			if (this._autoUpdating) {
				// if this.env_is_development()
				// 	this.performance().start()

				const root = this.scene.root();
				if (root) {
					root.processQueue();
				}
			}
		}
	}
}
