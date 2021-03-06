import {Camera} from 'three/src/cameras/Camera';

import {TypedEventNode} from './_Base';
// import {BaseCameraObjNodeType} from '../obj/_BaseCamera';

// import {OrbitControls} from '../../../../modules/three/examples/jsm/controls/OrbitControls';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {BaseViewerType} from '../../viewers/_Base';
import {Poly} from '../../Poly';

export interface CameraControls {
	name?: string;
	enabled?: boolean;
	dispose: () => void;
	update: () => void;
	addEventListener: (eventName: string, callback: () => void) => void;
	removeEventListener: (eventName: string, callback: () => void) => void;
}
// export interface CameraControls extends OrbitControls {
// 	name?: string;
// 	// this_is_a_control: any;
// 	// name: string;
// }

export abstract class TypedCameraControlsEventNode<K extends NodeParamsConfig> extends TypedEventNode<K> {
	// controls() {
	// 	return this._controls;
	// }
	private _controls_by_viewer: Map<BaseViewerType, CameraControls> = new Map();

	async apply_controls(camera: Camera, viewer: BaseViewerType) {
		// I don't think I can just assign the camera at the moment
		// so the controls may need to be re-created everytime
		// TODO: the controls should be created (and disposed?) by the viewer
		//this.dispose_controls()
		viewer.controlsController?.dispose_controls();
		const canvas = viewer.canvas();
		if (!canvas) {
			return;
		}
		const controls = await this.create_controls_instance(camera, canvas);
		const current_controls = this._controls_by_viewer.get(viewer);
		if (current_controls) {
			current_controls.dispose();
		}
		this._controls_by_viewer.set(viewer, controls);
		const performance = Poly.performance.performanceManager();
		const timestamp = performance.now();
		controls.name = `${this.path()}:${camera.name}:${timestamp}:${this.controls_id()}`;
		await this.params.evalAll();
		this.setup_controls(controls);
		return controls;
	}
	controls_id() {
		return JSON.stringify(this.params.all.map((p) => p.valueSerialized()));
	}
	abstract update_required(): boolean;
	//this.cook()

	// dispose_controls: (controls_instance)->
	// 	if controls_instance?
	// 		controls_instance.dispose()

	abstract setup_controls(controls: CameraControls): void;
	//
	abstract dispose_controls_for_html_element_id(html_element_id: string): void;

	abstract create_controls_instance(camera: Camera, element: HTMLElement): Promise<CameraControls>;
	// abstract set_from_camera_node(controls: CameraControls, camera_node: BaseCameraObjNodeType): void;
	abstract endEventName(): string;
}

export type BaseCameraControlsEventNodeType = TypedCameraControlsEventNode<any>;
