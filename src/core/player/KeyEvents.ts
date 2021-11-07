import {CorePlayer} from './Player';

function stopEvent(e: KeyboardEvent) {
	// to prevent space from pausing from the editor
	e.preventDefault();
}
export class CorePlayerKeyEvents {
	constructor(private player: CorePlayer) {}
	private _onKeyDown(e: KeyboardEvent) {
		if (e.ctrlKey) {
			// if ctrl is pressed, we do not register any event.
			// this is mostly to allow Ctrl+S to work without triggering a player movement
			return;
		}
		switch (e.code) {
			case 'ArrowUp':
			case 'KeyW':
				this.player.setForward(true);
				stopEvent(e);
				break;
			case 'ArrowDown':
			case 'KeyS':
				this.player.setBackward(true);
				stopEvent(e);
				break;
			case 'ArrowRight':
			case 'KeyD':
				this.player.setRight(true);
				stopEvent(e);
				break;
			case 'ArrowLeft':
			case 'KeyA':
				this.player.setLeft(true);
				stopEvent(e);
				break;
			case 'Space':
				this.player.jump();
				stopEvent(e);
				break;
			case 'ShiftLeft':
			case 'ShiftRight':
				this.player.setRun(true);
				stopEvent(e);
				break;
		}
	}
	private _onKeyUp(e: KeyboardEvent) {
		switch (e.code) {
			case 'ArrowUp':
			case 'KeyW':
				this.player.setForward(false);
				break;
			case 'ArrowDown':
			case 'KeyS':
				this.player.setBackward(false);
				break;
			case 'ArrowRight':
			case 'KeyD':
				this.player.setRight(false);
				break;
			case 'ArrowLeft':
			case 'KeyA':
				this.player.setLeft(false);
				break;
			case 'ShiftLeft':
			case 'ShiftRight':
				this.player.setRun(false);
				stopEvent(e);
				break;
		}
	}
	private _bounds = {
		keydown: this._onKeyDown.bind(this),
		keyup: this._onKeyUp.bind(this),
	};
	addEvents() {
		document.addEventListener('keydown', this._bounds.keydown);
		document.addEventListener('keyup', this._bounds.keyup);
	}
	removeEvents() {
		document.removeEventListener('keydown', this._bounds.keydown);
		document.removeEventListener('keyup', this._bounds.keyup);
	}
}
