import {CoreMath} from '../../../../src/core/math/_Module';
import {CoreType} from '../../../../src/core/Type';
import {GeoObjNode} from '../../../../src/engine/nodes/obj/Geo';

async function createSopNodes(parentNode: GeoObjNode, expression: string) {
	function create_line1(parentNode: GeoObjNode) {
		var line1 = parentNode.createNode('line');
		line1.setName('line1');
		line1.uiData.setPosition(-150, -200);
		line1.p.pointsCount.set(101);
		line1.p.direction.y.set(0);
		line1.p.direction.z.set(1);
		line1.p.direction.y.set(0);
		line1.p.direction.z.set(1);
		line1.params.postCreateSpareParams();
		line1.params.runOnSceneLoadHooks();
		return line1;
	}
	function create_attribCreate1(parentNode: GeoObjNode) {
		var attribCreate1 = parentNode.createNode('attribCreate');
		attribCreate1.setName('attribCreate1');
		attribCreate1.uiData.setPosition(-150, -100);
		attribCreate1.p.name.set('pti');
		attribCreate1.p.value1.set('@ptnum / ( pointsCount(0)-1 )');
		attribCreate1.params.postCreateSpareParams();
		attribCreate1.params.runOnSceneLoadHooks();
		return attribCreate1;
	}
	function create_attribCreate2(parentNode: GeoObjNode) {
		var attribCreate2 = parentNode.createNode('attribCreate');
		attribCreate2.setName('attribCreate2');
		attribCreate2.uiData.setPosition(-150, 50);
		attribCreate2.p.name.set('h');
		attribCreate2.p.value1.set(expression);
		attribCreate2.params.postCreateSpareParams();
		attribCreate2.params.runOnSceneLoadHooks();
		return attribCreate2;
	}
	function create_point1(parentNode: GeoObjNode) {
		var point1 = parentNode.createNode('point');
		point1.setName('point1');
		point1.uiData.setPosition(-300, 300);
		point1.p.updateY.set(true);
		point1.p.y.set('@P.y+@h');
		point1.params.postCreateSpareParams();
		point1.params.runOnSceneLoadHooks();
		return point1;
	}
	var line1 = create_line1(parentNode);
	var attribCreate1 = create_attribCreate1(parentNode);
	var attribCreate2 = create_attribCreate2(parentNode);
	var point1 = create_point1(parentNode);
	attribCreate1.setInput(0, line1);
	attribCreate2.setInput(0, attribCreate1);
	point1.setInput(0, attribCreate2);

	const container = await point1.compute();
	// return [];
	const ys = container
		.coreContent()!
		.points()
		.map((p) => p.position().y);

	ensureAllValuesValid(ys);
	return ys;
}
function createScene(expression: string) {
	const geo1 = window.geo1;
	const box = geo1.createNode('box');
	box.flags.display.set(true);
	return createSopNodes(geo1, expression);
}

function valueAtPos(ys: number[], pos: number) {
	let index = CoreMath.clamp(ys.length * pos, 0, ys.length - 1);
	index = Math.floor(index);
	return ys[index];
}
function valuesAtKeyPos(ys: number[]) {
	return [0, 0.25, 0.5, 0.75, 1].map((p) => valueAtPos(ys, p));
}
function ensureAllValuesValid(ys: number[]) {
	for (let y of ys) {
		if (CoreType.isNaN(y)) {
			throw 'is NaN';
		}
	}
}

// QUnit.test('expression ease_i', async (assert) => {
// 	const ys1 = await createScene('ease_i(@pti, 2)');
// 	assert.deepEqual(valuesAtKeyPos(ys1), [0, 0.0625, 0.25, 0.5625, 1]);

// 	const ys2 = await createScene('ease_i(@pti, 1.5)');
// 	assert.deepEqual(valuesAtKeyPos(ys2), [0, 0.125, 0.3535533845424652, 0.6495190262794495, 1]);

// 	const ys3 = await createScene('ease_i(@pti, 0.5)');
// 	assert.deepEqual(valuesAtKeyPos(ys3), [0, 0.5, 0.7071067690849304, 0.8660253882408142, 1]);

// 	const ys4 = await createScene('ease_i(@pti, 0.83)');
// 	assert.deepEqual(valuesAtKeyPos(ys4), [0, 0.316439151763916, 0.5625292658805847, 0.7875911593437195, 1]);
// });

// QUnit.test('expression ease_o', async (assert) => {
// 	const ys1 = await createScene('ease_o(@pti, 2)');
// 	assert.deepEqual(valuesAtKeyPos(ys1), [0, 0.4375, 0.75, 0.9375, 1]);

// 	const ys2 = await createScene('ease_o(@pti, 2.5)');
// 	assert.deepEqual(valuesAtKeyPos(ys2), [0, 0.0625, 0.25, 0.5625, 1]);

// 	const ys3 = await createScene('ease_o(@pti, 3.5)');
// 	assert.deepEqual(valuesAtKeyPos(ys3), [0, 0.0625, 0.25, 0.5625, 1]);

// 	const ys4 = await createScene('ease_o(@pti, 4.83)');
// 	assert.deepEqual(valuesAtKeyPos(ys4), [0, 0.0625, 0.25, 0.5625, 1]);
// });

// QUnit.test('expression ease_io', async (assert) => {
// 	const ys1 = await createScene('ease_io(@pti, 2)');
// 	assert.deepEqual(valuesAtKeyPos(ys1), [0, 0.0625, 0.25, 0.5625, 1]);

// 	const ys2 = await createScene('ease_io(@pti, 1.5)');
// 	assert.deepEqual(valuesAtKeyPos(ys2), [0, 0.0625, 0.25, 0.5625, 1]);

// 	const ys3 = await createScene('ease_io(@pti, 0.5)');
// 	assert.deepEqual(valuesAtKeyPos(ys3), [0, 0.0625, 0.25, 0.5625, 1]);

// 	const ys4 = await createScene('ease_io(@pti, 0.83)');
// 	assert.deepEqual(valuesAtKeyPos(ys4), [0, 0.0625, 0.25, 0.5625, 1]);
// });

QUnit.test('expression ease_i2', async (assert) => {
	const ys = await createScene('ease_i2(@pti)');

	assert.deepEqual(valuesAtKeyPos(ys), [0, 0.0625, 0.25, 0.5625, 1]);
});

QUnit.test('expression ease_o2', async (assert) => {
	const ys = await createScene('ease_o2(@pti)');
	assert.deepEqual(valuesAtKeyPos(ys), [0, 0.4375, 0.75, 0.9375, 1]);
});

QUnit.test('expression ease_io2', async (assert) => {
	const ys = await createScene('ease_io2(@pti)');
	assert.deepEqual(valuesAtKeyPos(ys), [0, 0.125, 0.5, 0.875, 1]);
});

QUnit.test('expression ease_i3', async (assert) => {
	const ys = await createScene('ease_i3(@pti)');
	assert.deepEqual(valuesAtKeyPos(ys), [0, 0.015625, 0.125, 0.421875, 1]);
});

QUnit.test('expression ease_o3', async (assert) => {
	const ys = await createScene('ease_o3(@pti)');

	assert.deepEqual(valuesAtKeyPos(ys), [0, 0.578125, 0.875, 0.984375, 1]);
});

QUnit.test('expression ease_io3', async (assert) => {
	const ys = await createScene('ease_io3(@pti)');
	assert.deepEqual(valuesAtKeyPos(ys), [0, 0.0625, 0.5, 0.9375, 1]);
});

QUnit.test('expression ease_i4', async (assert) => {
	const ys = await createScene('ease_i4(@pti)');
	assert.deepEqual(valuesAtKeyPos(ys), [0, 0.00390625, 0.0625, 0.31640625, 1]);
});

QUnit.test('expression ease_o4', async (assert) => {
	const ys = await createScene('ease_o4(@pti)');
	assert.deepEqual(valuesAtKeyPos(ys), [0, 0.68359375, 0.9375, 0.99609375, 1]);
});

QUnit.test('expression ease_io4', async (assert) => {
	const ys = await createScene('ease_io4(@pti)');
	assert.deepEqual(valuesAtKeyPos(ys), [0, 0.03125, 0.5, 0.96875, 1]);
});

QUnit.test('expression ease_i_sin', async (assert) => {
	const ys = await createScene('ease_i_sin(@pti)');
	assert.deepEqual(valuesAtKeyPos(ys), [0, 0.07612046599388123, 0.2928932309150696, 0.6173165440559387, 1]);
});

QUnit.test('expression ease_o_sin', async (assert) => {
	const ys = await createScene('ease_o_sin(@pti)');
	assert.deepEqual(valuesAtKeyPos(ys), [0, 0.3826834261417389, 0.7071067690849304, 0.9238795042037964, 1]);
});

QUnit.test('expression ease_io_sin', async (assert) => {
	const ys = await createScene('ease_io_sin(@pti)');
	assert.deepEqual(valuesAtKeyPos(ys), [0, 0.1464466154575348, 0.5, 0.8535534143447876, 1]);
});

QUnit.test('expression ease_i_elastic', async (assert) => {
	const ys = await createScene('ease_i_elastic(@pti)');
	assert.deepEqual(valuesAtKeyPos(ys), [0, 1.0039814710617065, 1.002652883529663, 1.001325249671936, 1]);
});

QUnit.test('expression ease_o_elastic', async (assert) => {
	const ys = await createScene('ease_o_elastic(@pti)');
	assert.deepEqual(valuesAtKeyPos(ys), [0, -0.0013252205681055784, -0.0026528758462518454, -0.003981505986303091, 1]);
});

QUnit.test('expression ease_io_elastic', async (assert) => {
	const ys = await createScene('ease_io_elastic(@pti)');
	assert.deepEqual(valuesAtKeyPos(ys), [0, -0.0013264379231259227, 0, 1.0013264417648315, 1]);
});
