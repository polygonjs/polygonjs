/**
 * Imports a mapbox satellite tile.
 *
 * @remarks
 * Note that this node requires a mapbox account.
 */

import {DataTexture, LinearFilter} from 'three';
import {TypedCopNode} from './_Base';
import {CoreMapboxUtils} from '../../../core/thirdParty/Mapbox/Utils';
import {CoreImage} from '../../../core/Image';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {MAPBOX_TOKEN_MISSING_ERROR_MESSAGE} from '../../poly/thirdParty/Mapbox';
import {isBooleanTrue} from '../../../core/Type';
import {MAPBOX_TILES_ROOT_URL} from '../../../core/thirdParty/Mapbox/MapboxTile';

class MapboxSatelliteCopParamsConfig extends NodeParamsConfig {
	/** @param longitude */
	longitude = ParamConfig.FLOAT(0, {
		range: [-180, 180],
	});
	/** @param latitude */
	latitude = ParamConfig.FLOAT(0, {
		range: [-90, 90],
	});
	/** @param zoom value */
	zoom = ParamConfig.INTEGER(12, {
		range: [1, 24],
		rangeLocked: [true, true],
	});
	/** @param highres */
	highres = ParamConfig.BOOLEAN(1);
}

const ParamsConfig = new MapboxSatelliteCopParamsConfig();

export class MapboxSatelliteCopNode extends TypedCopNode<MapboxSatelliteCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'mapboxSatellite';
	}

	override async cook() {
		const token = await Poly.thirdParty.mapbox().token();
		if (!token) {
			this.states.error.set(MAPBOX_TOKEN_MISSING_ERROR_MESSAGE);
			return;
		}

		const texture = await this._cookForSatellite(token);
		if (texture) {
			// not sure why .needsUpdate is required
			// since the textures are new on every cook,
			// but it is!
			texture.needsUpdate = true;
			this.setTexture(texture);
		}
	}

	private async _cookForSatellite(token: string) {
		const url = await this._url('mapbox.satellite', token);
		const image_data_rgba = await CoreImage.data_from_url(url);
		if (!image_data_rgba) {
			this.states.error.set('invalid image');
			return;
		}
		const w = image_data_rgba.width;
		const h = image_data_rgba.height;
		const texture = this._createTexture(w, h);
		const data_rgba = image_data_rgba.data;
		const bufferSize = 4 * w * h;
		const dest_data = texture.image.data;
		for (let i = 0; i < bufferSize; i += 4) {
			dest_data[i + 0] = data_rgba[i + 0];
			dest_data[i + 1] = data_rgba[i + 1];
			dest_data[i + 2] = data_rgba[i + 2];
		}

		return texture;
	}

	private async _url(endpoint: string, token: string) {
		const tileNumber = CoreMapboxUtils.lnglatToTileNumber(this.pv.latitude, this.pv.longitude, this.pv.zoom);
		const x = tileNumber.x;
		const y = tileNumber.y;
		const z = this.pv.zoom;

		const res = isBooleanTrue(this.pv.highres) ? '@2x' : '';

		return `${MAPBOX_TILES_ROOT_URL}/${endpoint}/${z}/${x}/${y}${res}.pngraw?access_token=${token}`;
	}

	private _createTexture(width: number, height: number) {
		const texture = new DataTexture(new Uint8Array(4 * width * height), width, height);
		texture.image.data.fill(255);
		texture.minFilter = LinearFilter;
		texture.magFilter = LinearFilter;
		texture.flipY = true; // necessary otherwise the texture is misplaced
		return texture;
	}
}
