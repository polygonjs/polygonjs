import type {QUnit} from '../../../helpers/QUnit';
import {RendererUtils} from '../../../helpers/RendererUtils';
import type {WFCSolverSopNode} from '../../../../src/engine/nodes/sop/WFCSolver';
import type {GeoObjNode} from '../../../../src/engine/nodes/obj/Geo';
import type {MeshStandardMatNode} from '../../../../src/engine/nodes/mat/MeshStandard';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {HierarchyMode} from '../../../../src/engine/operations/sop/Hierarchy';
import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {WFCTileSide} from '../../../../src/core/wfc/WFCCommon';
import {WFCQuadAttribute} from '../../../../src/core/wfc/WFCAttributes';
import {CoreObjectType, ObjectContent} from '../../../../src/core/geometry/ObjectContent';
// import {CoreSleep} from '../../../../src/core/Sleep';

enum TileName {
	STRAIGHT = 'tile_straight',
	TURN_90 = 'tile_turn_90',
	CROSS = 'tile_cross',
	T = 'tile_t',
	SLOPE_FULL_TOP = 'tile_slope_full_top',
	SLOPE_FULL_BOTTOM = 'tile_slope_full_bottom',
}
const TILE_NAMES: TileName[] = [
	TileName.STRAIGHT,
	TileName.TURN_90,
	TileName.CROSS,
	TileName.T,
	TileName.SLOPE_FULL_TOP,
	TileName.SLOPE_FULL_BOTTOM,
];
enum SideName {
	DEFAULT = 'default',
	EMPTY = 'empty',
	SLOPE_FULL = 'slope_full',
}
type SideNameByTileSide = Record<WFCTileSide, SideName>;

const SIDE_NAMES_BY_TILE_NAME: Record<TileName, SideNameByTileSide> = {
	[TileName.STRAIGHT]: {
		s: SideName.EMPTY,
		n: SideName.EMPTY,
		w: SideName.DEFAULT,
		e: SideName.DEFAULT,
		b: SideName.EMPTY,
		t: SideName.EMPTY,
		snwe: SideName.EMPTY,
	},
	[TileName.TURN_90]: {
		s: SideName.DEFAULT,
		n: SideName.EMPTY,
		w: SideName.DEFAULT,
		e: SideName.EMPTY,
		b: SideName.EMPTY,
		t: SideName.EMPTY,
		snwe: SideName.EMPTY,
	},
	[TileName.CROSS]: {
		s: SideName.DEFAULT,
		n: SideName.DEFAULT,
		w: SideName.DEFAULT,
		e: SideName.DEFAULT,
		b: SideName.EMPTY,
		t: SideName.EMPTY,
		snwe: SideName.EMPTY,
	},
	[TileName.T]: {
		s: SideName.DEFAULT,
		n: SideName.EMPTY,
		w: SideName.DEFAULT,
		e: SideName.DEFAULT,
		b: SideName.EMPTY,
		t: SideName.EMPTY,
		snwe: SideName.EMPTY,
	},
	[TileName.SLOPE_FULL_TOP]: {
		s: SideName.EMPTY,
		n: SideName.EMPTY,
		w: SideName.DEFAULT,
		e: SideName.EMPTY,
		b: SideName.SLOPE_FULL,
		t: SideName.EMPTY,
		snwe: SideName.EMPTY,
	},
	[TileName.SLOPE_FULL_BOTTOM]: {
		s: SideName.EMPTY,
		n: SideName.EMPTY,
		w: SideName.EMPTY,
		e: SideName.DEFAULT,
		b: SideName.EMPTY,
		t: SideName.SLOPE_FULL,
		snwe: SideName.EMPTY,
	},
};
type SideNameSopParamName = 'south' | 'north' | 'west' | 'east' | 'bottom' | 'top';
type SideNameSopParam = Record<WFCTileSide, SideNameSopParamName>;
const PARAM_NAME_BY_SIDE: SideNameSopParam = {
	s: 'south',
	n: 'north',
	w: 'west',
	e: 'east',
	b: 'bottom',
	t: 'top',
	snwe: 'top',
};

export function testenginenodessopWFCSolver(qUnit: QUnit) {
	function createTileNode(tileName: TileName, geo1: GeoObjNode, meshStandard1: MeshStandardMatNode) {
		const file1 = geo1.createNode('fileGLTF');
		const hierarchy1 = geo1.createNode('hierarchy');
		const material1 = geo1.createNode('material');
		const objectProperties1 = geo1.createNode('objectProperties');
		file1.p.url.set(`${ASSETS_ROOT}/models/tiles/basic/${tileName}.glb`);

		hierarchy1.setInput(0, file1);
		material1.setInput(0, hierarchy1);
		objectProperties1.setInput(0, material1);

		hierarchy1.setMode(HierarchyMode.REMOVE_PARENT);
		material1.p.material.setNode(meshStandard1);
		objectProperties1.p.tname.set(1);
		objectProperties1.p.name.set(tileName);

		const sideNames: SideName[] = [];
		const sideNamesByTileSide = SIDE_NAMES_BY_TILE_NAME[tileName];
		const sides: WFCTileSide[] = ['s', 'n', 'w', 'e', 'b', 't'];
		for (const side of sides) {
			const sideName = sideNamesByTileSide[side];
			if (sideName) {
				sideNames.push(sideName);
			}
		}
		let prevNode: BaseSopNodeType = objectProperties1;
		for (const sideName of sideNames) {
			const WFCTileSideName = geo1.createNode('WFCTileSideName');

			for (const side of sides) {
				const _sideName = sideNamesByTileSide[side];
				if (_sideName == sideName) {
					const paramName = PARAM_NAME_BY_SIDE[side];
					WFCTileSideName.p[paramName].set(1);
					WFCTileSideName.p.sideName.set(sideName);
				}
			}

			WFCTileSideName.setInput(0, prevNode);
			prevNode = WFCTileSideName;
		}
		return {prevNode};
	}

	function createTileNodes(WFCSolver: WFCSolverSopNode) {
		const geo1 = WFCSolver.parent() as GeoObjNode;

		const MAT = window.MAT;
		const meshStandard1 = MAT.createNode('meshStandard');
		meshStandard1.p.useVertexColors.set(1);

		const merge1 = geo1.createNode('merge');
		merge1.p.inputsCount.set(TILE_NAMES.length);

		let i = 0;
		for (const tileName of TILE_NAMES) {
			const {prevNode} = createTileNode(tileName, geo1, meshStandard1);
			merge1.setInput(i, prevNode);
			i++;
		}

		const WFCTileProperties1 = geo1.createNode('WFCTileProperties');
		WFCTileProperties1.p.id.set('`@objname`');

		const WFCTileEmptyObject1 = geo1.createNode('WFCTileEmptyObject');
		const merge2 = geo1.createNode('merge');

		const WFCRuleConnectionFromSideName1 = geo1.createNode('WFCRuleConnectionFromSideName');
		WFCRuleConnectionFromSideName1.setInput(0, merge2);
		WFCRuleConnectionFromSideName1.p.srcTileId.set('*');
		WFCRuleConnectionFromSideName1.p.destTileId.set('*');
		WFCRuleConnectionFromSideName1.p.sideName.set('*');

		const WFCRuleConnectionToGridBorder1 = geo1.createNode('WFCRuleConnectionToGridBorder');
		WFCRuleConnectionToGridBorder1.p.tileId.set('*');
		WFCRuleConnectionToGridBorder1.p.sideName.set(SideName.EMPTY);

		WFCTileProperties1.setInput(0, merge1);
		merge2.setInput(0, WFCTileProperties1);
		merge2.setInput(1, WFCTileEmptyObject1);
		WFCRuleConnectionFromSideName1.setInput(0, merge2);
		WFCRuleConnectionToGridBorder1.setInput(0, WFCRuleConnectionFromSideName1);

		return {WFCRuleConnectionToGridBorder1};
	}
	function createQuadNodes(WFCSolver: WFCSolverSopNode) {
		const geo1 = WFCSolver.parent() as GeoObjNode;

		const quadPlane1 = geo1.createNode('quadPlane');
		quadPlane1.p.size.set([2, 2]);

		const attribCreate1 = geo1.createNode('attribCreate');
		attribCreate1.setAttribClass(AttribClass.PRIMITIVE);
		attribCreate1.p.name.set(WFCQuadAttribute.QUAD_ID);
		attribCreate1.p.value1.set('@primnum');

		const copy1 = geo1.createNode('copy');

		const attribCreate2 = geo1.createNode('attribCreate');
		attribCreate2.setAttribClass(AttribClass.OBJECT);
		attribCreate2.p.name.set(WFCQuadAttribute.FLOOR_INDEX);
		attribCreate2.p.value1.set('@objnum');

		const attribPromote1 = geo1.createNode('attribPromote');
		attribPromote1.setAttribClassFrom(AttribClass.OBJECT);
		attribPromote1.setAttribClassTo(AttribClass.PRIMITIVE);
		attribPromote1.p.name.set(WFCQuadAttribute.FLOOR_INDEX);

		const merge1 = geo1.createNode('merge');
		merge1.setCompactMode(true);

		attribCreate1.setInput(0, quadPlane1);
		copy1.setInput(0, attribCreate1);
		attribCreate2.setInput(0, copy1);
		attribPromote1.setInput(0, attribCreate2);
		merge1.setInput(0, attribPromote1);

		return {merge1, attribPromote1, attribCreate2, copy1, attribCreate1, quadPlane1};
	}

	qUnit.test('sop/WFCSolver ', async (assert) => {
		const perspective_camera1 = window.perspective_camera1;
		perspective_camera1.p.t.z.set(5);

		await window.scene.waitForCooksCompleted();

		const geo1 = window.geo1;
		const WFCSolver1 = geo1.createNode('WFCSolver');
		const quadNodes = createQuadNodes(WFCSolver1);
		const {WFCRuleConnectionToGridBorder1} = createTileNodes(WFCSolver1);
		WFCSolver1.setInput(0, quadNodes.merge1);
		WFCSolver1.setInput(1, WFCRuleConnectionToGridBorder1);

		const WFCBuilder1 = geo1.createNode('WFCBuilder');
		WFCBuilder1.setInput(0, WFCSolver1);
		WFCBuilder1.setInput(1, WFCRuleConnectionToGridBorder1);
		WFCBuilder1.flags.display.set(true);

		// const box1 = geo1.createNode('box');
		// box1.flags.display.set(true);

		async function compute() {
			const container = await WFCBuilder1.compute();
			const objects = container.coreContent()?.allObjects();
			const objectNames = objects?.map((o: ObjectContent<CoreObjectType>) => o.name);
			return {objectNames};
		}
		await compute();

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			//
			// check we have warnings in case quad attributes not present
			//
			quadNodes.attribPromote1.flags.bypass.set(true);

			await compute();
			assert.equal(
				WFCSolver1.states.error.message(),
				"node internal error: 'attrib floorIndex not found. availables are: quadId'.",
				'error if floorIndex not present'
			);
			await window.scene.waitForCooksCompleted();
			quadNodes.attribPromote1.flags.bypass.set(false);
			await compute();
			assert.notOk(WFCSolver1.states.error.message(), 'no WFCSolver1 error');
			assert.notOk(WFCBuilder1.states.error.message(), 'no WFCBuilder1 error');

			await window.scene.waitForCooksCompleted();
			quadNodes.attribCreate1.flags.bypass.set(true);
			await compute();
			assert.equal(
				WFCSolver1.states.error.message(),
				"node internal error: 'attrib quadId not found. availables are: floorIndex,solvedTileConfigs'.",
				'error if quadId not present'
			);

			await window.scene.waitForCooksCompleted();
			quadNodes.attribCreate1.flags.bypass.set(false);
			await window.scene.waitForCooksCompleted();
			assert.notOk(WFCSolver1.states.error.message(), 'no WFCSolver1 error');
			assert.notOk(WFCBuilder1.states.error.message(), 'no WFCBuilder1 error');

			assert.deepEqual(
				(await compute()).objectNames,
				['tile_turn_90', 'tile_turn_90', 'tile_turn_90', 'tile_turn_90'],
				'2x2'
			);

			// test on a larger quad
			quadNodes.quadPlane1.p.size.set([3, 3]);
			assert.deepEqual(
				(await compute()).objectNames,
				[
					'tile_turn_90',
					'tile_straight',
					'tile_turn_90',
					'tile_t',
					'tile_turn_90',
					'tile_straight',
					'tile_turn_90',
					'tile_t',
					'tile_turn_90',
				],
				'3x3'
			);
			assert.notOk(WFCBuilder1.states.error.message(), 'no WFCBuilder1 error');
			quadNodes.quadPlane1.p.size.set([4, 4]);
			assert.deepEqual(
				(await compute()).objectNames,
				[
					'tile_turn_90',
					'tile_straight',
					'tile_t',
					'tile_turn_90',
					'tile_straight',
					'tile_turn_90',
					'tile_turn_90',
					'tile_straight',
					'tile_straight',
					'tile_t',
					'tile_turn_90',
					'tile_straight',
					'tile_turn_90',
					'tile_turn_90',
					'tile_turn_90',
					'tile_turn_90',
				],
				'4x4'
			);

			// try with multiple floors
			quadNodes.copy1.p.count.set(2);
			await window.scene.waitForCooksCompleted();
			assert.deepEqual(
				(await compute()).objectNames,
				[
					'tile_turn_90',
					'tile_t',
					'tile_straight',
					'tile_turn_90',
					'tile_straight',
					'tile_slope_full_bottom',
					'tile_turn_90',
					'tile_t',
					'tile_t',
					'tile_straight',
					'tile_turn_90',
					'tile_straight',
					'tile_turn_90',
					'tile_straight',
					'tile_straight',
					'tile_turn_90',
					'tile_turn_90',
					'tile_straight',
					'tile_t',
					'tile_turn_90',
					'tile_straight',
					'tile_slope_full_top',
					'tile_straight',
					'tile_straight',
					'tile_straight',
					'tile_turn_90',
					'tile_turn_90',
					'tile_straight',
					'tile_turn_90',
					'tile_straight',
					'tile_straight',
					'tile_turn_90',
				],
				'4x4x2'
			);
		});
	});
}
