import {Mesh, MeshBasicMaterial, BoxGeometry} from 'three';
import {CoreWFCTileAttribute} from './WFCAttributes';
import {EMPTY_TILE_ID} from './WFCCommon';
export function createEmptyTileObject() {
	const geometry = new BoxGeometry(0.95, 0.95, 0.95);
	// geometry.translate(0.5,0.5,0.5)
	const material = new MeshBasicMaterial({color: 0xffffff});
	const mesh = new Mesh(geometry, material);
	CoreWFCTileAttribute.setTileId(mesh, EMPTY_TILE_ID);
	return mesh;
}
function createErrorTileObject() {
	const geometry = new BoxGeometry(0.95, 0.95, 0.95);
	// geometry.translate(0.5,0.5,0.5)
	const material = new MeshBasicMaterial({color: 0xff0000});
	const mesh = new Mesh(geometry, material);
	CoreWFCTileAttribute.setTileId(mesh, EMPTY_TILE_ID);
	return mesh;
}
export const ERROR_TILE_OBJECT = createErrorTileObject();
