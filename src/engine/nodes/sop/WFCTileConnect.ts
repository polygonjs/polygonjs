/**
 * connects WFC tiles
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Object3D, Group} from 'three';
import {WFCTileSide, rotateSide} from '../../../core/wfc/WFCCommon';
import {CoreWFCConnectionAttribute, CoreWFCTileAttribute} from '../../../core/wfc/WFCAttributes';

class WFCTileConnectSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new WFCTileConnectSopParamsConfig();

export class WFCTileConnectSopNode extends TypedSopNode<WFCTileConnectSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_TILE_CONNECT;
	}

	override initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const coreGroup1 = inputCoreGroups[1];
		const inputObjects = coreGroup0.allObjects();
		const templateObjects = coreGroup1.threejsObjects();

		console.log(inputObjects, templateObjects);
		const templateObjectsInGrid: Object3D[][][] = []; // x/y/z
		const _addTemplateObject = (templateObject: Object3D) => {
			const x = Math.round(templateObject.position.x);
			const y = Math.round(templateObject.position.y);
			const z = Math.round(templateObject.position.z);
			templateObjectsInGrid[x] = templateObjectsInGrid[x] || [];
			templateObjectsInGrid[x][y] = templateObjectsInGrid[x][y] || [];
			templateObjectsInGrid[x][y][z] = templateObject;
		};
		const _getTemplateObject = (x: number, y: number, z: number): Object3D | undefined => {
			x = Math.round(x);
			y = Math.round(y);
			z = Math.round(z);
			templateObjectsInGrid[x] = templateObjectsInGrid[x] || [];
			templateObjectsInGrid[x][y] = templateObjectsInGrid[x][y] || [];
			return templateObjectsInGrid[x][y][z];
		};
		const _addConnectionIfNeighbourFound = (
			currentObject: Object3D,
			xOffset: number,
			yOffset: number,
			zOffset: number
		) => {
			const x = Math.round(currentObject.position.x);
			const y = Math.round(currentObject.position.y);
			const z = Math.round(currentObject.position.z);
			const neighbour = _getTemplateObject(x + xOffset, y + yOffset, z + zOffset);
			if (!neighbour) {
				return;
			}
			console.log(
				'found neighbour',
				currentObject.name,
				neighbour.name,
				currentObject.rotation.y,
				neighbour.rotation.y
			);
			const id0 = CoreWFCTileAttribute.getTileId(currentObject);
			const id1 = CoreWFCTileAttribute.getTileId(neighbour);
			const currentObjectSideUnrotated: WFCTileSide =
				xOffset < 0
					? WFCTileSide.SOUTH
					: xOffset > 0
					? WFCTileSide.NORTH
					: zOffset < 0
					? WFCTileSide.WEST
					: zOffset > 0
					? WFCTileSide.EAST
					: yOffset < 0
					? WFCTileSide.BOTTOM
					: WFCTileSide.TOP;
			const currentObjectSide = rotateSide(
				currentObjectSideUnrotated,
				Math.round(currentObject.rotation.y / (Math.PI / 2))
			);
			const neighbourSideUnrotated: WFCTileSide =
				xOffset < 0
					? WFCTileSide.NORTH
					: xOffset > 0
					? WFCTileSide.SOUTH
					: zOffset < 0
					? WFCTileSide.EAST
					: zOffset > 0
					? WFCTileSide.WEST
					: yOffset < 0
					? WFCTileSide.TOP
					: WFCTileSide.BOTTOM;
			const neighbourSide = rotateSide(neighbourSideUnrotated, Math.round(neighbour.rotation.y / (Math.PI / 2)));
			const group = new Group();
			CoreWFCConnectionAttribute.setIsConnection(group, true);
			CoreWFCConnectionAttribute.setId0(group, id0);
			CoreWFCConnectionAttribute.setId1(group, id1);
			CoreWFCConnectionAttribute.setSide0(group, currentObjectSide);
			CoreWFCConnectionAttribute.setSide1(group, neighbourSide);
			inputObjects.push(group);
			// TODO: make sure to not add a connection twice?
			// or maybe we do need both sides (to be like half edges)
		};
		for (const templateObject of templateObjects) {
			const isTile = CoreWFCTileAttribute.getIsTile(templateObject);
			if (!isTile) {
				continue;
			}
			_addTemplateObject(templateObject);
		}
		for (const templateObject of templateObjects) {
			const isTile = CoreWFCTileAttribute.getIsTile(templateObject);
			if (!isTile) {
				continue;
			}
			_addConnectionIfNeighbourFound(templateObject, -1, 0, 0);
			_addConnectionIfNeighbourFound(templateObject, +1, 0, 0);
			_addConnectionIfNeighbourFound(templateObject, 0, -1, 0);
			_addConnectionIfNeighbourFound(templateObject, 0, +1, 0);
			_addConnectionIfNeighbourFound(templateObject, 0, 0, -1);
			_addConnectionIfNeighbourFound(templateObject, 0, 0, +1);
		}

		this.setObjects(inputObjects);
	}
}
