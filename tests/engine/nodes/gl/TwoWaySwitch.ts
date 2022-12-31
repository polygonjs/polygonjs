import {SubnetGlNode} from '../../../../src/engine/nodes/gl/Subnet';
import {MeshBasicBuilderMatNode} from '../../../../src/engine/nodes/mat/MeshBasicBuilder';
import {MaterialsNetworkObjNode} from '../../../../src/engine/nodes/obj/MaterialsNetwork';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {RendererUtils} from '../../../helpers/RendererUtils';

import TEMPLATE from './TwoWaySwitch/default.frag.glsl';

function create_meshBasicBuilder1(parentNode: MaterialsNetworkObjNode) {
	var meshBasicBuilder1 = parentNode.createNode('meshBasicBuilder');
	meshBasicBuilder1.setName('meshBasicBuilder1');
	function create_globals1(meshBasicBuilder1: MeshBasicBuilderMatNode) {
		var globals1 = meshBasicBuilder1.createNode('globals');
		globals1.setName('globals1');
		globals1.uiData.setPosition(-600, 0);
		globals1.params.postCreateSpareParams();
		globals1.params.runOnSceneLoadHooks();
		return globals1;
	}
	function create_output1(meshBasicBuilder1: MeshBasicBuilderMatNode) {
		var output1 = meshBasicBuilder1.createNode('output');
		output1.setName('output1');
		output1.uiData.setPosition(300, 0);
		output1.params.postCreateSpareParams();
		output1.params.runOnSceneLoadHooks();
		return output1;
	}
	function create_subnet1(meshBasicBuilder1: MeshBasicBuilderMatNode) {
		var subnet1 = meshBasicBuilder1.createNode('subnet');
		subnet1.setName('subnet1');
		subnet1.params.get('inputType0')!.set(4);
		subnet1.addParam(ParamType.VECTOR3, 'input0', [0, 0, 0], {spare: true, editable: false});
		subnet1.params.postCreateSpareParams();
		subnet1.params.runOnSceneLoadHooks();
		function create_compare1(subnet1: SubnetGlNode) {
			var compare1 = subnet1.createNode('compare');
			compare1.setName('compare1');
			compare1.uiData.setPosition(-50, -150);
			compare1.params.get('test')!.set(2);
			compare1.addParam(ParamType.FLOAT, 'value0', 0, {spare: true, editable: false});
			compare1.addParam(ParamType.FLOAT, 'value1', 0, {spare: true, editable: true});
			compare1.params.postCreateSpareParams();
			compare1.params.runOnSceneLoadHooks();
			return compare1;
		}
		function create_compare2(subnet1: SubnetGlNode) {
			var compare2 = subnet1.createNode('compare');
			compare2.setName('compare2');
			compare2.uiData.setPosition(-350, 50);
			compare2.params.get('test')!.set(2);
			compare2.addParam(ParamType.FLOAT, 'value0', 0, {spare: true, editable: false});
			compare2.addParam(ParamType.FLOAT, 'value1', 0, {spare: true, editable: true});
			compare2.params.get('value1')!.set(-0.5);
			compare2.params.postCreateSpareParams();
			compare2.params.runOnSceneLoadHooks();
			return compare2;
		}
		function create_constant1(subnet1: SubnetGlNode) {
			var constant1 = subnet1.createNode('constant');
			constant1.setName('constant1');
			constant1.uiData.setPosition(-350, -500);
			constant1.params.get('type')!.set(4);
			constant1.params.get('colorr')!.set(1);
			constant1.params.get('colorr')!.set(1);
			constant1.params.get('asColor')!.set(true);
			constant1.params.postCreateSpareParams();
			constant1.params.runOnSceneLoadHooks();
			return constant1;
		}
		function create_constant2(subnet1: SubnetGlNode) {
			var constant2 = subnet1.createNode('constant');
			constant2.setName('constant2');
			constant2.uiData.setPosition(-350, -350);
			constant2.params.get('type')!.set(4);
			constant2.params.get('colorg')!.set(1);
			constant2.params.get('colorb')!.set(0.06666666666666667);
			constant2.params.get('colorg')!.set(1);
			constant2.params.get('colorb')!.set(0.06666666666666667);
			constant2.params.get('asColor')!.set(true);
			constant2.params.postCreateSpareParams();
			constant2.params.runOnSceneLoadHooks();
			return constant2;
		}
		function create_constant3(subnet1: SubnetGlNode) {
			var constant3 = subnet1.createNode('constant');
			constant3.setName('constant3');
			constant3.uiData.setPosition(-350, -200);
			constant3.params.get('type')!.set(4);
			constant3.params.get('colorb')!.set(1);
			constant3.params.get('colorb')!.set(1);
			constant3.params.get('asColor')!.set(true);
			constant3.params.postCreateSpareParams();
			constant3.params.runOnSceneLoadHooks();
			return constant3;
		}
		function create_subnetInput1(subnet1: SubnetGlNode) {
			var subnetInput1 = subnet1.createNode('subnetInput');
			subnetInput1.setName('subnetInput1');
			subnetInput1.uiData.setPosition(-700, -100);
			subnetInput1.params.postCreateSpareParams();
			subnetInput1.params.runOnSceneLoadHooks();
			return subnetInput1;
		}
		function create_subnetOutput1(subnet1: SubnetGlNode) {
			var subnetOutput1 = subnet1.createNode('subnetOutput');
			subnetOutput1.setName('subnetOutput1');
			subnetOutput1.uiData.setPosition(300, -200);
			subnetOutput1.params.postCreateSpareParams();
			subnetOutput1.params.runOnSceneLoadHooks();
			return subnetOutput1;
		}
		function create_twoWaySwitch1(subnet1: SubnetGlNode) {
			var twoWaySwitch1 = subnet1.createNode('twoWaySwitch');
			twoWaySwitch1.setName('twoWaySwitch1');
			twoWaySwitch1.uiData.setPosition(-100, 100);
			twoWaySwitch1.addParam(ParamType.BOOLEAN, 'condition', false, {spare: true, editable: false});
			twoWaySwitch1.addParam(ParamType.VECTOR3, 'ifTrue', [0, 0, 0], {spare: true, editable: false});
			twoWaySwitch1.addParam(ParamType.VECTOR3, 'ifFalse', [0, 0, 0], {spare: true, editable: false});
			twoWaySwitch1.params.get('ifFalse')!.options.setOption('spare', true);
			twoWaySwitch1.params.get('ifFalse')!.options.setOption('editable', false);
			twoWaySwitch1.params.postCreateSpareParams();
			twoWaySwitch1.params.runOnSceneLoadHooks();
			return twoWaySwitch1;
		}
		function create_twoWaySwitch2(subnet1: SubnetGlNode) {
			var twoWaySwitch2 = subnet1.createNode('twoWaySwitch');
			twoWaySwitch2.setName('twoWaySwitch2');
			twoWaySwitch2.uiData.setPosition(100, -150);
			twoWaySwitch2.addParam(ParamType.BOOLEAN, 'condition', false, {spare: true, editable: false});
			twoWaySwitch2.addParam(ParamType.VECTOR3, 'ifTrue', [0, 0, 0], {spare: true, editable: false});
			twoWaySwitch2.addParam(ParamType.VECTOR3, 'ifFalse', [0, 0, 0], {spare: true, editable: false});
			twoWaySwitch2.params.postCreateSpareParams();
			twoWaySwitch2.params.runOnSceneLoadHooks();
			return twoWaySwitch2;
		}
		function create_vec3ToFloat1(subnet1: SubnetGlNode) {
			var vec3ToFloat1 = subnet1.createNode('vec3ToFloat');
			vec3ToFloat1.setName('vec3ToFloat1');
			vec3ToFloat1.uiData.setPosition(-450, -50);
			vec3ToFloat1.params.get('vec')!.options.setOption('editable', false);
			vec3ToFloat1.params.postCreateSpareParams();
			vec3ToFloat1.params.runOnSceneLoadHooks();
			return vec3ToFloat1;
		}
		var compare1 = create_compare1(subnet1);
		var compare2 = create_compare2(subnet1);
		var constant1 = create_constant1(subnet1);
		var constant2 = create_constant2(subnet1);
		var constant3 = create_constant3(subnet1);
		var subnetInput1 = create_subnetInput1(subnet1);
		var subnetOutput1 = create_subnetOutput1(subnet1);
		var twoWaySwitch1 = create_twoWaySwitch1(subnet1);
		var twoWaySwitch2 = create_twoWaySwitch2(subnet1);
		var vec3ToFloat1 = create_vec3ToFloat1(subnet1);
		compare1.setInput('value0', vec3ToFloat1, 'y');
		compare2.setInput('value0', vec3ToFloat1, 'y');
		subnetOutput1.setInput('input0', twoWaySwitch2, 'val');
		twoWaySwitch1.setInput('condition', compare2, 'val');
		twoWaySwitch1.setInput('ifTrue', constant2, 'val');
		twoWaySwitch1.setInput('ifFalse', constant3, 'val');
		twoWaySwitch2.setInput('condition', compare1, 'val');
		twoWaySwitch2.setInput('ifTrue', constant1, 'val');
		twoWaySwitch2.setInput('ifFalse', twoWaySwitch1, 'val');
		vec3ToFloat1.setInput('vec', subnetInput1, 'input0');
		subnet1.uiData.setPosition(-200, 0);
		subnet1.params.get('inputType0')!.set(4);
		subnet1.addParam(ParamType.VECTOR3, 'input0', [0, 0, 0], {spare: true, editable: false});
		subnet1.params.postCreateSpareParams();
		subnet1.params.runOnSceneLoadHooks();
		return subnet1;
	}
	var globals1 = create_globals1(meshBasicBuilder1);
	var output1 = create_output1(meshBasicBuilder1);
	var subnet1 = create_subnet1(meshBasicBuilder1);
	output1.setInput('color', subnet1, 'input0');
	subnet1.setInput('input0', globals1, 'position');
	meshBasicBuilder1.uiData.setPosition(0, 200);
	meshBasicBuilder1.params.postCreateSpareParams();
	meshBasicBuilder1.params.runOnSceneLoadHooks();
	return meshBasicBuilder1;
}

QUnit.test('2 twoWaySwitch gl node in a subnet function as expected', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer(scene);
	const MAT = window.MAT;
	const meshBasicBuilder1 = create_meshBasicBuilder1(MAT);
	const material = await meshBasicBuilder1.material();

	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.equal(material.fragmentShader, TEMPLATE, 'twoWaySwitch nodes do not conflict');
});
