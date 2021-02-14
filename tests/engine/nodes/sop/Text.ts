import {TEXT_TYPE, TEXT_TYPES} from '../../../../src/engine/nodes/sop/Text';

QUnit.test('text simple', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.createNode('text');

	let container = await text1.requestContainer();
	let core_group = container.coreContent();
	let geometry = core_group?.objectsWithGeo()[0]?.geometry;

	assert.ok(geometry);
	assert.equal(container.pointsCount(), 3324);

	text1.p.text.set('this is a test');
	container = await text1.requestContainer();
	core_group = container.coreContent();
	geometry = core_group?.objectsWithGeo()[0]?.geometry;

	assert.ok(geometry);
	assert.equal(container.pointsCount(), 3792);
});

QUnit.test('text with json font', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.createNode('text');
	text1.p.font.set('/fonts/droid_sans_regular.typeface.json');

	let container = await text1.requestContainer();
	assert.equal(container.pointsCount(), 3324);
});

QUnit.test('text with ttf font', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.createNode('text');
	text1.p.font.set('/fonts/SourceCodePro-Regular.ttf');

	let container = await text1.requestContainer();
	assert.equal(container.pointsCount(), 3204);
});

QUnit.test('text with a non existing font', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.createNode('text');
	text1.p.font.set('/fonts/doesnotexist.ttf');

	let container = await text1.requestContainer();
	assert.ok(container, 'container exists');
	assert.equal(text1.states.error.message(), 'count not load font (/fonts/doesnotexist.ttf)');
	assert.equal(container.pointsCount(), 0);
});

QUnit.test('text with multiline', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.createNode('text');
	text1.p.text.set('line1line2');

	let container = await text1.requestContainer();
	assert.more_than_or_equal(container.size().y, 1);
	assert.less_than_or_equal(container.size().y, 1.2);

	text1.p.text.set('line1\nline2');

	container = await text1.requestContainer();
	assert.more_than_or_equal(container.size().y, 2.5);
	assert.less_than_or_equal(container.size().y, 3.5);
});

QUnit.test('text as different types', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const text1 = geo1.createNode('text');
	text1.p.text.set('some text to test');
	await scene.root().processQueue();
	let container;

	text1.p.type.set(TEXT_TYPES.indexOf(TEXT_TYPE.MESH));
	assert.ok(text1.isDirty());
	container = await text1.requestContainer();
	assert.notOk(text1.isDirty());
	assert.equal(container.pointsCount(), 4776);

	text1.p.type.set(TEXT_TYPES.indexOf(TEXT_TYPE.FLAT));
	assert.ok(text1.isDirty());
	container = await text1.requestContainer();
	assert.notOk(text1.isDirty());
	assert.equal(container.pointsCount(), 3773);

	text1.p.type.set(TEXT_TYPES.indexOf(TEXT_TYPE.LINE));
	assert.ok(text1.isDirty());
	container = await text1.requestContainer();
	assert.notOk(text1.isDirty());
	assert.equal(container.pointsCount(), 3792);

	text1.p.type.set(TEXT_TYPES.indexOf(TEXT_TYPE.STROKE));
	assert.ok(text1.isDirty());
	container = await text1.requestContainer();
	assert.notOk(text1.isDirty());
	assert.equal(container.pointsCount(), 22746);
});

QUnit.test('text can recover from generation errors', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const text1 = geo1.createNode('text');
	await scene.root().processQueue();
	let container;

	text1.p.font.set('/fonts/Absolute.ttf');

	text1.p.text.set('test');
	container = await text1.requestContainer();
	assert.notOk(text1.states.error.active());
	assert.equal(container.pointsCount(), 4200);

	text1.p.text.set('test!!');
	container = await text1.requestContainer();
	assert.ok(text1.states.error.active());
	assert.equal(text1.states.error.message(), 'failed to generate geometry. Try to remove some characters');
	assert.equal(container.pointsCount(), 0);

	text1.p.text.set('test');
	container = await text1.requestContainer();
	assert.notOk(text1.states.error.active());
	assert.equal(container.pointsCount(), 4200);
});
