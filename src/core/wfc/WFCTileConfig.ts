import {NeighbourIndex} from '../graph/quad/QuadGraphCommon';
import {ERROR_TILE_ID, UNRESOLVED_TILE_ID} from './WFCConstant';
export type TileRotation = NeighbourIndex;
export interface TileConfig {
	tileId: string;
	rotation: TileRotation;
}
export const UNRESOLVED_TILE_CONFIG: TileConfig = {tileId: UNRESOLVED_TILE_ID, rotation: 0};
export const ERRORED_TILE_CONFIG: TileConfig = {tileId: ERROR_TILE_ID, rotation: 0};

const TILE_CONFIG_ELEMENT_SEPARATOR = ':';
const TILE_CONFIGS_SEPARATOR = ',';
export function tileConfigToString(tileConfig: TileConfig): string {
	return `${tileConfig.tileId}${TILE_CONFIG_ELEMENT_SEPARATOR}${tileConfig.rotation}`;
}
export function tileConfigsToString(tileConfigs: TileConfig[]): string {
	return tileConfigs.map(tileConfigToString).join(TILE_CONFIGS_SEPARATOR);
}
export function stringToTileConfigs(tileConfigsString: string): TileConfig[] {
	const tileConfigElements = tileConfigsString.split(TILE_CONFIGS_SEPARATOR);
	return tileConfigElements.map((tileConfigString) => {
		const tileConfigElements = tileConfigString.split(TILE_CONFIG_ELEMENT_SEPARATOR);
		return {
			tileId: tileConfigElements[0],
			rotation: parseInt(tileConfigElements[1]) as TileRotation,
		};
	});
}
