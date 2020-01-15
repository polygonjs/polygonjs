import {TEXT_TYPE, TEXT_TYPES} from 'src/engine/nodes/sop/Text';

QUnit.test('text simple', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.create_node('text');

	let container = await text1.request_container();
	let core_group = container.core_content();
	let geometry = core_group?.objects()[0]?.geometry;

	assert.ok(geometry);
	assert.equal(container.points_count(), 3324);

	text1.p.text.set('this is a test');
	container = await text1.request_container();
	core_group = container.core_content();
	geometry = core_group?.objects()[0]?.geometry;

	assert.ok(geometry);
	assert.equal(container.points_count(), 3792);
});

QUnit.test('text with json font', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.create_node('text');
	text1.p.font.set('/fonts/droid_sans_regular.typeface.json');

	let container = await text1.request_container();
	assert.equal(container.points_count(), 3324);
});

QUnit.test('text with ttf font', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.create_node('text');
	text1.p.font.set('/fonts/SourceCodePro-Regular.ttf');

	let container = await text1.request_container();
	assert.equal(container.points_count(), 3204);
});

QUnit.test('text with a non existing font', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.create_node('text');
	text1.p.font.set('/fonts/doesnotexist.ttf');

	let container = await text1.request_container();
	assert.ok(container, 'container exists');
	assert.equal(text1.states.error.message, 'count not load font (/fonts/doesnotexist.ttf)');
	assert.equal(container.points_count(), 0);
});

QUnit.test('text with multiline', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.create_node('text');
	text1.p.text.set('line1line2');

	let container = await text1.request_container();
	assert.more_than_or_equal(container.size().y, 1);
	assert.less_than_or_equal(container.size().y, 1.2);

	text1.p.text.set('line1\nline2');

	container = await text1.request_container();
	assert.more_than_or_equal(container.size().y, 2.5);
	assert.less_than_or_equal(container.size().y, 3.5);
});

QUnit.test('text as different types', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const text1 = geo1.create_node('text');
	text1.p.text.set('some text to test');
	await scene.root.process_queue();
	let container;

	text1.p.type.set(TEXT_TYPES.indexOf(TEXT_TYPE.MESH));
	assert.ok(text1.is_dirty);
	container = await text1.request_container();
	assert.notOk(text1.is_dirty);
	assert.equal(container.points_count(), 4776);

	text1.p.type.set(TEXT_TYPES.indexOf(TEXT_TYPE.FLAT));
	assert.ok(text1.is_dirty);
	container = await text1.request_container();
	assert.notOk(text1.is_dirty);
	assert.equal(container.points_count(), 3773);

	text1.p.type.set(TEXT_TYPES.indexOf(TEXT_TYPE.LINE));
	assert.ok(text1.is_dirty);
	container = await text1.request_container();
	assert.notOk(text1.is_dirty);
	assert.equal(container.points_count(), 3792);

	text1.p.type.set(TEXT_TYPES.indexOf(TEXT_TYPE.STROKE));
	assert.ok(text1.is_dirty);
	await window.sleep(1000); // this should not be needed, but was on last test
	container = await text1.request_container();
	assert.notOk(text1.is_dirty);
	assert.equal(container.points_count(), 22746);
});

QUnit.test('text can recover from generation errors', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const text1 = geo1.create_node('text');
	await scene.root.process_queue();
	let container;

	text1.p.font.set('/fonts/Absolute.ttf');

	text1.p.text.set('test');
	container = await text1.request_container();
	assert.notOk(text1.states.error.active);
	assert.equal(container.points_count(), 4200);

	text1.p.text.set('test!!');
	container = await text1.request_container();
	assert.ok(text1.states.error.active);
	assert.equal(text1.states.error.message, 'failed to generate geometry. Try to remove some characters');
	assert.equal(container.points_count(), 0);

	text1.p.text.set('test');
	container = await text1.request_container();
	assert.notOk(text1.states.error.active);
	assert.equal(container.points_count(), 4200);
});
