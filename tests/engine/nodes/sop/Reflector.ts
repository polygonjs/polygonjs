import {Material} from 'three/src/materials/Material';
import {Reflector} from '../../../../src/modules/three/examples/jsm/objects/Reflector';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('reflectors can be cloned and keep unique material', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer, 'renderer created');

	const plane = geo1.createNode('plane');
	const reflector = geo1.createNode('reflector');
	const null1 = geo1.createNode('null');

	reflector.setInput(0, plane);
	null1.setInput(0, reflector);

	let container = await reflector.compute();
	let reflectorObject1 = container.coreContent()!.objectsWithGeo()[0] as Reflector;

	container = await null1.compute();
	let reflectorObject2 = container.coreContent()!.objectsWithGeo()[0] as Reflector;

	assert.notEqual((reflectorObject1.material as Material).uuid, (reflectorObject2.material as Material).uuid);
});
