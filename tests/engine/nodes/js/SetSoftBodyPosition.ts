import type {QUnit} from '../../../helpers/QUnit';
import {SoftBodyVariable} from '../../../../src/engine/nodes/js/code/assemblers/softBody/SoftBodyAssembler';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
import {Mesh, Vector3} from 'three';
import {TetSoftBodySolverSopOnCreateRegister} from '../../../../src/core/hooks/onCreate/sop/TetSoftBodySolver';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {JsCompareTestName} from '../../../../src/engine/nodes/js/Compare';
import {FloatParam} from '../../../../src/engine/params/Float';
export function testenginenodesjsSetSoftBodyPosition(qUnit: QUnit) {
	const _v = new Vector3();

	qUnit.test('js/setSoftBodyPosition', async (assert) => {
		const geo1 = window.geo1;
		const scene = window.scene;
		const cameraNode = window.perspective_camera1;
		cameraNode.p.t.set([5.349038373580427, 4.306613431559093, 28.513176582411468]);
		cameraNode.p.r.set([-13.162309095523371, -1.5386850691580403, -0.3597796337160737]);
		scene.root().createNode('hemisphereLight');

		const geo2 = scene.root().createNode('geo');
		const plane1 = geo2.createNode('plane');
		plane1.p.direction.set([1, 1, 0]);

		const icosahedron1 = geo1.createNode('icosahedron');
		const tetrahedralize1 = geo1.createNode('tetrahedralize');
		const tetSoftBodySolver1 = geo1.createNode('tetSoftBodySolver');

		const hookController = new TetSoftBodySolverSopOnCreateRegister();
		const createdNode = hookController.onCreate(tetSoftBodySolver1);
		assert.ok(createdNode, 'createdNode');
		const {actor1, output1, onTick} = createdNode!;

		const SDFPlane1 = tetSoftBodySolver1.createNode('SDFPlane');
		output1.setInput(SoftBodyVariable.COLLISION_SDF, SDFPlane1);
		SDFPlane1.p.normal.set([1, 1, 0]);

		const getGeometryBoundingBox1 = actor1.createNode('getGeometryBoundingBox');
		const getBox3Property1 = actor1.createNode('getBox3Property');
		const vec3ToFloat1 = actor1.createNode('vec3ToFloat');
		const compare1 = actor1.createNode('compare');
		const triggerFilter1 = actor1.createNode('triggerFilter');
		const setSoftBodyPosition1 = actor1.createNode('setSoftBodyPosition');
		const setSoftBodyVelocity1 = actor1.createNode('setSoftBodyVelocity');

		setSoftBodyVelocity1.setInput(JsConnectionPointType.TRIGGER, setSoftBodyPosition1);
		setSoftBodyPosition1.setInput(JsConnectionPointType.TRIGGER, triggerFilter1);
		triggerFilter1.setInput(JsConnectionPointType.TRIGGER, onTick);
		triggerFilter1.setInput(triggerFilter1.p.condition.name(), compare1);
		compare1.setInput(0, vec3ToFloat1, 'y');
		vec3ToFloat1.setInput(0, getBox3Property1, 'max');
		getBox3Property1.setInput(0, getGeometryBoundingBox1, JsConnectionPointType.BOX3);

		setSoftBodyPosition1.p.position.set([0, 3, 0]);
		setSoftBodyVelocity1.p.mult.set(0.1);

		compare1.setTestName(JsCompareTestName.LESS_THAN);
		(compare1.params.get('value1') as FloatParam).set(-2);

		tetrahedralize1.setInput(0, icosahedron1);
		tetSoftBodySolver1.setInput(0, tetrahedralize1);

		icosahedron1.p.center.set([0, 2, 0]);
		icosahedron1.p.detail.set(2);
		tetrahedralize1.p.innerPointsResolution.set(6);

		actor1.flags.display.set(true);

		const container = await actor1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;

		function getGeometryBoundingBoxY() {
			const geometry = object.geometry;
			geometry.computeBoundingBox();
			const box = geometry.boundingBox!;
			const y = box.getCenter(_v).y;
			return y;
		}

		assert.in_delta(getGeometryBoundingBoxY(), 2, 0.1, 'object is at the top');

		let hasMovedDown = false;
		let hasGoneBackUp = false;

		await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
			scene.play();
			const callbackName = 'js/setSoftBodyPosition';
			scene.registerOnBeforeTick(callbackName, () => {
				if (getGeometryBoundingBoxY() < 0) {
					hasMovedDown = true;
				}
				if (hasMovedDown && getGeometryBoundingBoxY() > 0) {
					hasGoneBackUp = true;
				}
			});
			await CoreSleep.sleep(3000);
			scene.unRegisterOnBeforeTick(callbackName);
			assert.ok(hasMovedDown, 'object has moved down');
			assert.ok(hasGoneBackUp, 'object has gone back up');
		});
	});
}
