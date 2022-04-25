import {Object3D} from 'three';
import {CoreObject} from '../../../../src/core/geometry/Object';
import {TextType, TEXT_TYPES} from '../../../../src/engine/nodes/sop/Text';
import {checkConsolePrints} from '../../../helpers/Console';

QUnit.test('sop/text simple', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.createNode('text');

	let container = await text1.compute();
	let core_group = container.coreContent();
	let geometry = core_group?.objectsWithGeo()[0]?.geometry;

	assert.ok(geometry);
	assert.equal(container.pointsCount(), 3324);

	text1.p.text.set('this is a test');
	container = await text1.compute();
	core_group = container.coreContent();
	geometry = core_group?.objectsWithGeo()[0]?.geometry;

	assert.ok(geometry);
	assert.equal(container.pointsCount(), 3792);
});

QUnit.test('sop/text prints no warning', async (assert) => {
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
		let geometry = core_group?.objectsWithGeo()[0]?.geometry;

		assert.ok(geometry);
		assert.equal(container.pointsCount(), 3324);

		text1.p.text.set('this is a test');
		container = await transform2.compute();
		core_group = container.coreContent();
		geometry = core_group?.objectsWithGeo()[0]?.geometry;

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

QUnit.test('sop/text with json font', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.createNode('text');
	text1.p.font.set('/fonts/droid_sans_regular.typeface.json');

	let container = await text1.compute();
	assert.equal(container.pointsCount(), 3324);
});

QUnit.test('sop/text with ttf font', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.createNode('text');
	text1.p.font.set('/fonts/SourceCodePro-Regular.ttf');

	let container = await text1.compute();
	assert.equal(container.pointsCount(), 3204);
});

QUnit.test('sop/text with a non existing font', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.createNode('text');
	text1.p.font.set('/fonts/doesnotexist.ttf');

	let container = await text1.compute();
	assert.ok(container, 'container exists');
	assert.equal(text1.states.error.message(), 'count not load font (/fonts/doesnotexist.ttf)');
	assert.equal(container.pointsCount(), 0);
});

QUnit.test('sop/text with multiline', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.createNode('text');
	text1.p.text.set('line1line2');

	let container = await text1.compute();
	assert.equal(container.coreContent()?.objects().length, 1);
	assert.more_than_or_equal(container.size().y, 1);
	assert.less_than_or_equal(container.size().y, 1.2);

	text1.p.text.set('line1\nline2');

	container = await text1.compute();
	assert.equal(container.coreContent()?.objects().length, 1);
	assert.more_than_or_equal(container.size().y, 2.1);
	assert.less_than_or_equal(container.size().y, 3.5);
});

QUnit.test('sop/text with multiline and mutliple objects', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.createNode('text');
	text1.p.splitPerLine.set(1);
	text1.p.text.set('line1line2');

	let container = await text1.compute();
	assert.equal(container.coreContent()?.objects().length, 1);
	assert.more_than_or_equal(container.size().y, 1);
	assert.less_than_or_equal(container.size().y, 1.2);

	text1.p.text.set('line1\nli ne2');

	container = await text1.compute();
	assert.equal(container.coreContent()?.objects().length, 2);
	assert.deepEqual(
		container
			.coreContent()
			?.objects()
			.map((o: Object3D) => o.name),
		['line1', 'li_ne2']
	);
	assert.deepEqual(
		container
			.coreContent()
			?.coreObjects()
			.map((o: CoreObject) => o.attribValue('lineIndex')),
		[0, 1]
	);
	assert.more_than_or_equal(container.size().y, 2.1);
	assert.less_than_or_equal(container.size().y, 3.5);
});

QUnit.test('sop/text as different types', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const text1 = geo1.createNode('text');
	text1.p.text.set('some text to test');
	await scene.root().processQueue();
	let container;

	text1.p.type.set(TEXT_TYPES.indexOf(TextType.MESH));
	assert.ok(text1.isDirty());
	container = await text1.compute();
	assert.notOk(text1.isDirty());
	assert.equal(container.pointsCount(), 4776);

	text1.p.type.set(TEXT_TYPES.indexOf(TextType.FLAT));
	assert.ok(text1.isDirty());
	container = await text1.compute();
	assert.notOk(text1.isDirty());
	assert.equal(container.pointsCount(), 3773);

	text1.p.type.set(TEXT_TYPES.indexOf(TextType.LINE));
	assert.ok(text1.isDirty());
	container = await text1.compute();
	assert.notOk(text1.isDirty());
	assert.equal(container.pointsCount(), 3792);

	text1.p.type.set(TEXT_TYPES.indexOf(TextType.STROKE));
	assert.ok(text1.isDirty());
	container = await text1.compute();
	assert.notOk(text1.isDirty());
	assert.equal(container.pointsCount(), 22746);
});

QUnit.test('sop/text can recover from generation errors', async (assert) => {
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

	text1.p.text.set('test!!');
	container = await text1.compute();
	assert.ok(text1.states.error.active(), 'error present');
	assert.equal(text1.states.error.message(), 'failed to generate geometry. Try to remove some characters');
	assert.equal(container.pointsCount(), 0);

	text1.p.text.set('test');
	container = await text1.compute();
	assert.notOk(text1.states.error.active(), 'no error');
	assert.equal(container.pointsCount(), 4200, 'points count is 4200');
});
