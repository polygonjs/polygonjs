import {Camera} from 'three';
import {CameraControls} from '../../nodes/event/_BaseCameraControls';
import {TypedViewer} from '../_Base';

type UpdateControlsFunc = (delta: number) => void;

export class ViewerControlsController<C extends Camera> {
	protected _active: boolean = false;
	private _updateControlsFunc: UpdateControlsFunc | undefined;
	protected _controls: CameraControls | undefined;
	private _unmounted = false;
	constructor(private viewer: TypedViewer<C>) {}

	controls() {
		return this._controls;
	}

	mount() {
		this._unmounted = false;
		const controlsNode = this.viewer.controlsNode();
		const camera = this.viewer.camera();
		if (!(controlsNode && camera)) {
			return;
		}
		controlsNode.applyControls(camera, this.viewer).then((controls) => {
			this._controls = controls;
			// make sure that the function is (delta) => controls.update(delta)
			// and not just "controls.update", as this would prevent the controls from binding "this" properly.
			// This messes up with the FirstPersoControls for instance.
			this._updateControlsFunc = controls ? (delta) => controls.update(delta) : undefined;

			if (this._unmounted) {
				this._disposeControls();
			}
		});
	}
	unmount() {
		this._unmounted = true;
		this._disposeControls();
		// dispose controls
		// this._controlsNode = undefined;
	}
	private _disposeControls() {
		if (this._controls) {
			this._controls.dispose();
			// this._controls = undefined;
			// this._updateControlsFunc = undefined;
		}
		this._updateControlsFunc = undefined;
	}
	update(delta: number) {
		if (this._updateControlsFunc) {
			this._updateControlsFunc(delta);
		}
	}
	setActive(active: boolean) {
		if (active) {
			this.unmount();
		} else {
			this.mount();
		}
	}
}
