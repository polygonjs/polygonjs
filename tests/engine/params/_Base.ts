import {ParamEvent} from '../../../src/engine/poly/ParamEvent';
import {CoreGraphNode} from '../../../src/core/graph/CoreGraphNode';
import {NodeEvent} from '../../../src/engine/poly/NodeEvent';
import {PolyScene} from '../../../src/engine/scene/PolyScene';
import {SceneEvent} from '../../../src/engine/poly/SceneEvent';

QUnit.test('sets the node to update if set value', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('box');
	const param = box1.p.size;
	assert.ok(box1.isDirty());

	await box1.compute();
	assert.ok(!box1.isDirty());
	assert.ok(!box1.states.error.active());

	param.set(2);
	assert.equal(param.value, 2);
	assert.notOk(!box1.isDirty());
	assert.ok(box1.isDirty());

	await box1.compute();
	assert.ok(!box1.isDirty());
	assert.ok(!box1.states.error.active());

	param.set(2); // set to same value
	assert.ok(!box1.isDirty());
});

QUnit.test('sets the node to recook if set expression', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box1 = geo1.createNode('box');
	const param = box1.p.size;
	assert.ok(box1.isDirty());

	await box1.compute();
	assert.ok(!box1.isDirty());
	assert.ok(!box1.states.error.active());

	param.set('1+1');
	assert.ok(box1.isDirty());
	await param.compute();
	assert.equal(param.value, 2);
	assert.ok(box1.isDirty());

	await box1.compute();
	assert.ok(!box1.isDirty());
	assert.ok(!box1.states.error.active());

	param.set('1+1'); // set to same expression
	assert.ok(param.hasExpression());
	assert.ok(!box1.isDirty());

	param.set(3); // set to value with different
	assert.ok(!param.hasExpression());
	assert.ok(box1.isDirty());

	param.set('1+1'); // reset expression
	assert.ok(param.hasExpression());
	assert.ok(box1.isDirty());
	await box1.compute();
	assert.ok(!param.isDirty());
	assert.ok(!box1.isDirty());
	assert.equal(param.value, 2);

	param.set(2); // set to value with same result
	assert.ok(!param.hasExpression(), 'param has no expression');
	assert.ok(!param.isDirty());
	assert.ok(!box1.isDirty());
});

class EventsListener {
	process_events(emitter: PolyScene | CoreGraphNode, event_name: SceneEvent | NodeEvent | ParamEvent, data?: any) {}
}

QUnit.test('emit only the minimum times', (assert) => {
	const geo1 = window.geo1;

	window.scene.dispatchController.setListener(new EventsListener());

	const t = geo1.p.t;
	const tx = t.x;
	const ty = t.y;

	t.emitController.unblockEmit();
	tx.emitController.unblockEmit();

	assert.equal(t.emitController.eventsCount(ParamEvent.VALUE_UPDATED), 0);
	assert.equal(tx.emitController.eventsCount(ParamEvent.VALUE_UPDATED), 0);

	tx.set(1);
	assert.equal(tx.emitController.eventsCount(ParamEvent.VALUE_UPDATED), 1);
	assert.equal(ty.emitController.eventsCount(ParamEvent.VALUE_UPDATED), 0);
	assert.equal(t.emitController.eventsCount(ParamEvent.VALUE_UPDATED), 1);

	t.set([2, 3, 7]);
	assert.equal(tx.emitController.eventsCount(ParamEvent.VALUE_UPDATED), 2);
	assert.equal(ty.emitController.eventsCount(ParamEvent.VALUE_UPDATED), 1);
	assert.equal(t.emitController.eventsCount(ParamEvent.VALUE_UPDATED), 2);

	ty.set(2.5);
	assert.equal(tx.emitController.eventsCount(ParamEvent.VALUE_UPDATED), 2);
	assert.equal(ty.emitController.eventsCount(ParamEvent.VALUE_UPDATED), 2);
	assert.equal(t.emitController.eventsCount(ParamEvent.VALUE_UPDATED), 3);
});
