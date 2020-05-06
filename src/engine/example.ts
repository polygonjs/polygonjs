import {SceneJsonImporter} from './io/json/import/Scene';
import {PolyScene} from './scene/PolyScene';

import {AllRegister} from './poly/registers/All';
AllRegister.run();

export {PolyScene, SceneJsonImporter};

const scene_url = '/examples/scenes/mesh_lambert_builder.json';
async function load_scene() {
	const response = await fetch(scene_url);
	const json = await response.json();
	const scene = await SceneJsonImporter.load_data(json);
	const camera_node = scene.cameras_controller.master_camera_node;
	const element = document.getElementById('app');
	if (camera_node && element) {
		camera_node.create_viewer(element);
	}
}

load_scene();
