import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {ThrottleEventNode} from '../../../../src/engine/nodes/event/Throttle';
import {EventContext} from '../../../../src/engine/scene/utils/events/_BaseEventsController';
export function testenginenodeseventThrottle(qUnit: QUnit) {

qUnit.test('event/throttle nodes simple', async (assert) => {
	const geo1 = window.geo1;
	const eventsNetwork1 = geo1.createNode('eventsNetwork');
	const throttle1 = eventsNetwork1.createNode('throttle');

	const eventContext: EventContext<Event> = {};

	let count = 0;
	throttle1.onDispatch(ThrottleEventNode.OUTPUT_NAME, () => {
		count += 1;
	});

	for (let i = 0; i < 20; i++) {
		throttle1.processEvent(eventContext);
		await CoreSleep.sleep(20);
	}
	assert.equal(count, 5);

	// we reset the time, to make sure the internal debouncedFunc is reset
	throttle1.p.time.set(5);
	count = 0;
	for (let i = 0; i < 20; i++) {
		throttle1.processEvent(eventContext);
		await CoreSleep.sleep(10);
	}
	assert.equal(count, 21);
});

}