import 'qunit';
import {PolyScene} from '../../src/engine/scene/PolyScene';
import {ObjectsManagerNode} from '../../src/engine/nodes/manager/ObjectsManager';
import {PerspectiveCameraObjNode} from '../../src/engine/nodes/obj/PerspectiveCamera';
import {GeoObjNode} from '../../src/engine/nodes/obj/Geo';
import {MaterialsObjNode} from '../../src/engine/nodes/obj/Materials';
import {PostProcessObjNode} from '../../src/engine/nodes/obj/PostProcess';
import {CopObjNode} from '../../src/engine/nodes/obj/Cop';

import {Poly} from '../../src/engine/Poly';

// register
import {AllRegister} from '../../src/engine/poly/registers/All';
AllRegister.run();

// window.create_renderer_if_none = () => {
// 	const first_renderer = POLY.renderers_controller.first_renderer();
// 	if (!first_renderer) {
// 		const renderer = new WebGLRenderer();
// 		POLY.renderers_controller.register_renderer(renderer);
// 	}
// };
declare global {
	interface Window {
		// create_renderer_if_none: () => void;
		scene: PolyScene;
		root: ObjectsManagerNode;
		perspective_camera1: PerspectiveCameraObjNode;
		geo1: GeoObjNode;
		MAT: MaterialsObjNode;
		POST: PostProcessObjNode;
		COP: CopObjNode;
	}
}
QUnit.testStart(async () => {
	// return new Promise(async (resolve, reject) => {
	window.scene = new PolyScene();
	window.scene.setName('test scene');
	window.scene.setUuid('test');
	Poly.setEnv('test');

	window.scene.loadingController.markAsLoading();
	window.scene.cooker.block();
	const root = window.scene.root();
	window.root = root;
	window.perspective_camera1 = root.createNode('perspectiveCamera');
	window.geo1 = root.createNode('geo');
	window.MAT = root.createNode('materials');
	window.MAT.setName('MAT');
	window.POST = root.createNode('postProcess');
	window.POST.setName('POST');
	window.COP = root.createNode('cop');
	window.COP.setName('COP');

	window.scene.loadingController.set_auto_update(true);
	await window.scene.loadingController.markAsLoaded();
	window.scene.cooker.unblock();
});
