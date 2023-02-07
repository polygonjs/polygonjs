// /**
//  * Imports a mapbox tile.
//  *
//  * @remarks
//  * Note that this node requires a mapbox account.
//  */

// import {
// 	DataTexture,
// 	LinearFilter,
// 	RGBAFormat,
// 	// UnsignedByteType,
// 	// UnsignedIntType,
// 	FloatType,
// } from 'three';
// import {TypedCopNode} from './_Base';
// import {CoreMapboxUtils} from '../../../core/thirdParty/Mapbox/Utils';
// import {CoreImage} from '../../../core/Image';
// import {Poly} from '../../Poly';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {MAPBOX_TOKEN_MISSING_ERROR_MESSAGE} from '../../poly/thirdParty/Mapbox';
// import {isBooleanTrue} from '../../../core/Type';
// import {TypeAssert} from '../../poly/Assert';

// export enum TileType {
// 	ELEVATION = 'elevation',
// 	SATELLITE = 'satellite',
// }
// const TILE_TYPES = [TileType.ELEVATION, TileType.SATELLITE];

// // export enum TileRes {
// // 	LOW = 256,
// // 	HIGH = 512,
// // }

// const ROOT_URL = 'https://api.mapbox.com/v4';

// class MapboxTileCopParamsConfig extends NodeParamsConfig {
// 	/** @param type of tile (elevation or satellite) */
// 	type = ParamConfig.INTEGER(TILE_TYPES.indexOf(TileType.SATELLITE), {
// 		menu: {
// 			entries: TILE_TYPES.map((m) => ({
// 				name: m,
// 				value: TILE_TYPES.indexOf(m),
// 			})),
// 		},
// 	});

// 	/** @param longitude */
// 	longitude = ParamConfig.FLOAT(0, {
// 		range: [-360, 360],
// 	});
// 	/** @param latitude */
// 	latitude = ParamConfig.FLOAT(0, {
// 		range: [-180, 180],
// 	});
// 	/** @param zoom value */
// 	zoom = ParamConfig.INTEGER(12, {
// 		range: [1, 24],
// 		rangeLocked: [true, true],
// 	});
// 	/** @param highres */
// 	highres = ParamConfig.BOOLEAN(1);
// }

// const ParamsConfig = new MapboxTileCopParamsConfig();

// export class MapboxTileCopNode extends TypedCopNode<MapboxTileCopParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'mapboxTile';
// 	}

// 	override async cook() {
// 		const token = await Poly.thirdParty.mapbox().token();
// 		if (!token) {
// 			this.states.error.set(MAPBOX_TOKEN_MISSING_ERROR_MESSAGE);
// 			return;
// 		}

// 		const texture = await this._createAndFillTexture(token);
// 		if (texture) {
// 			// not sure why .needsUpdate is required
// 			// since the textures are new on every cook,
// 			// but it is!
// 			texture.needsUpdate = true;
// 			this.setTexture(texture);
// 		}
// 	}
// 	private async _createAndFillTexture(token: string) {
// 		const type = TILE_TYPES[this.pv.type];
// 		switch (type) {
// 			case TileType.ELEVATION: {
// 				return await this._cookForElevation(token);
// 			}
// 			case TileType.SATELLITE: {
// 				return await this._cookForSatellite(token);
// 				return;
// 			}
// 		}
// 		TypeAssert.unreachable(type);
// 	}

// 	private async _cookForElevation(token: string) {
// 		const url = await this._url('mapbox.terrain-rgb', token);
// 		const image_data_rgba = await CoreImage.data_from_url(url);
// 		if (!image_data_rgba) {
// 			this.states.error.set('invalid image');
// 			return;
// 		}
// 		const data_rgba = image_data_rgba.data;
// 		const bufferSize = 4 * image_data_rgba.width * image_data_rgba.height;
// 		const texture = this._createTexture(TileType.ELEVATION, image_data_rgba.width, image_data_rgba.height);
// 		const dest_data = texture.image.data;
// 		let elevation: number, R: number, G: number, B: number;
// 		for (let i = 0; i < bufferSize; i += 4) {
// 			R = data_rgba[i + 0];
// 			G = data_rgba[i + 1];
// 			B = data_rgba[i + 2];
// 			elevation = /*-10000 +*/ ((R * 256 * 256 + G * 256 + B) * 0.1) / (256 * 256);
// 			dest_data[i + 0] = elevation;
// 			dest_data[i + 1] = elevation;
// 			dest_data[i + 2] = elevation;
// 		}
// 		// }
// 		return texture;
// 	}
// 	private async _cookForSatellite(token: string) {
// 		const url = await this._url('mapbox.satellite', token);
// 		const image_data_rgba = await CoreImage.data_from_url(url);
// 		if (!image_data_rgba) {
// 			this.states.error.set('invalid image');
// 			return;
// 		}
// 		const w = image_data_rgba.width;
// 		const h = image_data_rgba.height;
// 		const texture = this._createTexture(TileType.SATELLITE, w, h);
// 		const data_rgba = image_data_rgba.data;
// 		const bufferSize = 4 * w * h;
// 		const dest_data = texture.image.data;
// 		for (let i = 0; i < bufferSize; i += 4) {
// 			dest_data[i + 0] = data_rgba[i + 0];
// 			dest_data[i + 1] = data_rgba[i + 1];
// 			dest_data[i + 2] = data_rgba[i + 2];
// 		}

// 		return texture;
// 	}

// 	private async _url(endpoint: string, token: string) {
// 		const tileNumber = CoreMapboxUtils.lnglatToTileNumber(this.pv.latitude, this.pv.longitude, this.pv.zoom);
// 		const x = tileNumber.x;
// 		const y = tileNumber.y;
// 		const z = this.pv.zoom;

// 		const res = isBooleanTrue(this.pv.highres) ? '@2x' : '';

// 		return `${ROOT_URL}/${endpoint}/${z}/${x}/${y}${res}.pngraw?access_token=${token}`;
// 	}

// 	private _createTexture(type: TileType, width: number, height: number) {
// 		const texture = this._createTextureForType(type, width, height);
// 		texture.minFilter = LinearFilter;
// 		texture.magFilter = LinearFilter;
// 		texture.flipY = true; // necessary otherwise the texture is misplaced
// 		return texture;
// 	}
// 	private _createTextureForType(type: TileType, width: number, height: number) {
// 		switch (type) {
// 			case TileType.ELEVATION: {
// 				return this._createTextureElevation(width, height);
// 			}
// 			case TileType.SATELLITE: {
// 				return this._createTextureSatellite(width, height);
// 			}
// 		}
// 		TypeAssert.unreachable(type);
// 	}
// 	private _createTextureSatellite(width: number, height: number) {
// 		const texture = new DataTexture(new Uint8Array(4 * width * height), width, height);
// 		texture.image.data.fill(255);
// 		return texture;
// 	}
// 	private _createTextureElevation(width: number, height: number) {
// 		const texture = new DataTexture(new Float32Array(4 * width * height), width, height, RGBAFormat, FloatType);
// 		texture.image.data.fill(1);
// 		return texture;
// 	}

// 	// private _convert_color(R:number,G:number,B:number,a:number){
// 	// 	return [R/255, G/255, B/255]
// 	// }
// }
