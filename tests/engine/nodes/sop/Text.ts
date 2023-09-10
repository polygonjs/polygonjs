import type {QUnit} from '../../../helpers/QUnit';
import {CoreObject} from '../../../../src/core/geometry/modules/three/CoreObject';
import {TextType} from '../../../../src/core/geometry/text/TextType';
import {checkConsolePrints} from '../../../helpers/Console';
import {Box3, Vector3} from 'three';
export function testenginenodessopText(qUnit: QUnit) {
	const tmpBox = new Box3();
	const tmpSize = new Vector3();

	qUnit.test('sop/text simple', async (assert) => {
		const geo1 = window.geo1;

		const text1 = geo1.createNode('text');

		let container = await text1.compute();
		let core_group = container.coreContent();
		let geometry = core_group?.threejsObjectsWithGeo()[0]?.geometry;

		assert.ok(geometry);
		assert.equal(container.pointsCount(), 3324);

		text1.p.text.set('this is a test');
		container = await text1.compute();
		core_group = container.coreContent();
		geometry = core_group?.threejsObjectsWithGeo()[0]?.geometry;

		assert.ok(geometry);
		assert.equal(container.pointsCount(), 3792);
	});

	qUnit.test('sop/text prints no warning', async (assert) => {
		const geo1 = window.geo1;

		const consoleHistory = await checkConsolePrints(async () => {
			console.log('callback start');
			const text1 = geo1.createNode('text');
			const transform1 = geo1.createNode('transform');
			const transform2 = geo1.createNode('transform');
			transform1.setInput(0, text1);
			transform2.setInput(0, transform1);

			let container = await transform2.compute();
			let core_group = container.coreContent();
			let geometry = core_group?.threejsObjectsWithGeo()[0]?.geometry;

			assert.ok(geometry);
			assert.equal(container.pointsCount(), 3324);

			text1.p.text.set('this is a test');
			container = await transform2.compute();
			core_group = container.coreContent();
			geometry = core_group?.threejsObjectsWithGeo()[0]?.geometry;

			assert.ok(geometry);
			assert.equal(container.pointsCount(), 3792);
			console.log('callback end');
		});
		assert.equal(consoleHistory.log[0][0], 'callback start');
		assert.equal(consoleHistory.log[1][0], 'callback end');
		assert.equal(consoleHistory.log.length, 2);
		assert.equal(consoleHistory.warn.length, 0);
		assert.equal(consoleHistory.error.length, 0);
	});

	qUnit.test('sop/text does not fail with an empty text', async (assert) => {
		const geo1 = window.geo1;

		const text1 = geo1.createNode('text');
		text1.p.font.set('/fonts/SourceCodePro-Regular.ttf');
		text1.p.text.set('');

		let container = await text1.compute();
		assert.equal(container.pointsCount(), 0);
		assert.equal(container.objectsCount(), 0);
		assert.notOk(text1.states.error.active());
		assert.notOk(text1.states.error.message());
	});

	qUnit.test('sop/text does not fail with just spaces', async (assert) => {
		const geo1 = window.geo1;

		const text1 = geo1.createNode('text');
		text1.p.font.set('/fonts/SourceCodePro-Regular.ttf');
		text1.p.text.set(' ');

		let container = await text1.compute();
		assert.equal(container.pointsCount(), 0);
		assert.equal(container.objectsCount(), 0);
		assert.notOk(text1.states.error.active());
		assert.notOk(text1.states.error.message());
	});

	qUnit.test('sop/text does not fail with just spaces and newlines', async (assert) => {
		const geo1 = window.geo1;

		const text1 = geo1.createNode('text');
		text1.p.font.set('/fonts/SourceCodePro-Regular.ttf');
		text1.p.text.set(` 
	 
	`);

		let container = await text1.compute();
		assert.equal(container.pointsCount(), 0);
		assert.equal(container.objectsCount(), 0);
		assert.notOk(text1.states.error.active());
		assert.notOk(text1.states.error.message());
	});

	qUnit.test('sop/text with json font', async (assert) => {
		const geo1 = window.geo1;

		const text1 = geo1.createNode('text');
		text1.p.font.set('/fonts/droid_sans_regular.typeface.json');

		let container = await text1.compute();
		assert.equal(container.pointsCount(), 3324);
	});

	qUnit.test('sop/text with ttf font', async (assert) => {
		const geo1 = window.geo1;

		const text1 = geo1.createNode('text');
		text1.p.font.set('/fonts/SourceCodePro-Regular.ttf');

		let container = await text1.compute();
		assert.equal(container.pointsCount(), 3204);
	});

	qUnit.test('sop/text with a non existing font', async (assert) => {
		const geo1 = window.geo1;

		const text1 = geo1.createNode('text');
		text1.p.font.set('/fonts/doesnotexist.ttf');

		let container = await text1.compute();
		assert.ok(container, 'container exists');
		assert.equal(
			text1.states.error.message(),
			'could not load font (/fonts/doesnotexist.ttf, reason:fetch for "http://localhost:5000/fonts/doesnotexist.ttf" responded with 406: Not Acceptable)'
		);
		assert.equal(container.pointsCount(), 0);
	});

	qUnit.test('sop/text with multiline', async (assert) => {
		const geo1 = window.geo1;

		const text1 = geo1.createNode('text');
		text1.p.text.set('line1line2');

		async function getSize() {
			const container = await text1.compute();
			container.boundingBox(tmpBox);
			tmpBox.getSize(tmpSize);
			return tmpSize;
		}

		let container = await text1.compute();
		assert.equal(container.coreContent()?.threejsObjects().length, 1);

		assert.more_than_or_equal((await getSize()).y, 1);
		assert.less_than_or_equal((await getSize()).y, 1.2);

		text1.p.text.set('line1\nline2');

		container = await text1.compute();
		assert.equal(container.coreContent()?.threejsObjects().length, 1);
		assert.more_than_or_equal((await getSize()).y, 2.1);
		assert.less_than_or_equal((await getSize()).y, 3.5);
	});

	qUnit.test('sop/text with multiline and mutliple objects', async (assert) => {
		const geo1 = window.geo1;

		const text1 = geo1.createNode('text');
		text1.p.splitPerLetter.set(1);
		text1.p.text.set('line1line2');
		async function getSize() {
			const container = await text1.compute();
			container.boundingBox(tmpBox);
			tmpBox.getSize(tmpSize);
			return tmpSize;
		}

		let container = await text1.compute();
		// TODO: at the moment, letters like i (lowercase) generate 2 objects, when it should be 1
		assert.equal(container.coreContent()?.threejsObjects().length, 10);
		assert.more_than_or_equal((await getSize()).y, 1);
		assert.less_than_or_equal((await getSize()).y, 1.6);

		text1.p.text.set('line1\nli ne2');
		text1.p.keepEmptyGeometries.set(true);

		container = await text1.compute();
		assert.equal(container.coreContent()?.threejsObjects().length, 11);
		assert.deepEqual(
			container
				.coreContent()
				?.threejsCoreObjects()
				.map((o: CoreObject) => o.attribValue('character')),
			['l', 'i', 'n', 'e', '1', 'l', 'i', ' ', 'n', 'e', '2']
		);
		assert.deepEqual(
			container
				.coreContent()
				?.threejsCoreObjects()
				.map((o: CoreObject) => o.attribValue('lineId')),
			[0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]
		);
		assert.deepEqual(
			container
				.coreContent()
				?.threejsCoreObjects()
				.map((o: CoreObject) => o.attribValue('characterId')),
			[0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11]
		);
		assert.more_than_or_equal((await getSize()).y, 2.1);
		assert.less_than_or_equal((await getSize()).y, 3.5);

		text1.p.keepEmptyGeometries.set(false);
		container = await text1.compute();
		assert.equal(container.coreContent()?.threejsObjects().length, 10);
		assert.deepEqual(
			container
				.coreContent()
				?.threejsCoreObjects()
				.map((o: CoreObject) => o.attribValue('character')),
			['l', 'i', 'n', 'e', '1', 'l', 'i', 'n', 'e', '2']
		);
	});

	qUnit.test('sop/text as different types', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const text1 = geo1.createNode('text');
		text1.p.text.set('some text to test');
		await scene.root().processQueue();
		let container;

		text1.setTextType(TextType.MESH);
		assert.ok(text1.isDirty());
		container = await text1.compute();
		assert.notOk(text1.isDirty());
		assert.equal(container.pointsCount(), 4776);

		text1.setTextType(TextType.FLAT);
		assert.ok(text1.isDirty());
		container = await text1.compute();
		assert.notOk(text1.isDirty());
		assert.equal(container.pointsCount(), 3773);

		text1.setTextType(TextType.LINE);
		assert.ok(text1.isDirty());
		container = await text1.compute();
		assert.notOk(text1.isDirty());
		assert.equal(container.pointsCount(), 3792);

		text1.setTextType(TextType.STROKE);
		assert.ok(text1.isDirty());
		container = await text1.compute();
		assert.notOk(text1.isDirty());
		assert.equal(container.pointsCount(), 22746);
	});

	qUnit.test('sop/text can recover from generation errors', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		geo1.flags.display.set(false); // cancels geo node displayNodeController

		const box = geo1.createNode('box');
		box.flags.display.set(true);
		const text1 = geo1.createNode('text');
		await scene.root().processQueue();
		let container;

		text1.p.font.set('/fonts/Absolute.ttf');

		text1.p.text.set('test');
		container = await text1.compute();
		assert.notOk(text1.states.error.active(), 'no error');
		assert.equal(container.pointsCount(), 4200, 'points count is 4200');

		text1.p.text.set('ぁぃぅえおがぎぐげござじずぜぞだぢつでどなに');
		container = await text1.compute();
		assert.ok(text1.states.error.active(), 'error present');
		assert.equal(text1.states.error.message(), 'failed to generate geometry. Try to remove some characters');
		assert.equal(container.pointsCount(), 0);

		text1.p.text.set('test');
		container = await text1.compute();
		assert.notOk(text1.states.error.active(), 'no error');
		assert.equal(container.pointsCount(), 4200, 'points count is 4200');
	});
}
