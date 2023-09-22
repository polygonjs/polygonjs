import {QUnit} from './QUnit';
import {PolyScene} from '../../src/engine/scene/PolyScene';
import type {RootManagerNode} from '../../src/engine/nodes/manager/Root';
import type {PerspectiveCameraObjNode} from '../../src/engine/nodes/obj/PerspectiveCamera';
import type {GeoObjNode} from '../../src/engine/nodes/obj/Geo';
import type {MaterialsNetworkObjNode} from '../../src/engine/nodes/obj/MaterialsNetwork';
import type {PostProcessNetworkObjNode} from '../../src/engine/nodes/obj/PostProcessNetwork';
import type {CopNetworkObjNode} from '../../src/engine/nodes/obj/CopNetwork';
import {CoreNodeSerializer} from '../../src/engine/nodes/utils/CoreNodeSerializer';
import {CoreParamSerializer} from '../../src/engine/params/utils/CoreParamSerializer';
import {addQUnitAssertions} from './assertions';

import {Poly} from '../../src/engine/Poly';

// register
import {AllRegister} from '../../src/engine/poly/registers/All';
// import {AllModulesRegister} from '../../src/engine/poly/registers/modules/All';
import {waitForUserInteraction} from './UserInteraction';
import {AbstractRenderer} from '../../src/engine/viewers/Common';
// import {GLTFLoaderHandler} from '../../src/core/loader/geometry/GLTF';
AllRegister.registerAll();
// AllModulesRegister.run(Poly);

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
		root: RootManagerNode;
		perspective_camera1: PerspectiveCameraObjNode;
		geo1: GeoObjNode;
		MAT: MaterialsNetworkObjNode;
		POST: PostProcessNetworkObjNode;
		COP: CopNetworkObjNode;
	}
}

let count = 0;
// export {QUnit};
export function setupQUnit(qunit: QUnit) {
	addQUnitAssertions(qunit);

	qunit.testStart(async () => {
		console.log(`%c ^^^^ ${count} ${QUnit.config.current.testName}`, 'background: #222; color: #da5555');

		await waitForUserInteraction();

		function deregisterAllRenderers() {
			const scenes = Poly.scenesRegister.scenes();
			for (const scene of scenes) {
				const renderers: AbstractRenderer[] = [];
				scene.renderersRegister.renderers(renderers);
				for (const renderer of renderers) {
					scene.renderersRegister.deregisterRenderer(renderer);
				}
			}
		}

		deregisterAllRenderers();
		Poly.blobs.clear();
		// GLTFLoaderHandler.reset();
		// return new Promise(async (resolve, reject) => {
		window.scene = new PolyScene({
			root: {serializerClass: CoreNodeSerializer},
			paramsSerializerClass: CoreParamSerializer,
		});
		window.scene.setName(QUnit.config.current.testName);
		window.scene.setUuid(QUnit.config.current.testName);
		Poly.setEnv('test');

		window.scene.loadingController.markAsLoading();
		window.scene.cooker.block();
		const root = window.scene.root();
		window.root = root;
		window.perspective_camera1 = root.createNode('perspectiveCamera');
		window.scene.camerasController.setMainCamera(window.perspective_camera1.object);
		window.geo1 = root.createNode('geo');
		window.MAT = root.createNode('materialsNetwork');
		window.MAT.setName('MAT');
		window.POST = root.createNode('postProcessNetwork');
		window.POST.setName('POST');
		window.COP = root.createNode('copNetwork');
		window.COP.setName('COP');

		window.scene.loadingController.setAutoUpdate(true);
		await window.scene.loadingController.markAsLoaded();
		window.scene.cooker.unblock();
	});
	qunit.testDone(() => {
		Poly.dispose();
		// it's preferable to not display anything
		// so that we can correctly display non-blocking crashing tests
		console.log(`%c ✓ ${count} ${QUnit.config.current.testName}`, 'background: #222; color: #bada55');
		count++;
	});
}
