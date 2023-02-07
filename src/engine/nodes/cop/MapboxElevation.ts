/**
 * Imports a mapbox tile.
 *
 * @remarks
 * Note that this node requires a mapbox account.
 */

import {DataTexture, LinearFilter, RGBAFormat, FloatType} from 'three';
import {TypedCopNode} from './_Base';
import {CoreMapboxUtils} from '../../../core/thirdParty/Mapbox/Utils';
import {CoreImage} from '../../../core/Image';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {MAPBOX_TOKEN_MISSING_ERROR_MESSAGE} from '../../poly/thirdParty/Mapbox';
import {isBooleanTrue} from '../../../core/Type';
import {MAPBOX_TILES_ROOT_URL} from '../../../core/thirdParty/Mapbox/MapboxTile';

const M1 = 256;
const M2 = M1 * M1;
const M2_INVERTED = 1 / M2;

class MapboxElevationCopParamsConfig extends NodeParamsConfig {
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
	/** @param source range */
	sourceRange = ParamConfig.VECTOR2([0, 0], {
		cook: false,
		editable: false,
	});
	/** @param updateRange */
	updateRange = ParamConfig.BOOLEAN(0);
	/** @param min */
	min = ParamConfig.FLOAT(0, {
		visibleIf: {updateRange: true},
		range: [-10, 10],
	});
	/** @param mult */
	mult = ParamConfig.FLOAT(1, {
		visibleIf: {updateRange: true},
		range: [-10, 10],
	});
}

const ParamsConfig = new MapboxElevationCopParamsConfig();

export class MapboxElevationCopNode extends TypedCopNode<MapboxElevationCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'mapboxElevation';
	}

	override async cook() {
		const token = await Poly.thirdParty.mapbox().token();
		if (!token) {
			this.states.error.set(MAPBOX_TOKEN_MISSING_ERROR_MESSAGE);
			return;
		}

		const texture = await this._cookForElevation(token);
		if (texture) {
			// not sure why .needsUpdate is required
			// since the textures are new on every cook,
			// but it is!
			texture.needsUpdate = true;
			this.setTexture(texture);
		}
	}

	private async _cookForElevation(token: string) {
		const url = await this._url('mapbox.terrain-rgb', token);
		const image_data_rgba = await CoreImage.data_from_url(url);
		if (!image_data_rgba) {
			this.states.error.set('invalid image');
			return;
		}
		const data_rgba = image_data_rgba.data;
		const pixelsCount = image_data_rgba.width * image_data_rgba.height;
		const bufferSize = 4 * pixelsCount;
		const texture = this._createTexture(image_data_rgba.width, image_data_rgba.height);
		const dest_data = texture.image.data;
		let elevation: number, R: number, G: number, B: number;
		const elevations: number[] = new Array(pixelsCount);
		let pixelIndex = 0;
		for (let i = 0; i < bufferSize; i += 4) {
			R = data_rgba[i + 0];
			G = data_rgba[i + 1];
			B = data_rgba[i + 2];
			elevation = /*-10000 +*/ (R * M2 + G * M1 + B) * M2_INVERTED;
			dest_data[i + 0] = elevation;
			dest_data[i + 1] = elevation;
			dest_data[i + 2] = elevation;
			elevations[pixelIndex] = elevation;
			pixelIndex++;
		}
		const sortedElevations = elevations.sort((a, b) => (a > b ? 1 : -1));
		const sourceMin = sortedElevations[0];
		const sourceMax = sortedElevations[sortedElevations.length - 1];
		this.p.sourceRange.set([sourceMin, sourceMax]);

		if (isBooleanTrue(this.pv.updateRange)) {
			const minElevation = this.pv.min;
			const mult = this.pv.mult;
			for (let i = 0; i < bufferSize; i += 4) {
				const currentElevation = dest_data[i + 0];
				const newElevation = (currentElevation - sourceMin) * mult + minElevation;
				dest_data[i + 0] = newElevation;
				dest_data[i + 1] = newElevation;
				dest_data[i + 2] = newElevation;
			}
		}

		// }
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
		const texture = new DataTexture(new Float32Array(4 * width * height), width, height, RGBAFormat, FloatType);
		texture.image.data.fill(1);
		texture.minFilter = LinearFilter;
		texture.magFilter = LinearFilter;
		texture.flipY = true; // necessary otherwise the texture is misplaced
		return texture;
	}
}
