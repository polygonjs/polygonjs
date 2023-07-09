import {RendererUtils} from '../../../helpers/RendererUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
import {Mesh, Material, IUniform, WebGLRenderer, WebGLRenderTarget, Vector3} from 'three';
import {ClothSolverSopOnCreateRegister} from '../../../../src/core/hooks/onCreate/sop/ClothSolver';
import {ClothSolverStepSimulationOutput} from '../../../../src/engine/nodes/js/ClothSolverStepSimulation';
import {UNIFORM_PARAM_PREFIX, UNIFORM_TEXTURE_PREFIX} from '../../../../src/core/material/uniform';
import {createOrFindClothController} from '../../../../src/core/cloth/ClothControllerRegister';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/index_all';
import {PerspectiveCameraObjNode} from '../../../../src/engine/nodes/obj/PerspectiveCamera';
import {ClothSolverSopNode} from '../../../../src/engine/nodes/sop/ClothSolver';
import {MaterialSopNode} from '../../../../src/engine/nodes/sop/Material';

QUnit.test('sop/clothSolver simple', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.z.set(6);
	cameraNode.p.t.y.set(6);
	// cameraNode.p.t.x.set(10);
	cameraNode.p.r.x.set(-45);
	scene.root().createNode('hemisphereLight');

	const geo2 = scene.root().createNode('geo');
	geo2.createNode('planeHelper');

	const icosahedron1 = geo1.createNode('icosahedron');
	const clothSolver1 = geo1.createNode('clothSolver');

	const hookController = new ClothSolverSopOnCreateRegister();
	const createdNode = hookController.onCreate(clothSolver1);
	assert.ok(createdNode, 'createdNode');
	const {actor1, clothPrepare1, matNodes, glNodes} = createdNode!;
	const {materialNode} = matNodes;
	const {globals1, output1} = glNodes!;
	assert.ok(actor1, 'actor1');
	assert.ok(materialNode, 'materialNode');

	icosahedron1.p.detail.set(6);
	clothPrepare1.setInput(0, icosahedron1);
	materialNode.flags.display.set(true);

	const _testConstraint = async () => {
		const container = await materialNode.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;
		const clothController = createOrFindClothController(scene, clothSolver1, object)!.controller;
		assert.ok(clothController, 'clothController');

		await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
			scene.play();
			await CoreSleep.sleep(1000);
			assert.ok(object, 'object');
			const material = object.material as Material;
			assert.ok(material, 'material');
			const uniforms = material.userData.uniforms as Record<string, IUniform>;
			const textureSize =
				uniforms[`${UNIFORM_PARAM_PREFIX}${ClothSolverStepSimulationOutput.TEXTURE_SIZE}`].value;
			assert.equal(textureSize.x, 32);
			assert.equal(textureSize.y, 32);
			const texturePos0 =
				uniforms[`${UNIFORM_TEXTURE_PREFIX}${ClothSolverStepSimulationOutput.TEXTURE_POSITION0}`].value;
			assert.ok(texturePos0, 'pos0 ok');
			const texturePos1 =
				uniforms[`${UNIFORM_TEXTURE_PREFIX}${ClothSolverStepSimulationOutput.TEXTURE_POSITION1}`].value;
			assert.ok(texturePos1, 'pos1 ok');
			const textureNormal =
				uniforms[`${UNIFORM_TEXTURE_PREFIX}${ClothSolverStepSimulationOutput.TEXTURE_NORMAL}`].value;
			assert.ok(textureNormal, 'normal ok');

			// check textures are the ones from the render target
			const posRTs = clothController.fbo.positionRT;
			const uuids = posRTs.map((rt) => rt.texture.uuid);
			let currentPosRt: WebGLRenderTarget = posRTs[0];
			if (uuids[0] == texturePos0.uuid) {
				assert.equal(clothController.fbo.positionRT[0].texture.uuid, texturePos0.uuid, 'pos uuid');
			} else {
				currentPosRt = posRTs[1];
				assert.equal(clothController.fbo.positionRT[1].texture.uuid, texturePos0.uuid, 'pos uuid');
			}

			// value check
			const renderer = viewer.renderer()! as WebGLRenderer;
			assert.ok(renderer, 'renderer');
			const bufferWidth = 1;
			const bufferHeight = 1;
			const pixelBuffer = new Uint16Array(bufferWidth * bufferHeight * 4);
			renderer.readRenderTargetPixels(currentPosRt, 0, 0, bufferWidth, bufferHeight, pixelBuffer);
			assert.deepEqual(pixelBuffer.join(':'), [57582, 25156, 21792, 15360].join(':'), 'no move yet');

			// test constraint
			clothController.createConstraint(0);
			clothController.setConstraintPosition(new Vector3(0, 2, 0));

			await CoreSleep.sleep(100);
			renderer.readRenderTargetPixels(currentPosRt, 0, 0, bufferWidth, bufferHeight, pixelBuffer);
			assert.in_delta(pixelBuffer[0], 53856, 200, 'move contrained point');
			renderer.readRenderTargetPixels(currentPosRt, 1, 0, bufferWidth, bufferHeight, pixelBuffer);
			assert.in_delta(pixelBuffer[0], 53568, 400, 'move next point');

			await CoreSleep.sleep(1000);
			renderer.readRenderTargetPixels(currentPosRt, 0, 0, bufferWidth, bufferHeight, pixelBuffer);
			assert.in_delta(pixelBuffer[0], 54320, 200, 'after move contrained point');
			renderer.readRenderTargetPixels(currentPosRt, 1, 0, bufferWidth, bufferHeight, pixelBuffer);
			assert.in_delta(pixelBuffer[0], 54880, 200, 'after move next point');

			clothController.deleteConstraint();
			await CoreSleep.sleep(1000);
			renderer.readRenderTargetPixels(currentPosRt, 0, 0, bufferWidth, bufferHeight, pixelBuffer);
			assert.in_delta(pixelBuffer[0], 57674, 200, 'release contrained point');
			renderer.readRenderTargetPixels(currentPosRt, 1, 0, bufferWidth, bufferHeight, pixelBuffer);
			assert.in_delta(pixelBuffer[0], 57420, 200, 'release next point');
		});
	};
	await _testConstraint();

	const _testIntegrationMat = async () => {
		const sin1 = clothSolver1.createNode('sin');
		const floatToVec3_1 = clothSolver1.createNode('floatToVec3');
		const vec3ToFloat_1 = clothSolver1.createNode('vec3ToFloat');
		const add1 = clothSolver1.createNode('add');
		const multAdd1 = clothSolver1.createNode('multAdd');
		const multAdd2 = clothSolver1.createNode('multAdd');
		const multAdd3 = clothSolver1.createNode('multAdd');
		//
		// sin1.setInput(0, globals1, 'time');
		multAdd1.setInput(0, sin1);
		floatToVec3_1.setInput(1, multAdd1);
		add1.setInput(0, globals1, 'position');
		add1.setInput(1, floatToVec3_1);
		output1.setInput(0, add1);
		//
		vec3ToFloat_1.setInput(0, globals1, 'position');
		multAdd3.setInput(0, vec3ToFloat_1);
		multAdd2.setInput(0, globals1, 'time');
		multAdd2.setInput(3, multAdd3);
		sin1.setInput(0, multAdd2);
		//
		multAdd1.params.get('mult')!.set(0.01);
		multAdd2.params.get('mult')!.set(10);
		multAdd3.params.get('mult')!.set(3.3);

		const container = await materialNode.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;
		const clothController = createOrFindClothController(scene, clothSolver1, object)!.controller;
		assert.ok(clothController, 'clothController');

		await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
			scene.play();
			await CoreSleep.sleep(1000);

			assert.ok(object, 'object');
			const material = object.material as Material;
			assert.ok(material, 'material');
			const uniforms = material.userData.uniforms as Record<string, IUniform>;
			const textureSize =
				uniforms[`${UNIFORM_PARAM_PREFIX}${ClothSolverStepSimulationOutput.TEXTURE_SIZE}`].value;
			assert.equal(textureSize.x, 32);
			assert.equal(textureSize.y, 32);
			const texturePos0 =
				uniforms[`${UNIFORM_TEXTURE_PREFIX}${ClothSolverStepSimulationOutput.TEXTURE_POSITION0}`].value;

			// check textures are the ones from the render target
			const posRTs = clothController.fbo.positionRT;
			const uuids = posRTs.map((rt) => rt.texture.uuid);
			let currentPosRt: WebGLRenderTarget = posRTs[0];
			if (uuids[0] == texturePos0.uuid) {
				assert.equal(clothController.fbo.positionRT[0].texture.uuid, texturePos0.uuid, 'pos uuid');
			} else {
				currentPosRt = posRTs[1];
				assert.equal(clothController.fbo.positionRT[1].texture.uuid, texturePos0.uuid, 'pos uuid');
			}

			const renderer = viewer.renderer()! as WebGLRenderer;
			assert.ok(renderer, 'renderer');
			const bufferWidth = 1;
			const bufferHeight = 1;
			const pixelBuffer = new Uint16Array(bufferWidth * bufferHeight * 4);

			renderer.readRenderTargetPixels(currentPosRt, 0, 0, bufferWidth, bufferHeight, pixelBuffer);
			assert.in_delta(pixelBuffer[0], 57596, 500, 'move contrained point');
		});
	};

	await _testIntegrationMat();

	const _testWithoutAssembler = async () => {
		// without assembler
		scene.setFrame(0);
		const data = await new SceneJsonExporter(scene).data();
		await AssemblersUtils.withUnregisteredAssembler(clothSolver1.usedAssembler(), async () => {
			// console.log('************ LOAD **************');

			const scene2 = await SceneJsonImporter.loadData(data);
			await scene2.waitForCooksCompleted();
			const cameraNode2 = scene2.node(cameraNode.path()) as PerspectiveCameraObjNode;
			const clothSolver2 = scene2.node(clothSolver1.path()) as ClothSolverSopNode;
			const materialNode2 = scene2.node(materialNode.path()) as MaterialSopNode;

			const container = await materialNode2.compute();
			const object = container.coreContent()!.threejsObjects()[0] as Mesh;
			const clothController = createOrFindClothController(scene2, clothSolver2, object)!.controller;
			assert.ok(clothController, 'clothController');

			await RendererUtils.withViewer({cameraNode: cameraNode2}, async ({viewer, element}) => {
				scene2.play();
				await CoreSleep.sleep(1000);

				assert.ok(object, 'object');
				const material = object.material as Material;
				assert.ok(material, 'material');
				const uniforms = material.userData.uniforms as Record<string, IUniform>;
				const textureSize =
					uniforms[`${UNIFORM_PARAM_PREFIX}${ClothSolverStepSimulationOutput.TEXTURE_SIZE}`].value;
				assert.equal(textureSize.x, 32);
				assert.equal(textureSize.y, 32);
				const texturePos0 =
					uniforms[`${UNIFORM_TEXTURE_PREFIX}${ClothSolverStepSimulationOutput.TEXTURE_POSITION0}`].value;

				// check textures are the ones from the render target
				const posRTs = clothController.fbo.positionRT;
				const uuids = posRTs.map((rt) => rt.texture.uuid);
				let currentPosRt: WebGLRenderTarget = posRTs[0];
				if (uuids[0] == texturePos0.uuid) {
					assert.equal(clothController.fbo.positionRT[0].texture.uuid, texturePos0.uuid, 'pos uuid');
				} else {
					currentPosRt = posRTs[1];
					assert.equal(clothController.fbo.positionRT[1].texture.uuid, texturePos0.uuid, 'pos uuid');
				}

				const renderer = viewer.renderer()! as WebGLRenderer;
				assert.ok(renderer, 'renderer');
				const bufferWidth = 1;
				const bufferHeight = 1;
				const pixelBuffer = new Uint16Array(bufferWidth * bufferHeight * 4);

				renderer.readRenderTargetPixels(currentPosRt, 0, 0, bufferWidth, bufferHeight, pixelBuffer);
				assert.in_delta(pixelBuffer[0], 55840, 2000, 'move contrained point');
			});
		});
	};
	await _testWithoutAssembler();
});
