import {Mesh, MeshBasicMaterial, BoxGeometry, Vector3} from 'three';
import {CoreWFCTileAttribute} from './WFCAttributes';
import {EMPTY_TILE_ID} from './WFCCommon';
import {BoxLinesSopOperation} from '../../engine/operations/sop/BoxLines';

const sizes = new Vector3(1, 1, 1);
const divisions = new Vector3(1, 1, 1);
const center = new Vector3(0, 0, 0);
function createEmptyTileObject() {
	// const geometry = new BoxGeometry(0.95, 0.95, 0.95);
	// // geometry.translate(0.5,0.5,0.5)
	// const material = new MeshBasicMaterial({color: 0xffffff});
	// const mesh = new Mesh(geometry, material);
	const object = BoxLinesSopOperation.createLines({
		size: 0.95,
		sizes,
		divisions,
		center,
	});

	CoreWFCTileAttribute.setIsTile(object, true);
	CoreWFCTileAttribute.setTileId(object, EMPTY_TILE_ID);
	return object;
}
function createErrorTileObject() {
	const geometry = new BoxGeometry(0.95, 0.95, 0.95);
	// geometry.translate(0.5,0.5,0.5)
	const material = new MeshBasicMaterial({color: 0xff0000});
	const mesh = new Mesh(geometry, material);
	// CoreWFCTileAttribute.setIsTile(mesh, true);
	CoreWFCTileAttribute.setTileId(mesh, EMPTY_TILE_ID);
	return mesh;
}
export const EMPTY_TILE_OBJECT = createEmptyTileObject();
export const ERROR_TILE_OBJECT = createErrorTileObject();
