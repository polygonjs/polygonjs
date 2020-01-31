import {Camera} from 'three/src/cameras/Camera';

import {TypedEventNode} from './_Base';
import {BaseCameraObjNodeType} from 'src/engine/nodes/obj/_BaseCamera';

import {OrbitControls} from 'modules/three/examples/jsm/controls/OrbitControls';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

export interface CameraControls extends OrbitControls {
	name?: string;
	// this_is_a_control: any;
	// name: string;
}

export abstract class TypedCameraControlsEventNode<K extends NodeParamsConfig> extends TypedEventNode<K> {
	// controls() {
	// 	return this._controls;
	// }

	async apply_controls(camera: Camera, html_element: HTMLElement) {
		// I don't think I can just assign the camera at the moment
		// so the controls may need to be re-created everytime
		// TODO: the controls should be created (and disposed?) by the viewer
		//this.dispose_controls()

		const controls = await this.create_controls_instance(camera, html_element);
		controls.name = `${this.full_path()}:${camera.name}`;
		// console.log(this._controls)
		await this.params.eval_all();
		this.setup_controls(controls);
		return controls;
		// })
		// });
	}
	//this.cook()

	// dispose_controls: (controls_instance)->
	// 	if controls_instance?
	// 		controls_instance.dispose()

	abstract setup_controls(controls: CameraControls): void;
	//

	abstract async create_controls_instance(camera: Camera, element: HTMLElement): Promise<CameraControls>;
	abstract set_from_camera_node(controls: CameraControls, camera_node: BaseCameraObjNodeType): void;
}

export type BaseCameraControlsEventNodeType = TypedCameraControlsEventNode<any>;
