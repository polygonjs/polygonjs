import {PointsBuilderMatNode} from '../../../../src/engine/nodes/mat/PointsBuilder';
import {MaterialsNetworkSopNode} from '../../../../src/engine/nodes/sop/MaterialsNetwork';
import {LineBasicBuilderMatNode} from '../../../../src/engine/nodes/mat/LineBasicBuilder';
import {ParamType} from '../../../../src/engine/poly/ParamType';

import MESH_BASIC_BUILDER_VERTEX from './VaryingWrite/meshBasicBuilder.vert.glsl';
import MESH_BASIC_BUILDER_FRAGMENT from './VaryingWrite/meshBasicBuilder.frag.glsl';
import MESH_LAMBERT_BUILDER_VERTEX from './VaryingWrite/meshLambertBuilder.vert.glsl';
import MESH_LAMBERT_BUILDER_FRAGMENT from './VaryingWrite/meshLambertBuilder.frag.glsl';
import MESH_PHONG_BUILDER_VERTEX from './VaryingWrite/meshPhongBuilder.vert.glsl';
import MESH_PHONG_BUILDER_FRAGMENT from './VaryingWrite/meshPhongBuilder.frag.glsl';
import MESH_STANDARD_BUILDER_VERTEX from './VaryingWrite/meshStandardBuilder.vert.glsl';
import MESH_STANDARD_BUILDER_FRAGMENT from './VaryingWrite/meshStandardBuilder.frag.glsl';
import MESH_PHYSICAL_BUILDER_VERTEX from './VaryingWrite/meshPhysicalBuilder.vert.glsl';
import MESH_PHYSICAL_BUILDER_FRAGMENT from './VaryingWrite/meshPhysicalBuilder.frag.glsl';
import LINE_BASIC_BUILDER_VERTEX from './VaryingWrite/lineBasicBuilder.vert.glsl';
import LINE_BASIC_BUILDER_FRAGMENT from './VaryingWrite/lineBasicBuilder.frag.glsl';
import POINTS_BUILDER_VERTEX from './VaryingWrite/pointsBuilder.vert.glsl';
import POINTS_BUILDER_FRAGMENT from './VaryingWrite/pointsBuilder.frag.glsl';
import {MeshPhysicalBuilderMatNode} from '../../../../src/engine/nodes/mat/MeshPhysicalBuilder';
import {MeshStandardBuilderMatNode} from '../../../../src/engine/nodes/mat/MeshStandardBuilder';
import {MeshPhongBuilderMatNode} from '../../../../src/engine/nodes/mat/MeshPhongBuilder';
import {MeshLambertBuilderMatNode} from '../../../../src/engine/nodes/mat/MeshLambertBuilder';
import {MeshBasicBuilderMatNode} from '../../../../src/engine/nodes/mat/MeshBasicBuilder';

function createMeshBasicBuilder(parentNode: MaterialsNetworkSopNode): MeshBasicBuilderMatNode {
	const meshBasicBuilder1 = parentNode.createNode('meshBasicBuilder');
	meshBasicBuilder1.setName('meshBasicBuilder1');
	function create_attribute1(meshBasicBuilder1: MeshBasicBuilderMatNode) {
		var attribute1 = meshBasicBuilder1.createNode('attribute');
		attribute1.setName('attribute1');
		attribute1.uiData.setPosition(-150, -250);
		attribute1.params.get('name')!.set('randomId');
		attribute1.params.postCreateSpareParams();
		attribute1.params.runOnSceneLoadHooks();
		return attribute1;
	}
	function create_floatToVec3_1(meshBasicBuilder1: MeshBasicBuilderMatNode) {
		var floatToVec3_1 = meshBasicBuilder1.createNode('floatToVec3');
		floatToVec3_1.setName('floatToVec3_1');
		floatToVec3_1.uiData.setPosition(0, -250);
		floatToVec3_1.params.get('y')!.set(0.75);
		floatToVec3_1.params.get('z')!.set(0.75);
		floatToVec3_1.params.postCreateSpareParams();
		floatToVec3_1.params.runOnSceneLoadHooks();
		return floatToVec3_1;
	}

	function create_hsvToRgb1(meshBasicBuilder1: MeshBasicBuilderMatNode) {
		var hsvToRgb1 = meshBasicBuilder1.createNode('hsvToRgb');
		hsvToRgb1.setName('hsvToRgb1');
		hsvToRgb1.uiData.setPosition(100, -250);
		hsvToRgb1.params.postCreateSpareParams();
		hsvToRgb1.params.runOnSceneLoadHooks();
		return hsvToRgb1;
	}
	function create_multAdd3(meshBasicBuilder1: MeshBasicBuilderMatNode) {
		var multAdd3 = meshBasicBuilder1.createNode('multAdd');
		multAdd3.setName('multAdd3');
		multAdd3.uiData.setPosition(50, 0);
		multAdd3.addParam(ParamType.VECTOR3, 'value', [0, 0, 0], {spare: true});
		multAdd3.addParam(ParamType.VECTOR3, 'preAdd', [0, 0, 0], {spare: true});
		multAdd3.addParam(ParamType.VECTOR3, 'mult', [1, 1, 1], {spare: true});
		multAdd3.addParam(ParamType.VECTOR3, 'postAdd', [0, 0, 0], {spare: true});
		multAdd3.params.postCreateSpareParams();
		multAdd3.params.runOnSceneLoadHooks();
		return multAdd3;
	}
	function create_output1(meshBasicBuilder1: MeshBasicBuilderMatNode) {
		var output1 = meshBasicBuilder1.createNode('output');
		output1.setName('output1');
		output1.uiData.setPosition(200, 0);
		output1.params.postCreateSpareParams();
		output1.params.runOnSceneLoadHooks();
		return output1;
	}
	function create_varyingRead1(meshBasicBuilder1: MeshBasicBuilderMatNode) {
		var varyingRead1 = meshBasicBuilder1.createNode('varyingRead');
		varyingRead1.setName('varyingRead1');
		varyingRead1.uiData.setPosition(-50, 0);
		varyingRead1.params.get('name')!.set('ptColor');
		varyingRead1.params.get('type')!.set(2);
		varyingRead1.params.postCreateSpareParams();
		varyingRead1.params.runOnSceneLoadHooks();
		return varyingRead1;
	}
	function create_varyingWrite1(meshBasicBuilder1: MeshBasicBuilderMatNode) {
		var varyingWrite1 = meshBasicBuilder1.createNode('varyingWrite');
		varyingWrite1.setName('varyingWrite1');
		varyingWrite1.uiData.setPosition(250, -250);
		varyingWrite1.params.get('name')!.set('ptColor');
		varyingWrite1.params.get('type')!.set(2);
		varyingWrite1.addParam(ParamType.VECTOR3, 'vertex', [0, 0, 0], {spare: true});
		varyingWrite1.params.postCreateSpareParams();
		varyingWrite1.params.runOnSceneLoadHooks();
		return varyingWrite1;
	}
	var attribute1 = create_attribute1(meshBasicBuilder1);
	var floatToVec3_1 = create_floatToVec3_1(meshBasicBuilder1);
	var hsvToRgb1 = create_hsvToRgb1(meshBasicBuilder1);
	var multAdd3 = create_multAdd3(meshBasicBuilder1);
	var output1 = create_output1(meshBasicBuilder1);
	var varyingRead1 = create_varyingRead1(meshBasicBuilder1);
	var varyingWrite1 = create_varyingWrite1(meshBasicBuilder1);
	floatToVec3_1.setInput('x', attribute1, 'val');
	hsvToRgb1.setInput('hsv', floatToVec3_1, 'vec3');
	multAdd3.setInput('value', varyingRead1, 'fragment');
	output1.setInput('color', multAdd3, 'val');
	varyingWrite1.setInput('vertex', hsvToRgb1, 'rgb');
	meshBasicBuilder1.uiData.setPosition(0, -100);
	meshBasicBuilder1.params.postCreateSpareParams();
	meshBasicBuilder1.params.runOnSceneLoadHooks();
	return meshBasicBuilder1;
}

function createMeshLambertBuilder(parentNode: MaterialsNetworkSopNode): MeshLambertBuilderMatNode {
	const meshLambertBuilder1 = parentNode.createNode('meshLambertBuilder');
	meshLambertBuilder1.setName('meshLambertBuilder1');
	function create_attribute1(meshLambertBuilder1: MeshLambertBuilderMatNode) {
		var attribute1 = meshLambertBuilder1.createNode('attribute');
		attribute1.setName('attribute1');
		attribute1.uiData.setPosition(-150, -250);
		attribute1.params.get('name')!.set('randomId');
		attribute1.params.postCreateSpareParams();
		attribute1.params.runOnSceneLoadHooks();
		return attribute1;
	}
	function create_floatToVec3_1(meshLambertBuilder1: MeshLambertBuilderMatNode) {
		var floatToVec3_1 = meshLambertBuilder1.createNode('floatToVec3');
		floatToVec3_1.setName('floatToVec3_1');
		floatToVec3_1.uiData.setPosition(0, -250);
		floatToVec3_1.params.get('y')!.set(0.75);
		floatToVec3_1.params.get('z')!.set(0.75);
		floatToVec3_1.params.postCreateSpareParams();
		floatToVec3_1.params.runOnSceneLoadHooks();
		return floatToVec3_1;
	}

	function create_hsvToRgb1(meshLambertBuilder1: MeshLambertBuilderMatNode) {
		var hsvToRgb1 = meshLambertBuilder1.createNode('hsvToRgb');
		hsvToRgb1.setName('hsvToRgb1');
		hsvToRgb1.uiData.setPosition(100, -250);
		hsvToRgb1.params.postCreateSpareParams();
		hsvToRgb1.params.runOnSceneLoadHooks();
		return hsvToRgb1;
	}
	function create_multAdd3(meshLambertBuilder1: MeshLambertBuilderMatNode) {
		var multAdd3 = meshLambertBuilder1.createNode('multAdd');
		multAdd3.setName('multAdd3');
		multAdd3.uiData.setPosition(50, 0);
		multAdd3.addParam(ParamType.VECTOR3, 'value', [0, 0, 0], {spare: true});
		multAdd3.addParam(ParamType.VECTOR3, 'preAdd', [0, 0, 0], {spare: true});
		multAdd3.addParam(ParamType.VECTOR3, 'mult', [1, 1, 1], {spare: true});
		multAdd3.addParam(ParamType.VECTOR3, 'postAdd', [0, 0, 0], {spare: true});
		multAdd3.params.postCreateSpareParams();
		multAdd3.params.runOnSceneLoadHooks();
		return multAdd3;
	}
	function create_output1(meshLambertBuilder1: MeshLambertBuilderMatNode) {
		var output1 = meshLambertBuilder1.createNode('output');
		output1.setName('output1');
		output1.uiData.setPosition(200, 0);
		output1.params.postCreateSpareParams();
		output1.params.runOnSceneLoadHooks();
		return output1;
	}
	function create_varyingRead1(meshLambertBuilder1: MeshLambertBuilderMatNode) {
		var varyingRead1 = meshLambertBuilder1.createNode('varyingRead');
		varyingRead1.setName('varyingRead1');
		varyingRead1.uiData.setPosition(-50, 0);
		varyingRead1.params.get('name')!.set('ptColor');
		varyingRead1.params.get('type')!.set(2);
		varyingRead1.params.postCreateSpareParams();
		varyingRead1.params.runOnSceneLoadHooks();
		return varyingRead1;
	}
	function create_varyingWrite1(meshLambertBuilder1: MeshLambertBuilderMatNode) {
		var varyingWrite1 = meshLambertBuilder1.createNode('varyingWrite');
		varyingWrite1.setName('varyingWrite1');
		varyingWrite1.uiData.setPosition(250, -250);
		varyingWrite1.params.get('name')!.set('ptColor');
		varyingWrite1.params.get('type')!.set(2);
		varyingWrite1.addParam(ParamType.VECTOR3, 'vertex', [0, 0, 0], {spare: true});
		varyingWrite1.params.postCreateSpareParams();
		varyingWrite1.params.runOnSceneLoadHooks();
		return varyingWrite1;
	}
	var attribute1 = create_attribute1(meshLambertBuilder1);
	var floatToVec3_1 = create_floatToVec3_1(meshLambertBuilder1);
	var hsvToRgb1 = create_hsvToRgb1(meshLambertBuilder1);
	var multAdd3 = create_multAdd3(meshLambertBuilder1);
	var output1 = create_output1(meshLambertBuilder1);
	var varyingRead1 = create_varyingRead1(meshLambertBuilder1);
	var varyingWrite1 = create_varyingWrite1(meshLambertBuilder1);
	floatToVec3_1.setInput('x', attribute1, 'val');
	hsvToRgb1.setInput('hsv', floatToVec3_1, 'vec3');
	multAdd3.setInput('value', varyingRead1, 'fragment');
	output1.setInput('color', multAdd3, 'val');
	varyingWrite1.setInput('vertex', hsvToRgb1, 'rgb');
	meshLambertBuilder1.uiData.setPosition(0, 0);
	meshLambertBuilder1.params.postCreateSpareParams();
	meshLambertBuilder1.params.runOnSceneLoadHooks();
	return meshLambertBuilder1;
}

function createMeshPhongBuilder(parentNode: MaterialsNetworkSopNode): MeshPhongBuilderMatNode {
	const meshPhongBuilder1 = parentNode.createNode('meshPhongBuilder');
	meshPhongBuilder1.setName('meshPhongBuilder1');
	function create_attribute1(meshPhongBuilder1: MeshPhongBuilderMatNode) {
		var attribute1 = meshPhongBuilder1.createNode('attribute');
		attribute1.setName('attribute1');
		attribute1.uiData.setPosition(-100, -250);
		attribute1.params.get('name')!.set('randomId');
		attribute1.params.postCreateSpareParams();
		attribute1.params.runOnSceneLoadHooks();
		return attribute1;
	}
	function create_floatToVec3_1(meshPhongBuilder1: MeshPhongBuilderMatNode) {
		var floatToVec3_1 = meshPhongBuilder1.createNode('floatToVec3');
		floatToVec3_1.setName('floatToVec3_1');
		floatToVec3_1.uiData.setPosition(50, -250);
		floatToVec3_1.params.get('y')!.set(0.75);
		floatToVec3_1.params.get('z')!.set(0.75);
		floatToVec3_1.params.postCreateSpareParams();
		floatToVec3_1.params.runOnSceneLoadHooks();
		return floatToVec3_1;
	}

	function create_hsvToRgb1(meshPhongBuilder1: MeshPhongBuilderMatNode) {
		var hsvToRgb1 = meshPhongBuilder1.createNode('hsvToRgb');
		hsvToRgb1.setName('hsvToRgb1');
		hsvToRgb1.uiData.setPosition(150, -250);
		hsvToRgb1.params.postCreateSpareParams();
		hsvToRgb1.params.runOnSceneLoadHooks();
		return hsvToRgb1;
	}
	function create_multAdd3(meshPhongBuilder1: MeshPhongBuilderMatNode) {
		var multAdd3 = meshPhongBuilder1.createNode('multAdd');
		multAdd3.setName('multAdd3');
		multAdd3.uiData.setPosition(100, 0);
		multAdd3.addParam(ParamType.VECTOR3, 'value', [0, 0, 0], {spare: true});
		multAdd3.addParam(ParamType.VECTOR3, 'preAdd', [0, 0, 0], {spare: true});
		multAdd3.addParam(ParamType.VECTOR3, 'mult', [1, 1, 1], {spare: true});
		multAdd3.addParam(ParamType.VECTOR3, 'postAdd', [0, 0, 0], {spare: true});
		multAdd3.params.postCreateSpareParams();
		multAdd3.params.runOnSceneLoadHooks();
		return multAdd3;
	}
	function create_output1(meshPhongBuilder1: MeshPhongBuilderMatNode) {
		var output1 = meshPhongBuilder1.createNode('output');
		output1.setName('output1');
		output1.uiData.setPosition(200, 0);
		output1.params.postCreateSpareParams();
		output1.params.runOnSceneLoadHooks();
		return output1;
	}
	function create_varyingRead1(meshPhongBuilder1: MeshPhongBuilderMatNode) {
		var varyingRead1 = meshPhongBuilder1.createNode('varyingRead');
		varyingRead1.setName('varyingRead1');
		varyingRead1.uiData.setPosition(0, 0);
		varyingRead1.params.get('name')!.set('ptColor');
		varyingRead1.params.get('type')!.set(2);
		varyingRead1.params.postCreateSpareParams();
		varyingRead1.params.runOnSceneLoadHooks();
		return varyingRead1;
	}
	function create_varyingWrite1(meshPhongBuilder1: MeshPhongBuilderMatNode) {
		var varyingWrite1 = meshPhongBuilder1.createNode('varyingWrite');
		varyingWrite1.setName('varyingWrite1');
		varyingWrite1.uiData.setPosition(300, -250);
		varyingWrite1.params.get('name')!.set('ptColor');
		varyingWrite1.params.get('type')!.set(2);
		varyingWrite1.addParam(ParamType.VECTOR3, 'vertex', [0, 0, 0], {spare: true});
		varyingWrite1.params.postCreateSpareParams();
		varyingWrite1.params.runOnSceneLoadHooks();
		return varyingWrite1;
	}
	var attribute1 = create_attribute1(meshPhongBuilder1);
	var floatToVec3_1 = create_floatToVec3_1(meshPhongBuilder1);
	var hsvToRgb1 = create_hsvToRgb1(meshPhongBuilder1);
	var multAdd3 = create_multAdd3(meshPhongBuilder1);
	var output1 = create_output1(meshPhongBuilder1);
	var varyingRead1 = create_varyingRead1(meshPhongBuilder1);
	var varyingWrite1 = create_varyingWrite1(meshPhongBuilder1);
	floatToVec3_1.setInput('x', attribute1, 'val');
	hsvToRgb1.setInput('hsv', floatToVec3_1, 'vec3');
	multAdd3.setInput('value', varyingRead1, 'fragment');
	output1.setInput('color', multAdd3, 'val');
	varyingWrite1.setInput('vertex', hsvToRgb1, 'rgb');
	meshPhongBuilder1.uiData.setPosition(0, 100);
	meshPhongBuilder1.params.postCreateSpareParams();
	meshPhongBuilder1.params.runOnSceneLoadHooks();
	return meshPhongBuilder1;
}

function createMeshStandardBuilder(parentNode: MaterialsNetworkSopNode): MeshStandardBuilderMatNode {
	const meshStandardBuilder1 = parentNode.createNode('meshStandardBuilder');
	meshStandardBuilder1.setName('meshStandardBuilder1');
	function create_attribute1(meshStandardBuilder1: MeshStandardBuilderMatNode) {
		var attribute1 = meshStandardBuilder1.createNode('attribute');
		attribute1.setName('attribute1');
		attribute1.uiData.setPosition(-400, -200);
		attribute1.params.get('name')!.set('randomId');
		attribute1.params.postCreateSpareParams();
		attribute1.params.runOnSceneLoadHooks();
		return attribute1;
	}
	function create_floatToVec3_1(meshStandardBuilder1: MeshStandardBuilderMatNode) {
		var floatToVec3_1 = meshStandardBuilder1.createNode('floatToVec3');
		floatToVec3_1.setName('floatToVec3_1');
		floatToVec3_1.uiData.setPosition(-100, -200);
		floatToVec3_1.params.get('y')!.set(0.84);
		floatToVec3_1.params.get('z')!.set(0.47);
		floatToVec3_1.params.postCreateSpareParams();
		floatToVec3_1.params.runOnSceneLoadHooks();
		return floatToVec3_1;
	}

	function create_hsvToRgb1(meshStandardBuilder1: MeshStandardBuilderMatNode) {
		var hsvToRgb1 = meshStandardBuilder1.createNode('hsvToRgb');
		hsvToRgb1.setName('hsvToRgb1');
		hsvToRgb1.uiData.setPosition(50, -200);
		hsvToRgb1.params.postCreateSpareParams();
		hsvToRgb1.params.runOnSceneLoadHooks();
		return hsvToRgb1;
	}
	function create_multAdd1(meshStandardBuilder1: MeshStandardBuilderMatNode) {
		var multAdd1 = meshStandardBuilder1.createNode('multAdd');
		multAdd1.setName('multAdd1');
		multAdd1.uiData.setPosition(50, 0);
		multAdd1.addParam(ParamType.VECTOR3, 'value', [0, 0, 0], {spare: true});
		multAdd1.addParam(ParamType.VECTOR3, 'preAdd', [0, 0, 0], {spare: true});
		multAdd1.addParam(ParamType.VECTOR3, 'mult', [1, 1, 1], {spare: true});
		multAdd1.addParam(ParamType.VECTOR3, 'postAdd', [0, 0, 0], {spare: true});
		multAdd1.params.postCreateSpareParams();
		multAdd1.params.runOnSceneLoadHooks();
		return multAdd1;
	}
	function create_multAdd2(meshStandardBuilder1: MeshStandardBuilderMatNode) {
		var multAdd2 = meshStandardBuilder1.createNode('multAdd');
		multAdd2.setName('multAdd2');
		multAdd2.uiData.setPosition(-200, -200);
		multAdd2.addParam(ParamType.FLOAT, 'value', 0, {spare: true});
		multAdd2.addParam(ParamType.FLOAT, 'preAdd', 0, {spare: true});
		multAdd2.params.get('preAdd')!.set(1.3);
		multAdd2.addParam(ParamType.FLOAT, 'mult', 1, {spare: true});
		multAdd2.params.get('mult')!.set(10000);
		multAdd2.addParam(ParamType.FLOAT, 'postAdd', 0, {spare: true});
		multAdd2.params.postCreateSpareParams();
		multAdd2.params.runOnSceneLoadHooks();
		return multAdd2;
	}
	function create_output1(meshStandardBuilder1: MeshStandardBuilderMatNode) {
		var output1 = meshStandardBuilder1.createNode('output');
		output1.setName('output1');
		output1.uiData.setPosition(200, 0);
		output1.params.postCreateSpareParams();
		output1.params.runOnSceneLoadHooks();
		return output1;
	}
	function create_varyingRead1(meshStandardBuilder1: MeshStandardBuilderMatNode) {
		var varyingRead1 = meshStandardBuilder1.createNode('varyingRead');
		varyingRead1.setName('varyingRead1');
		varyingRead1.uiData.setPosition(-50, 0);
		varyingRead1.params.get('name')!.set('ptColor');
		varyingRead1.params.get('type')!.set(2);
		varyingRead1.params.postCreateSpareParams();
		varyingRead1.params.runOnSceneLoadHooks();
		return varyingRead1;
	}
	function create_varyingWrite1(meshStandardBuilder1: MeshStandardBuilderMatNode) {
		var varyingWrite1 = meshStandardBuilder1.createNode('varyingWrite');
		varyingWrite1.setName('varyingWrite1');
		varyingWrite1.uiData.setPosition(200, -200);
		varyingWrite1.params.get('name')!.set('ptColor');
		varyingWrite1.params.get('type')!.set(2);
		varyingWrite1.addParam(ParamType.VECTOR3, 'vertex', [0, 0, 0], {spare: true});
		varyingWrite1.params.postCreateSpareParams();
		varyingWrite1.params.runOnSceneLoadHooks();
		return varyingWrite1;
	}
	var attribute1 = create_attribute1(meshStandardBuilder1);
	var floatToVec3_1 = create_floatToVec3_1(meshStandardBuilder1);
	var hsvToRgb1 = create_hsvToRgb1(meshStandardBuilder1);
	var multAdd1 = create_multAdd1(meshStandardBuilder1);
	var multAdd2 = create_multAdd2(meshStandardBuilder1);
	var output1 = create_output1(meshStandardBuilder1);
	var varyingRead1 = create_varyingRead1(meshStandardBuilder1);
	var varyingWrite1 = create_varyingWrite1(meshStandardBuilder1);
	floatToVec3_1.setInput('x', multAdd2, 'val');
	hsvToRgb1.setInput('hsv', floatToVec3_1, 'vec3');
	multAdd1.setInput('value', varyingRead1, 'fragment');
	multAdd2.setInput('value', attribute1, 'val');
	output1.setInput('color', multAdd1, 'val');
	varyingWrite1.setInput('vertex', hsvToRgb1, 'rgb');
	meshStandardBuilder1.uiData.setPosition(0, 0);
	meshStandardBuilder1.params.postCreateSpareParams();
	meshStandardBuilder1.params.runOnSceneLoadHooks();
	return meshStandardBuilder1;
}

function createMeshPhysicalBuilder(parentNode: MaterialsNetworkSopNode): MeshPhysicalBuilderMatNode {
	const meshPhysicalBuilder1 = parentNode.createNode('meshPhysicalBuilder');
	meshPhysicalBuilder1.setName('meshPhysicalBuilder1');
	function create_attribute1(meshPhysicalBuilder1: MeshPhysicalBuilderMatNode) {
		var attribute1 = meshPhysicalBuilder1.createNode('attribute');
		attribute1.setName('attribute1');
		attribute1.uiData.setPosition(-300, -200);
		attribute1.params.get('name')!.set('randomId');
		attribute1.params.postCreateSpareParams();
		attribute1.params.runOnSceneLoadHooks();
		return attribute1;
	}
	function create_floatToVec3_1(meshPhysicalBuilder1: MeshPhysicalBuilderMatNode) {
		var floatToVec3_1 = meshPhysicalBuilder1.createNode('floatToVec3');
		floatToVec3_1.setName('floatToVec3_1');
		floatToVec3_1.uiData.setPosition(0, -200);
		floatToVec3_1.params.get('y')!.set(0.84);
		floatToVec3_1.params.get('z')!.set(0.47);
		floatToVec3_1.params.postCreateSpareParams();
		floatToVec3_1.params.runOnSceneLoadHooks();
		return floatToVec3_1;
	}

	function create_hsvToRgb1(meshPhysicalBuilder1: MeshPhysicalBuilderMatNode) {
		var hsvToRgb1 = meshPhysicalBuilder1.createNode('hsvToRgb');
		hsvToRgb1.setName('hsvToRgb1');
		hsvToRgb1.uiData.setPosition(150, -200);
		hsvToRgb1.params.postCreateSpareParams();
		hsvToRgb1.params.runOnSceneLoadHooks();
		return hsvToRgb1;
	}
	function create_multAdd1(meshPhysicalBuilder1: MeshPhysicalBuilderMatNode) {
		var multAdd1 = meshPhysicalBuilder1.createNode('multAdd');
		multAdd1.setName('multAdd1');
		multAdd1.uiData.setPosition(150, 0);
		multAdd1.addParam(ParamType.VECTOR3, 'value', [0, 0, 0], {spare: true});
		multAdd1.addParam(ParamType.VECTOR3, 'preAdd', [0, 0, 0], {spare: true});
		multAdd1.addParam(ParamType.VECTOR3, 'mult', [1, 1, 1], {spare: true});
		multAdd1.addParam(ParamType.VECTOR3, 'postAdd', [0, 0, 0], {spare: true});
		multAdd1.params.postCreateSpareParams();
		multAdd1.params.runOnSceneLoadHooks();
		return multAdd1;
	}
	function create_multAdd2(meshPhysicalBuilder1: MeshPhysicalBuilderMatNode) {
		var multAdd2 = meshPhysicalBuilder1.createNode('multAdd');
		multAdd2.setName('multAdd2');
		multAdd2.uiData.setPosition(-100, -200);
		multAdd2.addParam(ParamType.FLOAT, 'value', 0, {spare: true});
		multAdd2.addParam(ParamType.FLOAT, 'preAdd', 0, {spare: true});
		multAdd2.params.get('preAdd')!.set(1.3);
		multAdd2.addParam(ParamType.FLOAT, 'mult', 1, {spare: true});
		multAdd2.params.get('mult')!.set(10000);
		multAdd2.addParam(ParamType.FLOAT, 'postAdd', 0, {spare: true});
		multAdd2.params.postCreateSpareParams();
		multAdd2.params.runOnSceneLoadHooks();
		return multAdd2;
	}
	function create_output1(meshPhysicalBuilder1: MeshPhysicalBuilderMatNode) {
		var output1 = meshPhysicalBuilder1.createNode('output');
		output1.setName('output1');
		output1.uiData.setPosition(400, 50);
		output1.params.postCreateSpareParams();
		output1.params.runOnSceneLoadHooks();
		return output1;
	}
	function create_varyingRead1(meshPhysicalBuilder1: MeshPhysicalBuilderMatNode) {
		var varyingRead1 = meshPhysicalBuilder1.createNode('varyingRead');
		varyingRead1.setName('varyingRead1');
		varyingRead1.uiData.setPosition(50, 0);
		varyingRead1.params.get('name')!.set('ptColor');
		varyingRead1.params.get('type')!.set(2);
		varyingRead1.params.postCreateSpareParams();
		varyingRead1.params.runOnSceneLoadHooks();
		return varyingRead1;
	}
	function create_varyingWrite1(meshPhysicalBuilder1: MeshPhysicalBuilderMatNode) {
		var varyingWrite1 = meshPhysicalBuilder1.createNode('varyingWrite');
		varyingWrite1.setName('varyingWrite1');
		varyingWrite1.uiData.setPosition(300, -200);
		varyingWrite1.params.get('name')!.set('ptColor');
		varyingWrite1.params.get('type')!.set(2);
		varyingWrite1.addParam(ParamType.VECTOR3, 'vertex', [0, 0, 0], {spare: true});
		varyingWrite1.params.postCreateSpareParams();
		varyingWrite1.params.runOnSceneLoadHooks();
		return varyingWrite1;
	}
	var attribute1 = create_attribute1(meshPhysicalBuilder1);
	var floatToVec3_1 = create_floatToVec3_1(meshPhysicalBuilder1);
	var hsvToRgb1 = create_hsvToRgb1(meshPhysicalBuilder1);
	var multAdd1 = create_multAdd1(meshPhysicalBuilder1);
	var multAdd2 = create_multAdd2(meshPhysicalBuilder1);
	var output1 = create_output1(meshPhysicalBuilder1);
	var varyingRead1 = create_varyingRead1(meshPhysicalBuilder1);
	var varyingWrite1 = create_varyingWrite1(meshPhysicalBuilder1);
	floatToVec3_1.setInput('x', multAdd2, 'val');
	hsvToRgb1.setInput('hsv', floatToVec3_1, 'vec3');
	multAdd1.setInput('value', varyingRead1, 'fragment');
	multAdd2.setInput('value', attribute1, 'val');
	output1.setInput('color', multAdd1, 'val');
	varyingWrite1.setInput('vertex', hsvToRgb1, 'rgb');
	meshPhysicalBuilder1.uiData.setPosition(0, 100);
	meshPhysicalBuilder1.params.postCreateSpareParams();
	meshPhysicalBuilder1.params.runOnSceneLoadHooks();
	return meshPhysicalBuilder1;
}

function createLineBuilder(parentNode: MaterialsNetworkSopNode): LineBasicBuilderMatNode {
	const lineBasicBuilder1 = parentNode.createNode('lineBasicBuilder');
	lineBasicBuilder1.setName('lineBasicBuilder1');
	function create_attribute1(lineBasicBuilder1: LineBasicBuilderMatNode) {
		var attribute1 = lineBasicBuilder1.createNode('attribute');
		attribute1.setName('attribute1');
		attribute1.uiData.setPosition(50, -200);
		attribute1.params.get('name')!.set('randomid');
		attribute1.params.postCreateSpareParams();
		attribute1.params.runOnSceneLoadHooks();
		return attribute1;
	}
	function create_floatToVec3_1(lineBasicBuilder1: LineBasicBuilderMatNode) {
		var floatToVec3_1 = lineBasicBuilder1.createNode('floatToVec3');
		floatToVec3_1.setName('floatToVec3_1');
		floatToVec3_1.uiData.setPosition(200, -200);
		floatToVec3_1.params.get('y')!.set(0.31);
		floatToVec3_1.params.get('z')!.set(0.24);
		floatToVec3_1.params.postCreateSpareParams();
		floatToVec3_1.params.runOnSceneLoadHooks();
		return floatToVec3_1;
	}

	function create_multAdd1(lineBasicBuilder1: LineBasicBuilderMatNode) {
		var multAdd1 = lineBasicBuilder1.createNode('multAdd');
		multAdd1.setName('multAdd1');
		multAdd1.uiData.setPosition(250, 50);
		multAdd1.addParam(ParamType.VECTOR3, 'value', [0, 0, 0], {spare: true});
		multAdd1.addParam(ParamType.VECTOR3, 'preAdd', [0, 0, 0], {spare: true});
		multAdd1.addParam(ParamType.VECTOR3, 'mult', [1, 1, 1], {spare: true});
		multAdd1.params.get('multx')!.set(0.8);
		multAdd1.params.get('multy')!.set(1.2);
		multAdd1.params.get('multz')!.set(1.2);
		multAdd1.params.get('multx')!.set(0.8);
		multAdd1.params.get('multy')!.set(1.2);
		multAdd1.params.get('multz')!.set(1.2);
		multAdd1.addParam(ParamType.VECTOR3, 'postAdd', [0, 0, 0], {spare: true});
		multAdd1.params.postCreateSpareParams();
		multAdd1.params.runOnSceneLoadHooks();
		return multAdd1;
	}
	function create_output1(lineBasicBuilder1: LineBasicBuilderMatNode) {
		var output1 = lineBasicBuilder1.createNode('output');
		output1.setName('output1');
		output1.uiData.setPosition(450, 0);
		output1.params.postCreateSpareParams();
		output1.params.runOnSceneLoadHooks();
		return output1;
	}
	function create_varyingRead1(lineBasicBuilder1: LineBasicBuilderMatNode) {
		var varyingRead1 = lineBasicBuilder1.createNode('varyingRead');
		varyingRead1.setName('varyingRead1');
		varyingRead1.uiData.setPosition(100, 0);
		varyingRead1.params.get('name')!.set('ptColor');
		varyingRead1.params.get('type')!.set(2);
		varyingRead1.params.postCreateSpareParams();
		varyingRead1.params.runOnSceneLoadHooks();
		return varyingRead1;
	}
	function create_varyingWrite1(lineBasicBuilder1: LineBasicBuilderMatNode) {
		var varyingWrite1 = lineBasicBuilder1.createNode('varyingWrite');
		varyingWrite1.setName('varyingWrite1');
		varyingWrite1.uiData.setPosition(350, -200);
		varyingWrite1.params.get('name')!.set('ptColor');
		varyingWrite1.params.get('type')!.set(2);
		varyingWrite1.addParam(ParamType.VECTOR3, 'vertex', [0, 0, 0], {spare: true});
		varyingWrite1.params.postCreateSpareParams();
		varyingWrite1.params.runOnSceneLoadHooks();
		return varyingWrite1;
	}
	var attribute1 = create_attribute1(lineBasicBuilder1);
	var floatToVec3_1 = create_floatToVec3_1(lineBasicBuilder1);
	var multAdd1 = create_multAdd1(lineBasicBuilder1);
	var output1 = create_output1(lineBasicBuilder1);
	var varyingRead1 = create_varyingRead1(lineBasicBuilder1);
	var varyingWrite1 = create_varyingWrite1(lineBasicBuilder1);
	floatToVec3_1.setInput('x', attribute1, 'val');
	multAdd1.setInput('value', varyingRead1, 'fragment');
	output1.setInput('color', multAdd1, 'val');
	varyingWrite1.setInput('vertex', floatToVec3_1, 'vec3');
	lineBasicBuilder1.childrenController!.selection.add([multAdd1]);
	lineBasicBuilder1.uiData.setPosition(0, 0);
	lineBasicBuilder1.params.postCreateSpareParams();
	lineBasicBuilder1.params.runOnSceneLoadHooks();
	return lineBasicBuilder1;
}

// generates via copy/paste
function createPointsBuilder(parentNode: MaterialsNetworkSopNode): PointsBuilderMatNode {
	const pointsParticles_DEBUG = parentNode.createNode('pointsBuilder');
	pointsParticles_DEBUG.setName('pointsParticles_DEBUG');
	function create_attribute1(pointsParticles_DEBUG: PointsBuilderMatNode) {
		var attribute1 = pointsParticles_DEBUG.createNode('attribute');
		attribute1.setName('attribute1');
		attribute1.uiData.setPosition(50, -200);
		attribute1.params.get('name')!.set('randomid');
		attribute1.params.postCreateSpareParams();
		attribute1.params.runOnSceneLoadHooks();
		return attribute1;
	}
	function create_constant_point_size(pointsParticles_DEBUG: PointsBuilderMatNode) {
		var constant_point_size = pointsParticles_DEBUG.createNode('constant');
		constant_point_size.setName('constant_point_size');
		constant_point_size.uiData.setPosition(200, 300);
		constant_point_size.params.get(ParamType.FLOAT)!.set(6.9);
		constant_point_size.params.postCreateSpareParams();
		constant_point_size.params.runOnSceneLoadHooks();
		return constant_point_size;
	}
	function create_floatToVec3_1(pointsParticles_DEBUG: PointsBuilderMatNode) {
		var floatToVec3_1 = pointsParticles_DEBUG.createNode('floatToVec3');
		floatToVec3_1.setName('floatToVec3_1');
		floatToVec3_1.uiData.setPosition(200, -200);
		floatToVec3_1.params.get('y')!.set(0.31);
		floatToVec3_1.params.get('z')!.set(0.24);
		floatToVec3_1.params.postCreateSpareParams();
		floatToVec3_1.params.runOnSceneLoadHooks();
		return floatToVec3_1;
	}
	function create_output1(pointsParticles_DEBUG: PointsBuilderMatNode) {
		var output1 = pointsParticles_DEBUG.createNode('output');
		output1.setName('output1');
		output1.uiData.setPosition(400, 0);
		output1.params.postCreateSpareParams();
		output1.params.runOnSceneLoadHooks();
		return output1;
	}
	function create_varyingRead1(pointsParticles_DEBUG: PointsBuilderMatNode) {
		var varyingRead1 = pointsParticles_DEBUG.createNode('varyingRead');
		varyingRead1.setName('varyingRead1');
		varyingRead1.uiData.setPosition(100, 0);
		varyingRead1.params.get('name')!.set('ptColor');
		varyingRead1.params.get('type')!.set(2);
		varyingRead1.params.postCreateSpareParams();
		varyingRead1.params.runOnSceneLoadHooks();
		return varyingRead1;
	}
	function create_varyingWrite1(pointsParticles_DEBUG: PointsBuilderMatNode) {
		var varyingWrite1 = pointsParticles_DEBUG.createNode('varyingWrite');
		varyingWrite1.setName('varyingWrite1');
		varyingWrite1.uiData.setPosition(350, -200);
		varyingWrite1.params.get('name')!.set('ptColor');
		varyingWrite1.params.get('type')!.set(2);
		varyingWrite1.addParam(ParamType.VECTOR3, 'vertex', [0, 0, 0], {spare: true});
		varyingWrite1.params.postCreateSpareParams();
		varyingWrite1.params.runOnSceneLoadHooks();
		return varyingWrite1;
	}
	var attribute1 = create_attribute1(pointsParticles_DEBUG);
	var constant_point_size = create_constant_point_size(pointsParticles_DEBUG);
	var floatToVec3_1 = create_floatToVec3_1(pointsParticles_DEBUG);
	var output1 = create_output1(pointsParticles_DEBUG);
	var varyingRead1 = create_varyingRead1(pointsParticles_DEBUG);
	var varyingWrite1 = create_varyingWrite1(pointsParticles_DEBUG);
	floatToVec3_1.setInput('x', attribute1, 'val');
	output1.setInput('color', varyingRead1, 'fragment');
	output1.setInput('gl_PointSize', constant_point_size, 'val');
	varyingWrite1.setInput('vertex', floatToVec3_1, 'vec3');
	pointsParticles_DEBUG.childrenController!.selection.add([floatToVec3_1]);
	pointsParticles_DEBUG.uiData.setPosition(0, 200);
	pointsParticles_DEBUG.params.postCreateSpareParams();
	pointsParticles_DEBUG.params.runOnSceneLoadHooks();
	return pointsParticles_DEBUG;
}

QUnit.test('gl VaryingWrite works inside a meshBasicBuilder', async (assert) => {
	const geo1 = window.geo1;
	const MAT = geo1.createNode('materialsNetwork');
	const matNode = createMeshBasicBuilder(MAT);
	await matNode.compute();
	assert.equal(matNode.material.vertexShader, MESH_BASIC_BUILDER_VERTEX);
	assert.equal(matNode.material.fragmentShader, MESH_BASIC_BUILDER_FRAGMENT);
});

QUnit.test('gl VaryingWrite works inside a meshLambertBuilder', async (assert) => {
	const geo1 = window.geo1;
	const MAT = geo1.createNode('materialsNetwork');
	const matNode = createMeshLambertBuilder(MAT);
	await matNode.compute();
	assert.equal(matNode.material.vertexShader, MESH_LAMBERT_BUILDER_VERTEX);
	assert.equal(matNode.material.fragmentShader, MESH_LAMBERT_BUILDER_FRAGMENT);
});
QUnit.test('gl VaryingWrite works inside a meshPhongBuilder', async (assert) => {
	const geo1 = window.geo1;
	const MAT = geo1.createNode('materialsNetwork');
	const matNode = createMeshPhongBuilder(MAT);
	await matNode.compute();
	assert.equal(matNode.material.vertexShader, MESH_PHONG_BUILDER_VERTEX);
	assert.equal(matNode.material.fragmentShader, MESH_PHONG_BUILDER_FRAGMENT);
});

QUnit.test('gl VaryingWrite works inside a meshStandardBuilder', async (assert) => {
	const geo1 = window.geo1;
	const MAT = geo1.createNode('materialsNetwork');
	const matNode = createMeshStandardBuilder(MAT);
	await matNode.compute();
	assert.equal(matNode.material.vertexShader, MESH_STANDARD_BUILDER_VERTEX);
	assert.equal(matNode.material.fragmentShader, MESH_STANDARD_BUILDER_FRAGMENT);
});

QUnit.test('gl VaryingWrite works inside a meshPhysicalBuilder', async (assert) => {
	const geo1 = window.geo1;
	const MAT = geo1.createNode('materialsNetwork');
	const matNode = createMeshPhysicalBuilder(MAT);
	await matNode.compute();
	assert.equal(matNode.material.vertexShader, MESH_PHYSICAL_BUILDER_VERTEX);
	assert.equal(matNode.material.fragmentShader, MESH_PHYSICAL_BUILDER_FRAGMENT);
});

QUnit.test('gl VaryingWrite works inside a lineBasicBuilder', async (assert) => {
	const geo1 = window.geo1;
	const MAT = geo1.createNode('materialsNetwork');
	const lineBuilder1 = createLineBuilder(MAT);
	await lineBuilder1.compute();
	assert.equal(lineBuilder1.material.vertexShader, LINE_BASIC_BUILDER_VERTEX);
	assert.equal(lineBuilder1.material.fragmentShader, LINE_BASIC_BUILDER_FRAGMENT);
});

QUnit.test('gl VaryingWrite works inside a pointsBuilder', async (assert) => {
	const geo1 = window.geo1;
	const MAT = geo1.createNode('materialsNetwork');
	const pointsBuilder1 = createPointsBuilder(MAT);
	await pointsBuilder1.compute();
	assert.equal(pointsBuilder1.material.vertexShader, POINTS_BUILDER_VERTEX);
	assert.equal(pointsBuilder1.material.fragmentShader, POINTS_BUILDER_FRAGMENT);
});
