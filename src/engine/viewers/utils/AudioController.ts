// import {Camera} from 'three/src/cameras/Camera';
import {isBooleanTrue} from '../../../core/Type';
import {BaseViewerType} from '../_Base';

const ICON = {
	ON: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>`,
	OFF: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" />
	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
  </svg>`,
};

export class ViewerAudioController {
	private _onIcon: HTMLElement | undefined;
	private _offIcon: HTMLElement | undefined;
	constructor(private _viewer: BaseViewerType) {}

	update() {
		const root = this._viewer.cameraNode().root();

		if (isBooleanTrue(root.pv.displayAudioIcon)) {
			this._showIcon();
			this._updateColor();
			this._updateIcon();
		} else {
			this._hideIcon();
		}
	}
	private _updateColor() {
		if (this.__iconContainer) {
			const root = this._viewer.cameraNode().root();
			this.__iconContainer.style.color = root.pv.audioIconColor.getStyle();
		}
	}
	private _showIcon() {
		const element = this._iconContainer();
		if (element) {
			element.style.display = 'block';
		}
	}
	private _hideIcon() {
		if (this.__iconContainer) {
			this.__iconContainer.style.display = 'none';
		}
	}
	private __iconContainer: HTMLElement | undefined;
	private _iconContainer() {
		const createIconContainer = () => {
			const element = this._createIconContainer();
			const domElement = this._viewer.domElement();
			if (!domElement) {
				return;
			}
			domElement.append(element);
			return element;
		};
		return (this.__iconContainer = this.__iconContainer || createIconContainer());
	}
	private _createIconContainer() {
		const element = document.createElement('div');
		element.style.position = 'absolute';
		element.style.top = '10px';
		element.style.right = '10px';
		element.style.width = '24px';
		element.style.height = '24px';
		element.style.cursor = 'pointer';

		element.addEventListener('pointerdown', () => {
			this._toggleSound();
		});

		element.appendChild(this.onIcon());
		element.appendChild(this.offIcon());

		this._updateIcon();

		return element;
	}
	private offIcon() {
		function createIcon() {
			const icon = document.createElement('div');
			icon.innerHTML = ICON.OFF;
			return icon;
		}
		return (this._offIcon = this._offIcon || createIcon());
	}
	private onIcon() {
		function createIcon() {
			const icon = document.createElement('div');
			icon.innerHTML = ICON.ON;
			return icon;
		}
		return (this._onIcon = this._onIcon || createIcon());
	}
	private _toggleSound() {
		this._viewer.cameraNode().root().audioController.toggleSound();
		this._updateIcon();
	}
	private _updateIcon() {
		if (!(this._onIcon && this._offIcon)) {
			return;
		}
		if (this._viewer.cameraNode().root().audioController.soundOn()) {
			this._onIcon.style.display = 'block';
			this._offIcon.style.display = 'none';
		} else {
			this._onIcon.style.display = 'none';
			this._offIcon.style.display = 'block';
		}
	}
}
