import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {DebounceEventNode} from '../../../../src/engine/nodes/event/Debounce';
import {EventContext} from '../../../../src/core/event/EventContextType';
export function testenginenodeseventDebounce(qUnit: QUnit) {
	qUnit.test('event/debounce nodes simple', async (assert) => {
		const geo1 = window.geo1;
		const eventsNetwork1 = geo1.createNode('eventsNetwork');
		const debounce1 = eventsNetwork1.createNode('debounce');

		const eventContext: EventContext<Event> = {};

		let count = 0;
		debounce1.onDispatch(DebounceEventNode.OUTPUT_NAME, () => {
			count += 1;
		});

		for (let i = 0; i < 20; i++) {
			debounce1.processEvent(eventContext);
			await CoreSleep.sleep(50);
		}
		assert.equal(count, 0);
		await CoreSleep.sleep(50);
		assert.equal(count, 1);

		// we reset the time, to make sure the internal debouncedFunc is reset
		debounce1.p.maxwait.set(5);
		count = 0;
		for (let i = 0; i < 20; i++) {
			debounce1.processEvent(eventContext);
			await CoreSleep.sleep(10);
		}
		assert.equal(count, 20);
	});
}
