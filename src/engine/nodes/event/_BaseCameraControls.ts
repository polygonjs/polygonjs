import {Camera} from 'three';
import {TypedEventNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {BaseViewerType} from '../../viewers/_Base';
import {Poly} from '../../Poly';

export interface CameraControls {
	name?: string;
	enabled?: boolean;
	dispose: () => void;
	update: (delta: number) => void;
	addEventListener: (eventName: string, callback: () => void) => void;
	removeEventListener: (eventName: string, callback: () => void) => void;
}

export abstract class TypedCameraControlsEventNode<K extends NodeParamsConfig> extends TypedEventNode<K> {
	private _controls_by_viewer: Map<BaseViewerType, CameraControls> = new Map();

	async applyControls(camera: Camera, viewer: BaseViewerType) {
		// I don't think I can just assign the camera at the moment
		// so the controls may need to be re-created everytime
		// TODO: the controls should be created (and disposed?) by the viewer
		//this.dispose_controls()
		// viewer.controlsController()?.dispose_controls();
		const canvas = viewer.canvas();
		if (!canvas) {
			return;
		}
		// ensure the params are computed
		// as otherwise, their values would be null
		// if they are tied to an expression, for instance
		// when inside a polyNode
		const ensureParamsAreComputed = async () => {
			let promises: Array<Promise<void>> | undefined;
			for (const param of this.params.all) {
				if (param.isDirty() && !param.parentParam()) {
					promises = promises || [];
					promises.push(param.compute());
				}
			}
			if (promises) {
				await Promise.all(promises);
			}
		};
		await ensureParamsAreComputed();
		//
		const controls = await this.createControlsInstance(camera, canvas);
		const currentControls = this._controls_by_viewer.get(viewer);
		if (currentControls) {
			currentControls.dispose();
		}
		this._controls_by_viewer.set(viewer, controls);
		const performance = Poly.performance.performanceManager();
		const timestamp = performance.now();
		controls.name = `${this.path()}:${camera.name}:${timestamp}:${this.controls_id()}`;
		await this.params.evalAll();
		this.setupControls(controls);
		return controls;
	}
	controls_id() {
		return JSON.stringify(this.params.all.map((p) => p.valueSerialized()));
	}
	abstract updateRequired(): boolean;
	override cook(): void {
		this._controls_by_viewer.forEach((controls) => {
			this.setupControls(controls);
		});
		this.cookController.endCook();
	}

	abstract setupControls(controls: CameraControls): void;
	abstract disposeControlsForHtmlElementId(html_element_id: string): void;
	abstract createControlsInstance(camera: Camera, element: HTMLElement): Promise<CameraControls>;
	abstract endEventName(): string;
}

export type BaseCameraControlsEventNodeType = TypedCameraControlsEventNode<any>;
