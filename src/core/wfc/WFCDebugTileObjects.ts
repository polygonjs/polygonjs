import {Mesh, MeshBasicMaterial, BoxGeometry, Vector3, Object3D} from 'three';
import {CoreWFCTileAttribute} from './WFCAttributes';
import {EMPTY_SIDE_NAME, EMPTY_TILE_ID, ERROR_TILE_ID, UNRESOLVED_TILE_ID} from './WFCConstant';
import {BoxLinesSopOperation} from '../../engine/operations/sop/BoxLines';

const sizes = new Vector3(1, 1, 1);
const divisions = new Vector3(1, 1, 1);
const center = new Vector3(0, 0, 0);
export function createDefaultEmptyTileObject() {
	const object = BoxLinesSopOperation.createLines({
		size: 0.95,
		sizes,
		divisions,
		center,
	});

	return object;
}

const SCALE = 0.8;
export function createDefaultErrorTileObject() {
	const geometry = new BoxGeometry(SCALE, SCALE, SCALE);
	const material = new MeshBasicMaterial({color: 0xff0000});
	const mesh = new Mesh(geometry, material);
	return mesh;
}
export function createDefaultUnresolvedTileObject() {
	const geometry = new BoxGeometry(SCALE, SCALE, SCALE);
	const material = new MeshBasicMaterial({color: 0xff00ff});
	const mesh = new Mesh(geometry, material);
	return mesh;
}
export function addEmptyTileObjectAttributes(object: Object3D) {
	CoreWFCTileAttribute.setTileId(object, EMPTY_TILE_ID);
	object.name = EMPTY_TILE_ID;
	CoreWFCTileAttribute.setSideName(object, 's', EMPTY_SIDE_NAME);
	CoreWFCTileAttribute.setSideName(object, 'n', EMPTY_SIDE_NAME);
	CoreWFCTileAttribute.setSideName(object, 'w', EMPTY_SIDE_NAME);
	CoreWFCTileAttribute.setSideName(object, 'e', EMPTY_SIDE_NAME);
	CoreWFCTileAttribute.setSideName(object, 'b', EMPTY_SIDE_NAME);
	CoreWFCTileAttribute.setSideName(object, 't', EMPTY_SIDE_NAME);

	return object;
}
export function addErrorTileObjectAttributes(object: Object3D) {
	CoreWFCTileAttribute.setIsErrorTile(object, true);
	object.name = ERROR_TILE_ID;
	return object;
}
export function addUnresolvedTileObjectAttributes(object: Object3D) {
	CoreWFCTileAttribute.setIsUnresolvedTile(object, true);
	object.name = UNRESOLVED_TILE_ID;
	return object;
}
