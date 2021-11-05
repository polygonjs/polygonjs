import {Player} from './Player';

export class CorePlayerKeyEvents {
	constructor(private player: Player) {}
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
				Player.stopEvent(e);
				break;
			case 'ArrowDown':
			case 'KeyS':
				this.player.setBackward(true);
				Player.stopEvent(e);
				break;
			case 'ArrowRight':
			case 'KeyD':
				this.player.setRight(true);
				Player.stopEvent(e);
				break;
			case 'ArrowLeft':
			case 'KeyA':
				this.player.setLeft(true);
				Player.stopEvent(e);
				break;
			case 'Space':
				this.player.jump();
				Player.stopEvent(e);
				break;
			case 'ShiftLeft':
			case 'ShiftRight':
				this.player.setRun(true);
				Player.stopEvent(e);
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
				Player.stopEvent(e);
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
