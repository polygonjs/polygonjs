import {PointsBuilderMatNode} from '../../../../../src/engine/nodes/mat/PointsBuilder';
import {GeoObjNode} from '../../../../../src/engine/nodes/obj/Geo';
import {MaterialsNetworkSopNode} from '../../../../../src/engine/nodes/sop/MaterialsNetwork';
import {ParticlesSystemGpuSopNode} from '../../../../../src/engine/nodes/sop/ParticlesSystemGpu';
import {ParamType} from '../../../../../src/engine/poly/ParamType';

export function ParticlesSceneSetup1() {
	const geo1 = window.geo1;
	const parentNode = geo1;
	function create_particlesSystemGpu1(parentNode: GeoObjNode) {
		var particlesSystemGpu1 = parentNode.createNode('particlesSystemGpu');
		particlesSystemGpu1.setName('particlesSystemGpu1');
		function create_add1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var add1 = particlesSystemGpu1.createNode('add');
			add1.setName('add1');
			add1.uiData.setPosition(0, -50);
			add1.addParam(ParamType.VECTOR3, 'add0', [0, 0, 0], {spare: true});
			add1.addParam(ParamType.VECTOR3, 'add1', [0, 0, 0], {spare: true});
			add1.addParam(ParamType.VECTOR3, 'add2', [0, 0, 0], {spare: true});
			add1.addParam(ParamType.VECTOR3, 'add3', [0, 0, 0], {spare: true});
			add1.params.postCreateSpareParams();
			add1.params.runOnSceneLoadHooks();
			return add1;
		}
		function create_attribute_randomId_read(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var attribute1 = particlesSystemGpu1.createNode('attribute');
			attribute1.setName('attribute1');
			attribute1.uiData.setPosition(-300, 200);
			attribute1.params.get('name')!.set('randomId');
			attribute1.params.get('texportWhenConnected')!.set(true);
			attribute1.addParam(ParamType.FLOAT, 'in', 0, {spare: true});
			attribute1.params.postCreateSpareParams();
			attribute1.params.runOnSceneLoadHooks();
			return attribute1;
		}
		function create_attribute2(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var attribute2 = particlesSystemGpu1.createNode('attribute');
			attribute2.setName('attribute2');
			attribute2.uiData.setPosition(-300, 0);
			attribute2.params.get('name')!.set('normal');
			attribute2.params.get('type')!.set(2);
			attribute2.params.get('texportWhenConnected')!.set(true);
			attribute2.addParam(ParamType.VECTOR3, 'in', [0, 0, 0], {spare: true});
			attribute2.params.postCreateSpareParams();
			attribute2.params.runOnSceneLoadHooks();
			return attribute2;
		}
		function create_attribute_randomId_export(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var attribute3 = particlesSystemGpu1.createNode('attribute');
			attribute3.setName('attribute3');
			attribute3.uiData.setPosition(200, 200);
			attribute3.params.get('name')!.set('randomId');
			attribute3.params.get('texportWhenConnected')!.set(true);
			attribute3.params.get('exportWhenConnected')!.set(true);
			attribute3.addParam(ParamType.FLOAT, 'in', 0, {spare: true});
			attribute3.params.postCreateSpareParams();
			attribute3.params.runOnSceneLoadHooks();
			return attribute3;
		}
		function create_floatToVec3_1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var floatToVec3_1 = particlesSystemGpu1.createNode('floatToVec3');
			floatToVec3_1.setName('floatToVec3_1');
			floatToVec3_1.uiData.setPosition(-100, 150);
			floatToVec3_1.params.postCreateSpareParams();
			floatToVec3_1.params.runOnSceneLoadHooks();
			return floatToVec3_1;
		}
		function create_globals1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var globals1 = particlesSystemGpu1.createNode('globals');
			globals1.setName('globals1');
			globals1.uiData.setPosition(-250, -150);
			globals1.params.postCreateSpareParams();
			globals1.params.runOnSceneLoadHooks();
			return globals1;
		}
		function create_output1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var output1 = particlesSystemGpu1.createNode('output');
			output1.setName('output1');
			output1.uiData.setPosition(200, 0);
			output1.params.postCreateSpareParams();
			output1.params.runOnSceneLoadHooks();
			return output1;
		}
		var add1 = create_add1(particlesSystemGpu1);
		var attribute_randomId_read = create_attribute_randomId_read(particlesSystemGpu1);
		var attribute2 = create_attribute2(particlesSystemGpu1);
		var attribute_randomId_export = create_attribute_randomId_export(particlesSystemGpu1);
		var floatToVec3_1 = create_floatToVec3_1(particlesSystemGpu1);
		var globals1 = create_globals1(particlesSystemGpu1);
		var output1 = create_output1(particlesSystemGpu1);
		add1.setInput('add0', globals1, 'position');
		add1.setInput('add1', attribute2, 'val');
		add1.setInput('add2', floatToVec3_1, 'vec3');
		attribute_randomId_export.setInput('in', attribute_randomId_read, 'val');
		floatToVec3_1.setInput('y', attribute_randomId_read, 'val');
		output1.setInput('position', add1, 'sum');
		particlesSystemGpu1.childrenController!.selection.add([attribute_randomId_export]);
		particlesSystemGpu1.uiData.setPosition(-150, 50);
		particlesSystemGpu1.params.get('material')!.set('../MAT/pointsParticles');
		particlesSystemGpu1.params.postCreateSpareParams();
		particlesSystemGpu1.params.runOnSceneLoadHooks();
		return {particlesSystemGpu1, attribute_randomId_read, attribute_randomId_export};
	}
	function create_MAT(parentNode: GeoObjNode) {
		var MAT = parentNode.createNode('materialsNetwork');
		MAT.setName('MAT');
		function create_pointsParticles(MAT: MaterialsNetworkSopNode) {
			var pointsParticles = MAT.createNode('pointsBuilder');
			pointsParticles.setName('pointsParticles');
			function create_attribute1(pointsParticles: PointsBuilderMatNode) {
				var attribute1 = pointsParticles.createNode('attribute');
				attribute1.setName('attribute1');
				attribute1.uiData.setPosition(-300, -150);
				attribute1.params.get('name')!.set('randomId');
				attribute1.params.postCreateSpareParams();
				attribute1.params.runOnSceneLoadHooks();
				return attribute1;
			}
			function create_constant_point_size(pointsParticles: PointsBuilderMatNode) {
				var constant_point_size = pointsParticles.createNode('constant');
				constant_point_size.setName('constant_point_size');
				constant_point_size.uiData.setPosition(0, 150);
				constant_point_size.params.get('float')!.set(4);
				constant_point_size.params.postCreateSpareParams();
				constant_point_size.params.runOnSceneLoadHooks();
				return constant_point_size;
			}
			function create_floatToVec3_1(pointsParticles: PointsBuilderMatNode) {
				var floatToVec3_1 = pointsParticles.createNode('floatToVec3');
				floatToVec3_1.setName('floatToVec3_1');
				floatToVec3_1.uiData.setPosition(-150, -150);
				floatToVec3_1.params.get('y')!.set(1);
				floatToVec3_1.params.get('z')!.set(0.91);
				floatToVec3_1.params.postCreateSpareParams();
				floatToVec3_1.params.runOnSceneLoadHooks();
				return floatToVec3_1;
			}
			function create_hsvToRgb1(pointsParticles: PointsBuilderMatNode) {
				var hsvToRgb1 = pointsParticles.createNode('hsvToRgb');
				hsvToRgb1.setName('hsvToRgb1');
				hsvToRgb1.uiData.setPosition(-50, -150);
				hsvToRgb1.params.postCreateSpareParams();
				hsvToRgb1.params.runOnSceneLoadHooks();
				return hsvToRgb1;
			}
			function create_output1(pointsParticles: PointsBuilderMatNode) {
				var output1 = pointsParticles.createNode('output');
				output1.setName('output1');
				output1.uiData.setPosition(200, 0);
				output1.params.postCreateSpareParams();
				output1.params.runOnSceneLoadHooks();
				return output1;
			}
			var attribute1 = create_attribute1(pointsParticles);
			var constant_point_size = create_constant_point_size(pointsParticles);
			var floatToVec3_1 = create_floatToVec3_1(pointsParticles);
			var hsvToRgb1 = create_hsvToRgb1(pointsParticles);
			var output1 = create_output1(pointsParticles);
			floatToVec3_1.setInput('x', attribute1, 'val');
			hsvToRgb1.setInput('hsv', floatToVec3_1, 'vec3');
			output1.setInput('color', hsvToRgb1, 'rgb');
			output1.setInput('gl_PointSize', constant_point_size, 'val');
			pointsParticles.uiData.setPosition(0, 0);
			pointsParticles.params.postCreateSpareParams();
			pointsParticles.params.runOnSceneLoadHooks();
			return pointsParticles;
		}
		const pointsBuilder1 = create_pointsParticles(MAT);
		MAT.uiData.setPosition(-350, 50);
		MAT.params.postCreateSpareParams();
		MAT.params.runOnSceneLoadHooks();
		return {MAT, pointsBuilder1};
	}
	function create_attribCreate1(parentNode: GeoObjNode) {
		var attribCreate1 = parentNode.createNode('attribCreate');
		attribCreate1.setName('attribCreate1');
		attribCreate1.uiData.setPosition(-150, -150);
		attribCreate1.params.get('name')!.set('randomId');
		attribCreate1.params.get('value1')!.set('rand(@ptnum * 124.543)');
		attribCreate1.params.postCreateSpareParams();
		attribCreate1.params.runOnSceneLoadHooks();
		return attribCreate1;
	}
	function create_sphere1(parentNode: GeoObjNode) {
		var sphere1 = parentNode.createNode('sphere');
		sphere1.setName('sphere1');
		sphere1.uiData.setPosition(-150, -350);
		sphere1.params.postCreateSpareParams();
		sphere1.params.runOnSceneLoadHooks();
		return sphere1;
	}
	function create_scatter1(parentNode: GeoObjNode) {
		var scatter1 = parentNode.createNode('scatter');
		scatter1.setName('scatter1');
		scatter1.uiData.setPosition(-150, -250);
		scatter1.params.postCreateSpareParams();
		scatter1.params.runOnSceneLoadHooks();
		return scatter1;
	}
	const box = geo1.createNode('box');
	box.flags.display.set(true);
	const {particlesSystemGpu1, attribute_randomId_read, attribute_randomId_export} =
		create_particlesSystemGpu1(parentNode);
	const {pointsBuilder1} = create_MAT(parentNode);
	const attribCreate1 = create_attribCreate1(parentNode);
	const sphere1 = create_sphere1(parentNode);
	const scatter1 = create_scatter1(parentNode);
	particlesSystemGpu1.setInput(0, attribCreate1);
	attribCreate1.setInput(0, scatter1);
	scatter1.setInput(0, sphere1);

	return {particlesSystemGpu1, pointsBuilder1, attribute_randomId_read, attribute_randomId_export};
}
