import {StoreController} from '../store/controllers/StoreController';
import {HistoryStack} from '../history/Stack';

enum EventName {
	PRESS = 'on_key_press',
	DOWN = 'on_key_down',
	UP = 'on_key_up',
}

export interface KeyEventProcessor {
	on_key_press: (event: KeyboardEvent) => boolean;
	on_key_down: (event: KeyboardEvent) => boolean;
	on_key_up: (event: KeyboardEvent) => boolean;
}

export class KeyEventsDispatcher {
	private static _instance: KeyEventsDispatcher | undefined;
	static instance() {
		return (this._instance = this._instance || new KeyEventsDispatcher());
	}

	private _active: boolean = false;
	private _on_keypress_bound: (event: KeyboardEvent) => void;
	private _on_keydown_bound: (event: KeyboardEvent) => void;
	private _on_keyup_bound: (event: KeyboardEvent) => void;
	private _processor: KeyEventProcessor | undefined;

	// TODO: typescript - do I need this to have a component?
	// probably not, as it only seems to be to access the store
	private constructor(/*component?: any*/) {
		// this.component = component;
		// this._processor = null;
		this._on_keypress_bound = this._on_keypress.bind(this);
		this._on_keydown_bound = this._on_keydown.bind(this);
		this._on_keyup_bound = this._on_keyup.bind(this);
		this.activate();
	}

	static activate() {
		this.instance().activate();
	}
	activate() {
		if (!this._active) {
			this._active = true;
			document.addEventListener('keypress', this._on_keypress_bound);
			document.addEventListener('keydown', this._on_keydown_bound);
			document.addEventListener('keyup', this._on_keyup_bound);
		}
	}
	static deactivate() {
		this.instance().deactivate();
	}
	deactivate() {
		if (this._active) {
			this._active = false;
			document.removeEventListener('keypress', this._on_keypress_bound);
			document.removeEventListener('keydown', this._on_keydown_bound);
			document.removeEventListener('keyup', this._on_keyup_bound);
		}
	}

	register_processor(processor: KeyEventProcessor) {
		this._processor = processor;
	}
	deregister_processor(processor: KeyEventProcessor) {
		if (processor === this._processor) {
			this._processor = undefined;
		}
	}

	_on_keypress(e: KeyboardEvent) {
		this._process_on_key_event(e, EventName.PRESS);
	}
	_on_keydown(e: KeyboardEvent) {
		this._process_on_key_event(e, EventName.DOWN);
	}
	_on_keyup(e: KeyboardEvent) {
		this._process_on_key_event(e, EventName.UP);
	}

	_process_on_key_event(event: KeyboardEvent, event_type: EventName) {
		let key_processed: boolean = false;
		if (this._processor) {
			const method = this._processor[event_type];
			if (method) {
				key_processed = method(event);
			}
		}

		if (!key_processed) {
			this[event_type](event);
		}
	}

	on_key_press(event: KeyboardEvent) {
		// if (this.component) {
		switch (event.key) {
			// when 'Delete'
			// 	this.delete_selected_nodes()
			case 'u':
				return StoreController.editor.go_up();
			case 'i':
				return StoreController.editor.go_down();
			case 'y':
				if (event.ctrlKey) {
					return HistoryStack.instance().redo();
				}
				break;
			case 'z':
				if (event.ctrlKey) {
					return HistoryStack.instance().undo();
				}
				break;

			default:
				switch (event.code) {
					case 'Space':
						return StoreController.scene.time_controller.toggle_play_pause();
				}
		}
		// }
	}

	on_key_down(event: KeyboardEvent) {
		// if (this.component) {
		const scene = StoreController.scene;
		switch (event.key) {
			case 's':
				if (event.ctrlKey) {
					event.preventDefault();
					StoreController.save_scene();
					return false;
				}
				break;

			case 'ArrowRight':
				if (event.ctrlKey) {
					return scene.set_frame(scene.frame_range[1]);
				} else {
					return scene.time_controller.increment_frame();
				}
			case 'ArrowLeft':
				if (event.ctrlKey) {
					return scene.set_frame(scene.frame_range[0]);
				} else {
					return scene.time_controller.decrement_frame();
				}
		}
		// }
	}

	on_key_up(event: KeyboardEvent) {
		if (event.key == 'Escape') {
			StoreController.close_all_popups();
		}

		return false;
	}
}
