import {Layers} from 'three/src/core/Layers';

QUnit.test('layer simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const layer1 = geo1.createNode('layer');

	layer1.setInput(0, plane1);

	let container, layers;
	const layers0 = new Layers();
	const layers1 = new Layers();
	const layers2 = new Layers();
	layers0.set(0);
	layers1.set(1);
	layers2.set(2);

	container = await layer1.compute();
	layers = container.coreContent()!.objects()[0].layers;
	assert.ok(layers.test(layers0));
	assert.notOk(layers.test(layers1));
	assert.notOk(layers.test(layers2));

	layer1.p.layer.set(1);
	container = await layer1.compute();
	layers = container.coreContent()!.objects()[0].layers;
	assert.notOk(layers.test(layers0));
	assert.ok(layers.test(layers1));
	assert.notOk(layers.test(layers2));

	layer1.p.layer.set(2);
	container = await layer1.compute();
	layers = container.coreContent()!.objects()[0].layers;
	assert.notOk(layers.test(layers0));
	assert.notOk(layers.test(layers1));
	assert.ok(layers.test(layers2));
});
