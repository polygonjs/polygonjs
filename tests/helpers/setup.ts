import 'qunit';
import {PolyScene} from 'src/engine/scene/PolyScene';
import {ObjectsManagerNode} from 'src/engine/nodes/manager/ObjectsManager';
import {PerspectiveCameraObjNode} from 'src/engine/nodes/obj/PerspectiveCamera';
import {GeoObjNode} from 'src/engine/nodes/obj/Geo';
import {MaterialsObjNode} from 'src/engine/nodes/obj/Materials';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {PostProcessObjNode} from 'src/engine/nodes/obj/PostProcess';
import {CopObjNode} from 'src/engine/nodes/obj/Cop';

import 'src/engine/poly/registers/All';
import {POLY} from 'src/engine/Poly';

window.create_renderer_if_none = () => {
	const first_renderer = POLY.renderers_controller.first_renderer();
	if (!first_renderer) {
		const renderer = new WebGLRenderer();
		POLY.renderers_controller.register_renderer(renderer);
	}
};
declare global {
	interface Window {
		create_renderer_if_none: () => void;
		sleep: (time: number) => Promise<void>;
		scene: PolyScene;
		root: ObjectsManagerNode;
		perpective_camera1: PerspectiveCameraObjNode;
		geo1: GeoObjNode;
		MAT: MaterialsObjNode;
		POST: PostProcessObjNode;
		COP: CopObjNode;
	}
}
QUnit.testStart(async () => {
	// return new Promise(async (resolve, reject) => {
	window.scene = new PolyScene();
	window.scene.set_name('test scene');
	window.scene.set_uuid('test');
	POLY.set_env('test');

	const root = window.scene.root;
	window.root = root;
	window.perpective_camera1 = root.create_node('perspective_camera');
	window.geo1 = root.create_node('geo');
	window.MAT = root.create_node('materials');
	window.MAT.set_name('MAT');
	window.POST = root.create_node('post_process');
	window.POST.set_name('POST');
	window.COP = root.create_node('cop');
	window.COP.set_name('COP');

	window.scene.loading_controller.set_auto_update(true);
	await window.scene.loading_controller.mark_as_loaded();

	// resolve();
	// });
});

// window.POLY.set = 'test';

// import './Runner/Helper';
// import './Helper';
// import './Core/_Module';
// import './Engine/_Module';
// import './Editor/_Module';

// window.test_runner_manager.run()

// console.log('Qunit start');
// QUnit.start();
// console.log('Qunit started');

window.sleep = (time) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			// console.log("slept for ", time)
			resolve();
		}, time);
	});
};
