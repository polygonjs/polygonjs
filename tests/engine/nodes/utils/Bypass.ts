import type {QUnit} from '../../../helpers/QUnit';
import {BufferAttribute, Object3D, Vector3, Box3} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {AttribCreateSopNode} from '../../../../src/engine/nodes/sop/AttribCreate';
import {CircleSopNode} from '../../../../src/engine/nodes/sop/Circle';
import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';
import {saveAndLoadScene} from '../../../helpers/ImportHelper';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodesutilsBypass(qUnit: QUnit) {
	const tmpBox = new Box3();
	const tmpSize = new Vector3();

	async function firstPos(node: BaseSopNodeType): Promise<Vector3> {
		const container = await node.compute();
		const coreGroup = container.coreContent()!;
		const object = coreGroup.threejsObjectsWithGeo()[0];
		const v = new Vector3();
		v.fromArray((object.geometry.attributes.position as BufferAttribute).array);
		return v;
	}

	qUnit.test('bypass flag simple', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const add1 = geo1.createNode('add');
		const transform1 = geo1.createNode('transform');
		const transform2 = geo1.createNode('transform');
		const dummy = geo1.createNode('add');
		dummy.flags.display.set(true);

		await scene.waitForCooksCompleted();
		transform1.setInput(0, add1);
		transform2.setInput(0, transform1);
		transform1.p.t.x.set(1);
		transform2.p.t.y.set(1);

		assert.deepEqual((await firstPos(add1)).toArray(), [0, 0, 0]);

		assert.deepEqual((await firstPos(transform2)).toArray(), [1, 1, 0]);
		assert.ok(!transform1.cookController.isCooking());
		assert.ok(!transform2.cookController.isCooking());

		transform1.flags.bypass.set(true);
		assert.deepEqual((await firstPos(transform2)).toArray(), [0, 1, 0]);
		assert.ok(!transform1.cookController.isCooking());
		assert.ok(!transform2.cookController.isCooking());

		transform2.flags.bypass.set(true);
		assert.deepEqual((await firstPos(transform2)).toArray(), [0, 0, 0]);
		// the sleep currently needs to be here
		// as there is a race condition where the node triggers a recook of itself.
		// I should investigate how the .endCook() method uses timestamps for that,
		// as well as how those timestamps are set
		await CoreSleep.sleep(100);
		assert.ok(!transform1.cookController.isCooking());
		assert.ok(!transform2.cookController.isCooking(), 'transform2 should not be cooking');

		transform1.flags.bypass.set(false);
		assert.deepEqual((await firstPos(transform2)).toArray(), [1, 0, 0]);
		await CoreSleep.sleep(100);
		assert.ok(!transform1.cookController.isCooking());
		assert.ok(!transform2.cookController.isCooking(), 'transform2 should not be cooking');

		transform2.flags.bypass.set(false);
		assert.deepEqual((await firstPos(transform2)).toArray(), [1, 1, 0]);
		assert.ok(!transform1.cookController.isCooking());
		assert.ok(!transform2.cookController.isCooking());
	});

	qUnit.test('bypass a node that has no input returns an empty container', async (assert) => {
		const geo1 = window.geo1;
		const spotlight1 = geo1.createNode('spotLight');
		const polarTransform1 = geo1.createNode('polarTransform');
		const hemisphereLight1 = geo1.createNode('hemisphereLight');
		const merge1 = geo1.createNode('merge');

		polarTransform1.setInput(0, spotlight1);
		merge1.setInput(0, polarTransform1);
		merge1.setInput(1, hemisphereLight1);

		let container = await merge1.compute();
		let objects = container.coreContent()!.threejsObjects();
		assert.notOk(merge1.states.error.active());
		assert.notOk(hemisphereLight1.states.error.active());
		assert.equal(objects.length, 2);
		assert.deepEqual(
			objects.map((o: Object3D) => o.name),
			['SpotLightContainer_spotLight1', 'hemisphereLight1']
		);

		hemisphereLight1.flags.bypass.set(true);
		container = await merge1.compute();
		objects = container.coreContent()!.threejsObjects();
		assert.notOk(merge1.states.error.active());
		assert.notOk(hemisphereLight1.states.error.active());
		assert.equal(objects.length, 1);
		assert.deepEqual(
			objects.map((o: Object3D) => o.name),
			['SpotLightContainer_spotLight1']
		);
	});

	qUnit.test('bypass a node that has no input but requires one sets the node as errored', async (assert) => {
		const geo1 = window.geo1;
		const spotlight1 = geo1.createNode('spotLight');
		const polarTransform1 = geo1.createNode('polarTransform');
		const hemisphereLight1 = geo1.createNode('hemisphereLight');
		const transform1 = geo1.createNode('transform');
		const merge1 = geo1.createNode('merge');

		polarTransform1.setInput(0, spotlight1);
		transform1.setInput(0, hemisphereLight1);
		merge1.setInput(0, polarTransform1);
		merge1.setInput(1, transform1);

		let container = await merge1.compute();
		assert.notOk(hemisphereLight1.states.error.active());
		assert.notOk(transform1.states.error.active());
		assert.notOk(merge1.states.error.active());
		assert.ok(container.coreContent());
		let objects = container.coreContent()!.threejsObjects();
		assert.equal(objects.length, 2);
		assert.deepEqual(
			objects.map((o: Object3D) => o.name),
			['SpotLightContainer_spotLight1', 'hemisphereLight1']
		);
		assert.equal(container.coreContent()!.pointsCount(), 0, '0 points');
		assert.equal(container.coreContent()!.threejsObjects().length, 2, '2 objects');

		hemisphereLight1.flags.bypass.set(true);
		container = await merge1.compute();
		assert.notOk(hemisphereLight1.states.error.active(), 'hemisphere not errored');
		assert.notOk(transform1.states.error.active(), 'transformed errored after bypassing hemisphereLight');
		assert.notOk(merge1.states.error.active());
		assert.ok(container.coreContent());
		assert.equal(container.coreContent()!.pointsCount(), 0, '0 points');
		assert.equal(container.coreContent()!.threejsObjects().length, 1, '1 object');

		transform1.flags.bypass.set(true);
		container = await merge1.compute();
		assert.notOk(hemisphereLight1.states.error.active());
		assert.notOk(transform1.states.error.active(), 'transformed NOT errored after bypassing transform');
		assert.notOk(merge1.states.error.active());
		assert.ok(container.coreContent());
		objects = container.coreContent()!.threejsObjects();
		assert.equal(objects.length, 1);
		assert.deepEqual(
			objects.map((o: Object3D) => o.name),
			['SpotLightContainer_spotLight1']
		);
		assert.equal(container.coreContent()!.pointsCount(), 0, '0 points');
		assert.equal(container.coreContent()!.threejsObjects().length, 1, '1 object');

		hemisphereLight1.flags.bypass.set(false);
		await CoreSleep.sleep(50); // TODO: ideally that should not be needed
		container = await merge1.compute();
		assert.notOk(hemisphereLight1.states.error.active());
		assert.notOk(transform1.states.error.active(), 'transformed NOT errored after un-bypassing hemisphereLight');
		assert.notOk(merge1.states.error.active());
		assert.ok(container.coreContent());
		objects = container.coreContent()!.threejsObjects();
		assert.equal(objects.length, 2);
		assert.deepEqual(
			objects.map((o: Object3D) => o.name),
			['SpotLightContainer_spotLight1', 'hemisphereLight1']
		);
		assert.equal(container.coreContent()!.pointsCount(), 0, '0 points');
		assert.equal(container.coreContent()!.threejsObjects().length, 2, '2 objects');

		transform1.flags.bypass.set(false);
		container = await merge1.compute();
		assert.notOk(hemisphereLight1.states.error.active());
		assert.notOk(transform1.states.error.active(), 'transform NOT errored after un-bypassing transform');
		assert.notOk(merge1.states.error.active());
		assert.ok(container.coreContent());
		objects = container.coreContent()!.threejsObjects();
		assert.equal(objects.length, 2);
		assert.deepEqual(
			objects.map((o: Object3D) => o.name),
			['SpotLightContainer_spotLight1', 'hemisphereLight1']
		);

		hemisphereLight1.flags.bypass.set(true);
		transform1.flags.bypass.set(true);
		container = await merge1.compute();
		assert.notOk(hemisphereLight1.states.error.active());
		assert.notOk(
			transform1.states.error.active(),
			'transform NOT errored after bypassing transform & hemisphereLight'
		);
		assert.notOk(merge1.states.error.active());
		assert.ok(container.coreContent());
		objects = container.coreContent()!.threejsObjects();
		assert.equal(objects.length, 1);
		assert.deepEqual(
			objects.map((o: Object3D) => o.name),
			['SpotLightContainer_spotLight1']
		);

		transform1.flags.bypass.set(false);
		container = await merge1.compute();
		assert.notOk(hemisphereLight1.states.error.active(), 'transform errored after un-bypassing transform');
		assert.notOk(transform1.states.error.active());
		assert.notOk(merge1.states.error.active());
		assert.ok(container.coreContent());
		assert.equal(container.coreContent()!.pointsCount(), 0, '0 points');
		assert.equal(container.coreContent()!.threejsObjects().length, 1, '1 object');
	});

	qUnit.test('a display node that is bypass does not prevent the scene from playing', async (assert) => {
		const scene = window.scene;
		const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const transform1 = geo1.createNode('transform');

		transform1.setInput(0, box1);
		transform1.flags.display.set(true);

		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(150);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			scene.play();
			assert.equal(scene.time(), 0);
			await CoreSleep.sleep(500);
			const time = scene.time();
			assert.in_delta(time, 0.5, 0.25, 'time is 0.5 sec');

			transform1.flags.bypass.set(true);
			await CoreSleep.sleep(500);
			assert.in_delta(scene.time(), time + 0.5, 0.25, 'time is 1 sec');
		});
	});

	qUnit.test('bypass a prim sop node followed by a mat node does not break the app', async (assert) => {
		const geo1 = window.geo1;
		const MAT = window.MAT;
		const boxTmp = geo1.createNode('box');
		boxTmp.flags.display.set(true);
		const box1 = geo1.createNode('box');
		const material1 = geo1.createNode('material');
		const meshbasic = MAT.createNode('meshBasic');
		material1.p.material.setNode(meshbasic);

		material1.setInput(0, box1);

		// wait to make sure objects are mounted to the scene
		let container = await material1.compute();
		assert.ok(container.coreContent());
		assert.notOk(material1.states.error.message());
		assert.equal(container.coreContent()?.pointsCount(), 24);

		//
		box1.flags.bypass.set(true);
		container = await material1.compute();
		assert.ok(container.coreContent());
		assert.notOk(material1.states.error.message());
		assert.equal(container.coreContent()?.pointsCount(), 0, 'empty coreGroup');

		box1.flags.bypass.set(false);
		container = await material1.compute();
		assert.ok(container.coreContent());
		assert.notOk(material1.states.error.message());
		assert.equal(container.coreContent()?.pointsCount(), 24);
	});

	qUnit.test('bypass: using an expression referencing a bypassed node that has not computed yet', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const circle1 = geo1.createNode('circle');
		const attribCreate1 = geo1.createNode('attribCreate');
		const attribCreate2 = geo1.createNode('attribCreate');

		attribCreate1.setInput(0, circle1);
		attribCreate2.setInput(0, attribCreate1);

		circle1.p.segments.set(13);

		attribCreate1.p.name.set('up');
		attribCreate1.p.size.set(3);
		attribCreate1.p.value3.set([0, 1, 0]);
		attribCreate1.flags.bypass.set(true);

		attribCreate2.p.name.set('pscale');
		attribCreate2.p.size.set(1);
		attribCreate2.p.value1.set(`@ptnum / (pointsCount(0)-1)`);
		attribCreate2.flags.bypass.set(true);
		attribCreate2.flags.display.set(true);

		await saveAndLoadScene(scene, async (scene2) => {
			const circle1b = scene2.node(circle1.path()) as CircleSopNode;
			const attribCreate1b = scene2.node(attribCreate1.path()) as AttribCreateSopNode;
			const attribCreate2b = scene2.node(attribCreate2.path()) as AttribCreateSopNode;

			async function getPoints() {
				const container = await attribCreate2b.compute();
				const points = container.coreContent()!.points();
				return points;
			}

			let points = await getPoints();
			assert.equal(points.length, 13);
			assert.notOk(points[0].hasAttrib('pscale'));
			assert.notOk(points[0].hasAttrib('up'));

			attribCreate2b.flags.bypass.set(false);
			points = await getPoints();
			assert.equal(points.length, 13);
			assert.ok(points[0].hasAttrib('pscale'));
			assert.notOk(points[0].hasAttrib('up'));
			assert.equal(points[0].attribValue('pscale'), 0);
			assert.equal(points[6].attribValue('pscale'), 0.5);
			assert.equal(points[12].attribValue('pscale'), 1);

			circle1b.p.segments.set(25);
			points = await getPoints();
			assert.equal(points.length, 25);
			assert.ok(points[0].hasAttrib('pscale'));
			assert.notOk(points[0].hasAttrib('up'));
			assert.equal(points[0].attribValue('pscale'), 0);
			assert.equal(points[12].attribValue('pscale'), 0.5);
			assert.equal(points[24].attribValue('pscale'), 1);

			attribCreate1b.flags.bypass.set(false);
			points = await getPoints();
			assert.equal(points.length, 25);
			assert.ok(points[0].hasAttrib('pscale'));
			assert.ok(points[0].hasAttrib('up'));
			assert.deepEqual((points[0].attribValue('up') as Vector3).toArray(), [0, 1, 0]);
			assert.deepEqual((points[1].attribValue('up') as Vector3).toArray(), [0, 1, 0]);
			assert.deepEqual((points[2].attribValue('up') as Vector3).toArray(), [0, 1, 0]);
		});
	});

	qUnit.test('bypass a node which cooks async errors gracefully if inputs are errored', async (assert) => {
		const geo1 = window.geo1;
		const box2 = geo1.createNode('box');
		box2.flags.display.set(true);

		const box1 = geo1.createNode('box');
		const transform1 = geo1.createNode('transform');
		const color1 = geo1.createNode('color');

		transform1.setInput(0, box1);
		color1.setInput(0, transform1);
		transform1.flags.bypass.set(true);

		async function getWidth() {
			const container = await color1.compute();
			const coreGroup = container.coreContent();
			if (coreGroup) {
				coreGroup.boundingBox(tmpBox);
				tmpBox.getSize(tmpSize);
				return tmpSize.x;
			} else {
				return -1;
			}
			// const size = new Vector3(-1, -1, -1);
			// if (bbox) {
			// }
		}
		assert.equal(await getWidth(), 1);
		box1.p.size.set(0.5);
		assert.equal(await getWidth(), 0.5);
		box1.p.size.set('1a');
		assert.equal(await getWidth(), -1);
		box1.p.size.set(1);
		assert.equal(await getWidth(), 1);
	});
}
