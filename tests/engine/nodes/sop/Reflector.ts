import {Material} from 'three';
import {Reflector} from 'three/examples/jsm/objects/Reflector';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {ReflectorSopNode} from '../../../../src/engine/nodes/sop/Reflector';
import {NullSopNode} from '../../../../src/engine/nodes/sop/Null';
import {CoreSleep} from '../../../../src/core/Sleep';

QUnit.test('reflectors can be cloned and keep unique material', async (assert) => {
	const geo1 = window.geo1;
	// cancels geo node displayNodeController
	// update: display flag needs to be set to true for onAddRemove hooks to be run
	// geo1.flags.display.set(false);

	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	assert.ok(renderer, 'renderer created');

	const plane1 = geo1.createNode('plane');
	const reflector1 = geo1.createNode('reflector');
	const null1 = geo1.createNode('null');

	reflector1.setInput(0, plane1);
	null1.setInput(0, reflector1);

	const _getReflector = async (node: ReflectorSopNode | NullSopNode) => {
		node.flags.display.set(true);
		await node.compute();
		await CoreSleep.sleep(100);
		return geo1.object.children[1].children[0] as Reflector;
	};

	const reflectorObject1 = await _getReflector(reflector1);

	const reflectorObject2 = await _getReflector(null1);

	assert.notEqual((reflectorObject1.material as Material).uuid, (reflectorObject2.material as Material).uuid);
});

QUnit.test('reflectors can complete cook without a renderer', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const plane = geo1.createNode('plane');
	const reflector = geo1.createNode('reflector');
	const null1 = geo1.createNode('null');

	reflector.setInput(0, plane);
	null1.setInput(0, reflector);

	await reflector.compute();
	assert.equal(1, 1, 'reflector has cooked');
});
