// import {Camera} from 'three';
import {isBooleanTrue} from '../../../core/Type';
import {RootManagerNode} from '../../nodes/manager/Root';
import {BaseViewerType} from '../_Base';

const ICON = {
	ON: `<svg xmlns="http://www.w3.org/2000/svg" class="soundOn h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>`,
	OFF: `<svg xmlns="http://www.w3.org/2000/svg" class="soundOff h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" />
	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
  </svg>`,
};

export class ViewerAudioController {
	private __iconContainer: HTMLElement | undefined;
	private _onIcon: HTMLElement | undefined;
	private _offIcon: HTMLElement | undefined;
	constructor(private _viewer: BaseViewerType) {}

	update() {
		const root = this._viewer.scene().root();

		if (isBooleanTrue(root.pv.displayAudioIcon)) {
			this._showIcon();
			this._updateIcon(root);
		} else {
			this._hideIcon();
		}
	}
	unmount() {
		if (this.__iconContainer) {
			this.__iconContainer.parentElement?.removeChild(this.__iconContainer);
			this.__iconContainer = undefined;
		}
		this._onIcon = undefined;
		this._offIcon = undefined;
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

		element.addEventListener('pointerdown', (event) => {
			this._toggleSound();
			event.preventDefault();
			event.stopPropagation();
			return false;
		});

		return element;
	}
	private _setIconContainerStyle(element: HTMLElement, root: RootManagerNode) {
		// const style = 'position: absolute; top: 10px; right: 10px; width: 24px; height: 24px; cursor: pointer'
		const style = root.pv.audioIconStyle;
		element.setAttribute('style', style);
		element.style.color = root.pv.audioIconColor.getStyle();
		// element.style.position = 'absolute';
		// element.style.top = '10px';
		// element.style.right = '10px';
		// element.style.width = '24px';
		// element.style.height = '24px';
		// element.style.cursor = 'pointer';
	}

	private offIcon() {
		function createIcon() {
			const icon = document.createElement('div');
			icon.innerHTML = ICON.OFF;
			return icon.children[0] as HTMLElement;
		}
		return (this._offIcon = this._offIcon || createIcon());
	}
	private onIcon() {
		function createIcon() {
			const icon = document.createElement('div');
			icon.innerHTML = ICON.ON;
			return icon.children[0] as HTMLElement;
		}
		return (this._onIcon = this._onIcon || createIcon());
	}
	private _toggleSound() {
		const root = this._viewer.scene().root();
		root.audioController.toggleSound();
		this._updateIcon(root);
	}
	private _updateIcon(root: RootManagerNode) {
		const container = this._iconContainer();
		if (!container) {
			return;
		}
		this._setIconContainerStyle(container, root);
		const onIcon = this.onIcon();
		const offIcon = this.offIcon();
		if (this._viewer.scene().root().audioController.soundOn()) {
			container.appendChild(onIcon);
			offIcon.parentElement?.removeChild(offIcon);
		} else {
			container.appendChild(offIcon);
			onIcon.parentElement?.removeChild(onIcon);
		}
	}
}
