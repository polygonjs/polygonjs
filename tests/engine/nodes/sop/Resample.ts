import {METHOD, METHODS, CURVE_TYPE, CURVE_TYPES} from 'src/engine/nodes/sop/Resample';
import {TEXT_TYPE, TEXT_TYPES} from 'src/engine/nodes/sop/Text';

QUnit.test('resample a line', async (assert) => {
	const geo1 = window.geo1;

	const line1 = geo1.create_node('line');
	let container;

	container = await line1.request_container();
	assert.equal(container.points_count(), 2);

	const resample1 = geo1.create_node('resample');
	resample1.set_input(0, line1);

	// try all curve types for method points_count
	resample1.p.method.set(METHODS.indexOf(METHOD.POINTS_COUNT));

	resample1.p.curve_type.set(CURVE_TYPES.indexOf(CURVE_TYPE.CENTRIPETAL));
	container = await resample1.request_container();
	assert.equal(container.points_count(), 101);

	resample1.p.curve_type.set(CURVE_TYPES.indexOf(CURVE_TYPE.CHORDAL));
	container = await resample1.request_container();
	assert.equal(container.points_count(), 101);

	resample1.p.curve_type.set(CURVE_TYPES.indexOf(CURVE_TYPE.CATMULLROM));
	container = await resample1.request_container();
	assert.equal(container.points_count(), 101);

	// try all curve types for method segment_length
	resample1.p.method.set(METHODS.indexOf(METHOD.SEGMENT_LENGTH));
	resample1.p.segment_length.set(0.05);

	resample1.p.curve_type.set(CURVE_TYPES.indexOf(CURVE_TYPE.CENTRIPETAL));
	container = await resample1.request_container();
	assert.equal(container.points_count(), 22);

	resample1.p.curve_type.set(CURVE_TYPES.indexOf(CURVE_TYPE.CHORDAL));
	container = await resample1.request_container();
	assert.equal(container.points_count(), 22);

	resample1.p.curve_type.set(CURVE_TYPES.indexOf(CURVE_TYPE.CATMULLROM));
	container = await resample1.request_container();
	assert.equal(container.points_count(), 22);
});

QUnit.test('resample a text', async (assert) => {
	const geo1 = window.geo1;

	const text1 = geo1.create_node('text');
	text1.p.text.set('flat');
	let container;

	text1.p.type.set(TEXT_TYPES.indexOf(TEXT_TYPE.LINE));
	container = await text1.request_container();
	assert.equal(container.points_count(), 738);

	const resample1 = geo1.create_node('resample');
	resample1.set_input(0, text1);

	// try all curve types for method points_count
	resample1.p.method.set(METHODS.indexOf(METHOD.POINTS_COUNT));

	resample1.p.curve_type.set(CURVE_TYPES.indexOf(CURVE_TYPE.CENTRIPETAL));
	container = await resample1.request_container();
	assert.equal(container.points_count(), 505);

	resample1.p.curve_type.set(CURVE_TYPES.indexOf(CURVE_TYPE.CHORDAL));
	container = await resample1.request_container();
	assert.equal(container.points_count(), 505);

	resample1.p.curve_type.set(CURVE_TYPES.indexOf(CURVE_TYPE.CATMULLROM));
	container = await resample1.request_container();
	assert.equal(container.points_count(), 505);

	// vary points count
	resample1.p.points_count.set(500);
	container = await resample1.request_container();
	assert.equal(container.points_count(), 2505);

	// try all curve types for method segment_length
	resample1.p.method.set(METHODS.indexOf(METHOD.SEGMENT_LENGTH));

	resample1.p.curve_type.set(CURVE_TYPES.indexOf(CURVE_TYPE.CENTRIPETAL));
	container = await resample1.request_container();
	assert.equal(container.points_count(), 21);

	resample1.p.curve_type.set(CURVE_TYPES.indexOf(CURVE_TYPE.CHORDAL));
	container = await resample1.request_container();
	assert.equal(container.points_count(), 21);

	resample1.p.curve_type.set(CURVE_TYPES.indexOf(CURVE_TYPE.CATMULLROM));
	container = await resample1.request_container();
	assert.equal(container.points_count(), 21);

	// vary segment length
	resample1.p.segment_length.set(0.01);
	container = await resample1.request_container();
	assert.equal(container.points_count(), 1235);

	resample1.p.segment_length.set(0.04);
	container = await resample1.request_container();
	assert.equal(container.points_count(), 314);

	// also vary tension
	resample1.p.tension.set(0);
	container = await resample1.request_container();
	assert.equal(container.points_count(), 329);

	resample1.p.tension.set(0.01);
	container = await resample1.request_container();
	assert.equal(container.points_count(), 314);

	resample1.p.tension.set(0.5);
	container = await resample1.request_container();
	assert.equal(container.points_count(), 329);

	resample1.p.tension.set(1);
	container = await resample1.request_container();
	assert.equal(container.points_count(), 354);
});
