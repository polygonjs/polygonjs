import type {QUnit} from '../../../helpers/QUnit';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {ObjectBuilderSopNode} from '../../../../src/engine/nodes/sop/ObjectBuilder';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {FloatParam} from '../../../../src/engine/params/Float';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {CoreObject} from '../../../../src/core/geometry/Object';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
export function testenginenodessopObjectBuilder(qUnit: QUnit) {
	qUnit.test('sop/ObjectBuilder simple', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const objectBuilder1 = geo1.createNode('objectBuilder');
		objectBuilder1.setInput(0, box1);
		//
		const output1 = objectBuilder1.createNode('output');
		const add1 = objectBuilder1.createNode('add');
		const globals1 = objectBuilder1.createNode('globals');
		const param1 = objectBuilder1.createNode('param');
		const floatToVec3_1 = objectBuilder1.createNode('floatToVec3');
		output1.setInput('position', add1);

		param1.setJsType(JsConnectionPointType.FLOAT);
		param1.p.name.set('offset');
		floatToVec3_1.setInput('x', param1);

		add1.setInput(0, globals1, 'position');
		add1.setInput(1, floatToVec3_1);

		async function getX() {
			const container = await objectBuilder1.compute();
			const object = container.coreContent()!.threejsObjectsWithGeo()[0];
			return object.position.x;
		}
		async function getY() {
			const container = await objectBuilder1.compute();
			const object = container.coreContent()!.threejsObjectsWithGeo()[0];
			return object.position.y;
		}

		// no addition
		assert.equal(await getX(), 0);
		assert.equal(await getY(), 0);

		// with addition
		floatToVec3_1.p.y.set(1);
		assert.equal(await getX(), 0);
		assert.equal(await getY(), 1);

		// with param change
		const offset = objectBuilder1.params.get('offset') as FloatParam;
		assert.ok(offset);
		assert.equal(offset.type(), ParamType.FLOAT);
		offset.set(1);
		assert.equal(await getX(), 1);
		assert.equal(await getY(), 1);

		const data = await new SceneJsonExporter(scene).data();
		await AssemblersUtils.withUnregisteredAssembler(objectBuilder1.usedAssembler(), async () => {
			const scene2 = await SceneJsonImporter.loadData(data);
			await scene2.waitForCooksCompleted();
			const objectBuilder2 = scene2.node(objectBuilder1.path()) as ObjectBuilderSopNode;
			async function getX2() {
				const container = await objectBuilder2.compute();
				const object = container.coreContent()!.threejsObjectsWithGeo()[0];
				return object.position.x;
			}
			async function getY2() {
				const container = await objectBuilder2.compute();
				const object = container.coreContent()!.threejsObjectsWithGeo()[0];
				return object.position.y;
			}

			const offset2 = objectBuilder2.params.get('offset')! as FloatParam;
			assert.ok(offset2);
			assert.equal(offset2.type(), ParamType.FLOAT);
			assert.equal(offset2.value, 1);

			assert.equal(await getX2(), 1);
			assert.equal(await getY2(), 1);

			offset2.set(2);
			assert.equal(await getX2(), 2);
			assert.equal(await getY2(), 1);
		});
	});

	qUnit.test('sop/ObjectBuilder get set attributes', async (assert) => {
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const attribCreate1 = geo1.createNode('attribCreate');
		const objectBuilder1 = geo1.createNode('objectBuilder');
		attribCreate1.setInput(0, box1);
		objectBuilder1.setInput(0, attribCreate1);
		//
		attribCreate1.setAttribClass(AttribClass.OBJECT);
		attribCreate1.p.name.set('test');
		attribCreate1.p.value1.set(1);
		//
		const attribute1 = objectBuilder1.createNode('attribute');
		const attribute2 = objectBuilder1.createNode('attribute');
		const add1 = objectBuilder1.createNode('add');
		objectBuilder1.createNode('output');

		[attribute1, attribute2].forEach((attribNode) => {
			attribNode.setJsType(JsConnectionPointType.FLOAT);
			attribNode.p.name.set('test');
		});
		attribute2.p.exportWhenConnected.set(true);
		attribute2.setInput(0, add1);
		add1.setInput(0, attribute1);

		async function getAttribValue(): Promise<number> {
			const container = await objectBuilder1.compute();
			const object = container.coreContent()!.threejsObjectsWithGeo()[0];
			return CoreObject.attribValue(object, 'test') as number;
		}

		// no addition
		assert.equal(await getAttribValue(), 1);

		// with addition
		add1.params.get('add1')!.set(1);
		assert.equal(await getAttribValue(), 2);
	});

	function _prepareForSave(objectBuilder1: ObjectBuilderSopNode) {
		const globals = objectBuilder1.createNode('globals');
		const output = objectBuilder1.createNode('output');
		const add1 = objectBuilder1.createNode('add');

		output.setInput('position', add1);
		add1.setInput(0, globals, 'position');
	}

	qUnit.test('sop/ObjectBuilder persisted config is saved after scene play', async (assert) => {
		const scene = window.scene;
		const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const objectBuilder1 = geo1.createNode('objectBuilder');

		objectBuilder1.setInput(0, box1);
		objectBuilder1.flags.display.set(true);

		_prepareForSave(objectBuilder1);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			scene.play();
			await CoreSleep.sleep(100);

			const data = await new SceneJsonExporter(scene).data();
			assert.ok(data);
			const functionNodeNames = Object.keys(data.jsFunctionBodies || {});
			assert.deepEqual(functionNodeNames, [objectBuilder1.path()], 'actor is saved');
		});
		RendererUtils.dispose();
	});
	qUnit.test('sop/ObjectBuilder persisted config is saved without requiring scene play', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const objectBuilder1 = geo1.createNode('objectBuilder');

		objectBuilder1.setInput(0, box1);
		objectBuilder1.flags.display.set(true);

		_prepareForSave(objectBuilder1);

		const data = await new SceneJsonExporter(scene).data();
		assert.ok(data);
		const functionNodeNames = Object.keys(data.jsFunctionBodies || {});
		assert.deepEqual(functionNodeNames, [objectBuilder1.path()], 'actor is saved');
	});
	qUnit.test(
		'sop/ObjectBuilder persisted config is saved without requiring scene play nor display flag',
		async (assert) => {
			const scene = window.scene;
			const geo1 = window.geo1;
			const box1 = geo1.createNode('box');
			const objectBuilder1 = geo1.createNode('objectBuilder');

			objectBuilder1.setInput(0, box1);
			box1.flags.display.set(true);

			_prepareForSave(objectBuilder1);

			const data = await new SceneJsonExporter(scene).data();
			assert.ok(data);
			const functionNodeNames = Object.keys(data.jsFunctionBodies || {});
			assert.deepEqual(functionNodeNames, [objectBuilder1.path()], 'actor is saved');
		}
	);
}
