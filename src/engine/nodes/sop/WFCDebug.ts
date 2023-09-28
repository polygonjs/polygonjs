/**
 * debugs the WFC tiles connections
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {WFCTilesCollection} from '../../../core/wfc/WFCTilesCollection';
import {stringMatchMask} from '../../../core/String';
import {CoreWFCTileAttribute} from '../../../core/wfc/WFCAttributes';
import {Object3D, Group} from 'three';
import {ALL_HORIZONTAL_SIDES, CLOCK_WISE_TILE_SIDES, EMPTY_TILE_ID} from '../../../core/wfc/WFCCommon';

class WFCDebugSopParamsConfig extends NodeParamsConfig {
	/** @param src tile id */
	srcTileId = ParamConfig.STRING('*');
	/** @param dest tile id */
	destTileId = ParamConfig.STRING('*');
}
const ParamsConfig = new WFCDebugSopParamsConfig();

export class WFCDebugSopNode extends TypedSopNode<WFCDebugSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.WFC_DEBUG;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const tileAndRuleObjects = coreGroup.threejsObjects();
		const collection = new WFCTilesCollection({tileAndRuleObjects});

		const {srcTileId, destTileId} = this.pv;
		const srcTiles = collection
			.tiles()
			.filter((tileObject) => stringMatchMask(CoreWFCTileAttribute.getTileId(tileObject), srcTileId));
		const destTiles = collection
			.tiles()
			.filter((tileObject) => stringMatchMask(CoreWFCTileAttribute.getTileId(tileObject), destTileId));

		const newObjects: Object3D[] = [];
		const visited: Set<string> = new Set();
		let i = 0;
		for (const srcTile of srcTiles) {
			const srcTileId = CoreWFCTileAttribute.getTileId(srcTile);
			let j = 0;
			for (const destTile of destTiles) {
				const destTileId = CoreWFCTileAttribute.getTileId(destTile);
				// let k=0;
				collection.traverseRules(srcTileId, destTileId, (id0, id1, side0, side1) => {
					side0 = id0 == EMPTY_TILE_ID && ALL_HORIZONTAL_SIDES.includes(side0) ? ALL_HORIZONTAL_SIDES : side0;
					side1 = id1 == EMPTY_TILE_ID && ALL_HORIZONTAL_SIDES.includes(side1) ? ALL_HORIZONTAL_SIDES : side1;
					const id = `${id0}:${side0}-${id1}:${side1}`;
					if (visited.has(id)) {
						return;
					}
					let inverted = id0 != srcTileId;
					visited.add(id);

					const group = new Group();
					newObjects.push(group);
					group.matrixAutoUpdate = false;
					// _p.z = 2 * i;
					group.position.x = 3 * i;
					group.position.z = 2 * j;
					group.updateMatrix();
					group.name = `src:${srcTileId} dest:${destTileId} side0:${side0} side1:${side1}`;
					const srcTileClone = inverted ? destTile.clone() : srcTile.clone();
					const destTileClone = inverted ? srcTile.clone() : destTile.clone();
					group.add(srcTileClone);
					group.add(destTileClone);

					const srcTileRotation = CLOCK_WISE_TILE_SIDES.indexOf(side0);
					const destTileRotation = CLOCK_WISE_TILE_SIDES.indexOf(side1);
					// srcTileClone.position.x = -0.5;
					if (srcTileRotation >= 0) {
						srcTileClone.rotation.y = (srcTileRotation * Math.PI) / 2;
					}
					switch (side1) {
						case 'b': {
							destTileClone.position.y = +1;
							// destTileClone.rotation.y = ((destTileRotation + 2) * Math.PI) / 2;
							break;
						}
						case 't': {
							destTileClone.position.y = -1;
							break;
						}
						default: {
							destTileClone.position.x = +1;
							destTileClone.rotation.y = ((destTileRotation + 2) * Math.PI) / 2;
						}
					}
					srcTileClone.updateMatrix();
					destTileClone.updateMatrix();
					j++;
				});
				// j++
			}
			i++;
		}

		this.setObjects(newObjects);
	}
}
