import {Mesh, MeshBasicMaterial, BoxGeometry, Vector3, Object3D} from 'three';
import {CoreWFCTileAttribute} from './WFCAttributes';
import {EMPTY_TILE_ID, ERROR_TILE_ID, UNRESOLVED_TILE_ID} from './WFCCommon';
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

export function createDefaultErrorTileObject() {
	const geometry = new BoxGeometry(0.95, 0.95, 0.95);
	const material = new MeshBasicMaterial({color: 0xff0000});
	const mesh = new Mesh(geometry, material);
	return mesh;
}
export function createDefaultUnresolvedTileObject() {
	const geometry = new BoxGeometry(0.95, 0.95, 0.95);
	const material = new MeshBasicMaterial({color: 0xff0000});
	const mesh = new Mesh(geometry, material);
	return mesh;
}
export function addEmptyTileObjectAttributes(object: Object3D) {
	CoreWFCTileAttribute.setTileId(object, EMPTY_TILE_ID);
	object.name = EMPTY_TILE_ID;
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
