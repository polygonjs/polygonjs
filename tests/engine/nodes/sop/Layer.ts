import {LayerUpdateMode} from '../../../../src/engine/nodes/sop/Layer';
import type {QUnit} from '../../../helpers/QUnit';
import {Layers} from 'three';
export function testenginenodessopLayer(qUnit: QUnit) {
	qUnit.test('sop/layer simple', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const layer1 = geo1.createNode('layer');

		layer1.setInput(0, plane1);

		const layers0 = new Layers();
		const layers1 = new Layers();
		const layers2 = new Layers();
		const layers3 = new Layers();
		layers0.set(0);
		layers1.set(1);
		layers2.set(2);
		layers3.set(3);
		async function getLayers() {
			const container = await layer1.compute();
			const layers = container.coreContent()!.threejsObjects()[0].layers;
			return layers;
		}

		assert.ok((await getLayers()).test(layers0));
		assert.notOk((await getLayers()).test(layers1));
		assert.notOk((await getLayers()).test(layers2));

		layer1.setMode(0, LayerUpdateMode.SET);
		layer1.setLayer(0, 1);
		assert.notOk((await getLayers()).test(layers0));
		assert.ok((await getLayers()).test(layers1));
		assert.notOk((await getLayers()).test(layers2));

		layer1.setLayer(0, 2);
		assert.notOk((await getLayers()).test(layers0));
		assert.notOk((await getLayers()).test(layers1));
		assert.ok((await getLayers()).test(layers2));

		layer1.p.layersCount.set(1);
		layer1.setMode(0, LayerUpdateMode.SET);
		layer1.setLayer(0, 1);
		layer1.setMode(1, LayerUpdateMode.ADD);
		layer1.setLayer(1, 0);
		assert.notOk((await getLayers()).test(layers0));
		assert.ok((await getLayers()).test(layers1));
		assert.notOk((await getLayers()).test(layers2));

		layer1.p.layersCount.set(2);
		assert.ok((await getLayers()).test(layers0));
		assert.ok((await getLayers()).test(layers1));
		assert.notOk((await getLayers()).test(layers2));

		layer1.p.layersCount.set(3);
		layer1.setMode(2, LayerUpdateMode.ADD);
		layer1.setLayer(2, 2);
		assert.ok((await getLayers()).test(layers0));
		assert.ok((await getLayers()).test(layers1));
		assert.ok((await getLayers()).test(layers2));
		assert.notOk((await getLayers()).test(layers3));

		layer1.p.layersCount.set(4);
		layer1.setMode(3, LayerUpdateMode.ADD);
		layer1.setLayer(3, 3);
		assert.ok((await getLayers()).test(layers0));
		assert.ok((await getLayers()).test(layers1));
		assert.ok((await getLayers()).test(layers2));
		assert.ok((await getLayers()).test(layers3));
	});
}
