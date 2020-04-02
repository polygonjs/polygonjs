import {PolyScene} from './scene/PolyScene';

import {CoreGraphNode} from '../core/graph/CoreGraphNode';
import {TypedNode} from './nodes/_Base';
import {TypedEventNode} from './nodes/event/_Base';
import {CodeEventNode} from './nodes/event/Code';
export {PolyScene, CoreGraphNode, TypedEventNode, TypedNode, CodeEventNode};

import {AllRegister} from './poly/registers/All';
AllRegister.run();

// import {SceneJsonExporter, SceneJsonExporterData} from './io/json/export/Scene';
// import default_scene_data from '../../public/examples/scenes/default_simple.json';
// import {SceneJsonImporter} from './io/json/import/Scene';

// export class Tester {
// 	static async load_scene() {
// 		const scene = await SceneJsonImporter.load_data(default_scene_data as SceneJsonExporterData);

// 		return scene;
// 	}
// 	static create_scene() {
// 		const scene = new PolyScene();
// 		scene.root.create_node('ambient_light');

// 		scene.loading_controller.mark_as_loaded();

// 		const perspective_camera1 = scene.root.create_node('perspective_camera');
// 		scene.cameras_controller.set_master_camera_node_path(perspective_camera1.full_path());
// 		perspective_camera1.p.t.z.set(10);

// 		const geo1 = scene.root.create_node('geo');
// 		geo1.flags.display.set(true);
// 		const box1 = geo1.create_node('box');
// 		box1.flags.display.set(true);
// 		geo1.p.r.y.set('$F+20');

// 		return scene;
// 	}

// 	static async test_save_and_load(scene: PolyScene) {
// 		const data = new SceneJsonExporter(scene).data();
// 		console.log(JSON.stringify(data));
// 		const scene2 = await SceneJsonImporter.load_data(data);
// 		const data2 = new SceneJsonExporter(scene2).data();
// 		console.log(JSON.stringify(data2));
// 	}
// }

// const stylesheet = document.createElement('style');
// stylesheet.innerText = 'html, body, canvas, .canvas_container {height: 100%; margin: 0px;} canvas {display: block;}';
// document.body.appendChild(stylesheet);
// const container = document.createElement('div');
// container.classList.add('canvas_container');
// document.body.appendChild(container);

// Tester.load_scene().then((scene) => {
// 	(window as any).scene = scene;
// 	scene.cameras_controller.master_camera_node?.create_viewer(container);
// 	scene.play();
// });

// Tester.test_save_and_load(scene);
