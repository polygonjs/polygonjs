import {ParamEvent} from 'src/engine/poly/ParamEvent';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';

QUnit.test('sets the node to recook if set value', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.create_node('box');
	assert.ok(box1.is_dirty);

	await box1.request_container();
	assert.ok(!box1.is_dirty);
	assert.ok(!box1.states.error.active);

	box1.p.size.set(2);
	assert.ok(box1.is_dirty);

	let val;
	val = await box1.p.size.compute();
	assert.equal(val, 2);
	assert.ok(box1.is_dirty);

	await box1.request_container();
	assert.ok(!box1.is_dirty);
	assert.ok(!box1.states.error.active);

	box1.p.size.set(2); // set to same value
	assert.ok(!box1.is_dirty);
});

QUnit.test('sets the node to recook if set expression', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	assert.ok(box1.is_dirty);

	let val;
	await box1.request_container();
	assert.ok(!box1.is_dirty);
	assert.ok(!box1.states.error.active);

	box1.p.size.set_expression('1+1');
	assert.ok(box1.is_dirty);
	val = await box1.p.size.compute();
	assert.equal(val, 2);
	assert.ok(box1.is_dirty);

	await box1.request_container();
	assert.ok(!box1.is_dirty);
	assert.ok(!box1.states.error.active);

	box1.p.size.set_expression('1+1'); // set to same expression
	assert.ok(!box1.is_dirty);

	box1.p.size.set(2); // set to value with same result
	assert.ok(box1.is_dirty);
});

class EventsListener {
	process_events(emitter: CoreGraphNode, event_name: string, data: object | null) {}
}

QUnit.test('emit only the minimum times', (assert) => {
	const geo1 = window.geo1;

	window.scene.events_controller.set_listener(new EventsListener());

	const t = geo1.p.t;
	const tx = t.x;
	const ty = t.y;

	t.emit_controller.unblock_emit();
	tx.emit_controller.unblock_emit();

	assert.equal(t.emit_controller.events_count(ParamEvent.UPDATED), 0);
	assert.equal(tx.emit_controller.events_count(ParamEvent.UPDATED), 0);

	tx.set(1);
	assert.equal(tx.emit_controller.events_count(ParamEvent.UPDATED), 1);
	assert.equal(ty.emit_controller.events_count(ParamEvent.UPDATED), 0);
	assert.equal(t.emit_controller.events_count(ParamEvent.UPDATED), 0);

	t.set([2, 3, 7]);
	assert.equal(tx.emit_controller.events_count(ParamEvent.UPDATED), 2);
	assert.equal(ty.emit_controller.events_count(ParamEvent.UPDATED), 1);
	assert.equal(t.emit_controller.events_count(ParamEvent.UPDATED), 1);

	ty.set(2.5);
	assert.equal(tx.emit_controller.events_count(ParamEvent.UPDATED), 2);
	assert.equal(ty.emit_controller.events_count(ParamEvent.UPDATED), 2);
	assert.equal(t.emit_controller.events_count(ParamEvent.UPDATED), 2);
});
