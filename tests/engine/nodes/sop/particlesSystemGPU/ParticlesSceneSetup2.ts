import {PointsBuilderMatNode} from '../../../../../src/engine/nodes/mat/PointsBuilder';
import {GeoObjNode} from '../../../../../src/engine/nodes/obj/Geo';
import {MaterialsNetworkSopNode} from '../../../../../src/engine/nodes/sop/MaterialsNetwork';
import {ParticlesSystemGpuSopNode} from '../../../../../src/engine/nodes/sop/ParticlesSystemGpu';
import {ParamType} from '../../../../../src/engine/poly/ParamType';

export function ParticlesSceneSetup2() {
	const geo1 = window.geo1;

	function create_particlesSystemGpu1(parentNode: GeoObjNode) {
		var particlesSystemGpu1 = parentNode.createNode('particlesSystemGpu');
		particlesSystemGpu1.setName('particlesSystemGpu1');
		function create_acceleration1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var acceleration1 = particlesSystemGpu1.createNode('acceleration');
			acceleration1.setName('acceleration1');
			acceleration1.uiData.setPosition(0, 50);
			acceleration1.addParam(ParamType.VECTOR3, 'position', [0, 0, 0], {spare: true});
			acceleration1.addParam(ParamType.VECTOR3, 'velocity', [0, 0, 0], {spare: true});
			acceleration1.addParam(ParamType.FLOAT, 'mass', 1, {spare: true});
			acceleration1.addParam(ParamType.VECTOR3, 'force', [0, -9.8, 0], {spare: true});
			acceleration1.params.postCreateSpareParams();
			acceleration1.params.runOnSceneLoadHooks();
			return acceleration1;
		}
		function create_add1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var add1 = particlesSystemGpu1.createNode('add');
			add1.setName('add1');
			add1.uiData.setPosition(-200, 100);
			add1.addParam(ParamType.VECTOR3, 'add0', [0, 0, 0], {spare: true});
			add1.addParam(ParamType.VECTOR3, 'add1', [0, 0, 0], {spare: true});
			add1.addParam(ParamType.VECTOR3, 'add2', [0, 0, 0], {spare: true});
			add1.params.postCreateSpareParams();
			add1.params.runOnSceneLoadHooks();
			return add1;
		}
		function create_attribute1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var attribute1 = particlesSystemGpu1.createNode('attribute');
			attribute1.setName('attribute1');
			attribute1.uiData.setPosition(-500, 100);
			attribute1.params.get('name')!.set('normal');
			attribute1.params.get('type')!.set(2);
			attribute1.params.get('texportWhenConnected')!.set(true);
			attribute1.addParam(ParamType.VECTOR3, 'in', [0, 0, 0], {spare: true});
			attribute1.params.postCreateSpareParams();
			attribute1.params.runOnSceneLoadHooks();
			return attribute1;
		}
		function create_attribute2(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var attribute2 = particlesSystemGpu1.createNode('attribute');
			attribute2.setName('attribute2');
			attribute2.uiData.setPosition(-500, 250);
			attribute2.params.get('name')!.set('bby');
			attribute2.params.get('texportWhenConnected')!.set(true);
			attribute2.addParam(ParamType.FLOAT, 'in', 0, {spare: true});
			attribute2.params.postCreateSpareParams();
			attribute2.params.runOnSceneLoadHooks();
			return attribute2;
		}
		function create_floatToVec3_1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var floatToVec3_1 = particlesSystemGpu1.createNode('floatToVec3');
			floatToVec3_1.setName('floatToVec3_1');
			floatToVec3_1.uiData.setPosition(-350, 200);
			floatToVec3_1.params.postCreateSpareParams();
			floatToVec3_1.params.runOnSceneLoadHooks();
			return floatToVec3_1;
		}
		function create_globals1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var globals1 = particlesSystemGpu1.createNode('globals');
			globals1.setName('globals1');
			globals1.uiData.setPosition(-250, -50);
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
		var acceleration1 = create_acceleration1(particlesSystemGpu1);
		var add1 = create_add1(particlesSystemGpu1);
		var attribute1 = create_attribute1(particlesSystemGpu1);
		var attribute2 = create_attribute2(particlesSystemGpu1);
		var floatToVec3_1 = create_floatToVec3_1(particlesSystemGpu1);
		var globals1 = create_globals1(particlesSystemGpu1);
		var output1 = create_output1(particlesSystemGpu1);
		acceleration1.setInput('position', globals1, 'position');
		acceleration1.setInput('velocity', globals1, 'velocity');
		acceleration1.setInput('force', add1, 'sum');
		add1.setInput('add0', attribute1, 'val');
		add1.setInput('add1', floatToVec3_1, 'vec3');
		floatToVec3_1.setInput('y', attribute2, 'val');
		output1.setInput('position', acceleration1, 'position');
		output1.setInput('velocity', acceleration1, 'velocity');
		particlesSystemGpu1.uiData.setPosition(-150, 50);
		particlesSystemGpu1.params.get('material')!.set('../MAT/pointsParticles');
		particlesSystemGpu1.params.postCreateSpareParams();
		particlesSystemGpu1.params.runOnSceneLoadHooks();
		return {particlesSystemGpu1};
	}
	function create_MAT(parentNode: GeoObjNode) {
		var MAT = parentNode.createNode('materialsNetwork');
		MAT.setName('MAT');
		function create_pointsParticles(MAT: MaterialsNetworkSopNode) {
			var pointsParticles = MAT.createNode('pointsBuilder');
			pointsParticles.setName('pointsParticles');
			function create_constant_point_size(pointsParticles: PointsBuilderMatNode) {
				var constant_point_size = pointsParticles.createNode('constant');
				constant_point_size.setName('constant_point_size');
				constant_point_size.uiData.setPosition(0, 0);
				constant_point_size.params.get('float')!.set(4);
				constant_point_size.params.postCreateSpareParams();
				constant_point_size.params.runOnSceneLoadHooks();
				return constant_point_size;
			}

			function create_output1(pointsParticles: PointsBuilderMatNode) {
				var output1 = pointsParticles.createNode('output');
				output1.setName('output1');
				output1.uiData.setPosition(200, 0);
				output1.params.postCreateSpareParams();
				output1.params.runOnSceneLoadHooks();
				return output1;
			}
			var constant_point_size = create_constant_point_size(pointsParticles);
			var output1 = create_output1(pointsParticles);
			output1.setInput('gl_PointSize', constant_point_size, 'val');
			pointsParticles.uiData.setPosition(0, 0);
			pointsParticles.params.postCreateSpareParams();
			pointsParticles.params.runOnSceneLoadHooks();
			return pointsParticles;
		}
		create_pointsParticles(MAT);
		MAT.uiData.setPosition(-350, 50);
		MAT.params.postCreateSpareParams();
		MAT.params.runOnSceneLoadHooks();
		return MAT;
	}
	function create_attribCreate1(parentNode: GeoObjNode) {
		var attribCreate1 = parentNode.createNode('attribCreate');
		attribCreate1.setName('attribCreate1');
		attribCreate1.uiData.setPosition(-150, -50);
		attribCreate1.params.get('name')!.set('bby');
		attribCreate1.params.get('value1')!.set("(@P.y - bbox(0, 'min').y) / bbox(0,'size').y");
		attribCreate1.params.postCreateSpareParams();
		attribCreate1.params.runOnSceneLoadHooks();
		return attribCreate1;
	}
	function create_sphere1(parentNode: GeoObjNode) {
		var sphere1 = parentNode.createNode('sphere');
		sphere1.setName('sphere1');
		sphere1.uiData.setPosition(-150, -250);
		sphere1.params.postCreateSpareParams();
		sphere1.params.runOnSceneLoadHooks();
		return sphere1;
	}
	function create_scatter1(parentNode: GeoObjNode) {
		var scatter1 = parentNode.createNode('scatter');
		scatter1.setName('scatter1');
		scatter1.uiData.setPosition(-150, -150);
		scatter1.params.postCreateSpareParams();
		scatter1.params.runOnSceneLoadHooks();
		return scatter1;
	}

	const parentNode = geo1;
	const {particlesSystemGpu1} = create_particlesSystemGpu1(parentNode);
	create_MAT(parentNode);
	var attribCreate1 = create_attribCreate1(parentNode);
	var sphere1 = create_sphere1(parentNode);
	var scatter1 = create_scatter1(parentNode);
	scatter1.setInput(0, sphere1);
	attribCreate1.setInput(0, scatter1);
	particlesSystemGpu1.setInput(0, attribCreate1);

	return {particlesSystemGpu1};
}
