import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodessopSwitch(qUnit: QUnit) {
	qUnit.test('SOP switch simple', async (assert) => {
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		const sphere1 = geo1.createNode('sphere');
		const switch1 = geo1.createNode('switch');
		switch1.setInput(0, box1);
		switch1.setInput(1, sphere1);

		switch1.p.input.set(0);

		async function pointsCount() {
			const container = await switch1.compute();
			return container.coreContent()!.pointsCount();
		}

		assert.equal(await pointsCount(), 24);

		switch1.p.input.set(1);
		assert.equal(await pointsCount(), 961);
	});

	qUnit.test(
		'SOP switch re evaluates input when one goes from errored to valid (error in numeric param)',
		async (assert) => {
			const geo1 = window.geo1;

			await window.scene.waitForCooksCompleted();

			const box1 = geo1.createNode('box');
			const sphere1 = geo1.createNode('sphere');
			const switch1 = geo1.createNode('switch');
			switch1.setInput(0, sphere1);
			switch1.setInput(1, box1);
			switch1.p.input.set(0);
			switch1.flags.display.set(true);

			async function pointsCount() {
				const container = await switch1.compute();
				return container.coreContent()?.pointsCount() || 0;
			}
			assert.equal(await pointsCount(), 961);

			box1.p.center.y.set('a1');
			assert.equal(await pointsCount(), 961);
			assert.notOk(switch1.states.error.active());
			assert.notOk(switch1.states.error.message());

			switch1.p.input.set(1);
			assert.equal(await pointsCount(), 0);
			assert.ok(switch1.states.error.active());
			assert.equal(
				switch1.states.error.message(),
				'input 1 is invalid (error: param \'centery\' error: expression error: "a1" (a1 is not defined))'
			);

			box1.p.center.y.set(0);
			assert.equal(await pointsCount(), 24);
			assert.notOk(switch1.states.error.active());
			assert.notOk(switch1.states.error.message());
		}
	);

	qUnit.test(
		'SOP switch re evaluates input when one goes from errored to valid (error in string param)',
		async (assert) => {
			const geo1 = window.geo1;

			await window.scene.waitForCooksCompleted();

			const text1 = geo1.createNode('text');
			const sphere1 = geo1.createNode('sphere');
			const switch1 = geo1.createNode('switch');
			switch1.setInput(0, sphere1);
			switch1.setInput(1, text1);
			switch1.p.input.set(0);
			switch1.flags.display.set(true);

			async function pointsCount() {
				const container = await switch1.compute();
				return container.coreContent()?.pointsCount() || 0;
			}
			assert.equal(await pointsCount(), 961);

			text1.p.text.set(`\`''*2\``);
			assert.equal(await pointsCount(), 961);
			assert.notOk(switch1.states.error.active());
			assert.notOk(switch1.states.error.message());

			switch1.p.input.set(1);
			assert.equal(await pointsCount(), 384);
			assert.notOk(switch1.states.error.active());
			assert.notOk(switch1.states.error.message());

			text1.p.text.set(`\`''*2a\``);
			assert.equal(await pointsCount(), 0);
			assert.ok(switch1.states.error.active());
			assert.equal(
				switch1.states.error.message(),
				"input 1 is invalid (error: param 'text' error: expression error: \"`''*2a`\" (cannot parse expression))"
			);

			text1.p.text.set(`\`''*2\``);
			assert.equal(await pointsCount(), 384);
			assert.notOk(switch1.states.error.active());
			assert.notOk(switch1.states.error.message());
		}
	);
}
