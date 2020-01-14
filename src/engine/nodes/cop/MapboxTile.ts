// import {
// 	NearestFilter,
// 	LinearFilter,
// 	FloatType,
// 	RGBFormat,
// 	LuminanceFormat,
// 	UnsignedByteType,
// } from 'three/src/constants'
// import {DataTexture} from 'three/src/textures/DataTexture'
// const THREE = {
// 	DataTexture,
// 	NearestFilter,
// 	LinearFilter,
// 	FloatType,
// 	RGBFormat,
// 	LuminanceFormat,
// 	UnsignedByteType,
// }

// import {BaseNodeCop} from './_Base'
// import {ParamType} from 'src/Engine/Param/_Module'
// // import {CoreTextureLoader} from 'src/Core/Loader/Texture'

// import {CoreTextureLoader} from 'src/Core/Loader/Texture'
// import {CoreMapboxUtils} from 'src/Core/Mapbox/Utils'
// import {CoreImage} from 'src/Core/Image'
// import {CoreMapboxClient} from 'src/Core/Mapbox/Client'

// export enum TileType {
// 	ELEVATION = 'elevation',
// 	SATELLITE = 'satellite',
// }
// const TILE_TYPES = [
// 	TileType.ELEVATION,
// 	TileType.SATELLITE
// ]

// export enum TileRes {
// 	LOW = 256,
// 	HIGH = 512,
// }

// const ROOT_URL = 'https://api.mapbox.com/v4'

// export class MapboxTile extends BaseNodeCop {
// 	static type(){ return 'mapbox_tile' }

// 	private _texture_loader: CoreTextureLoader
// 	private _texture: THREE.DataTexture = new THREE.DataTexture(
// 		new Float32Array( 3 * TileRes.HIGH * TileRes.HIGH ),
// 		TileRes.HIGH,
// 		TileRes.HIGH,
// 		THREE.RGBFormat,
// 		THREE.FloatType
// 	)

// 	initialize_node(){

// 		this.set_inputs_count_to_zero()
// 		this._texture.image.data.fill(255)
// 		this._texture.minFilter = THREE.LinearFilter;
// 		this._texture.magFilter = THREE.LinearFilter;
// 		this._texture.flipY = true // necessary otherwise the texture is misplaced

// 	}

// 	create_params(){
// 		// TODO: add presets
// 		// london [-0.07956, 51.5146]
// 		// mt fuji 35.3547 138.725
// 		// el cap: -119.63, 37.7331199, zoom 13
// 		this.add_param(ParamType.VECTOR2, 'lng_lat', [-119.63, 37.73311])
// 		this.add_param(ParamType.INTEGER, 'zoom', 12, {
// 			range: [1, 24],
// 			range_locked: [true, true],
// 		})

// 		this.add_param(ParamType.INTEGER, 'type', 0, {
// 			menu: {
// 				type: 'radio',
// 				entries: TILE_TYPES.map(m=>({
// 					name: m,
// 					value: TILE_TYPES.indexOf(m)
// 				}))
// 			}
// 		})
// 		// this.add_param(ParamType.TOGGLE, 'hires', 1)
// 		this._param_hires = true
// 	}

// 	async cook(){
// 		this._texture_loader = this._texture_loader || new CoreTextureLoader(this)

// 		const type = TILE_TYPES[this._param_type]
// 		switch(type){
// 			case TileType.ELEVATION: {
// 				await this._cook_for_elevation();
// 				break;
// 			}
// 			case TileType.SATELLITE: {
// 				await this._cook_for_satellite();
// 				break;
// 			}
// 		}

// 		this._texture.needsUpdate = true;
// 		this.set_texture(this._texture)
// 	}

// 	private async _cook_for_elevation(){
// 		const url = await this._url('mapbox.terrain-rgb')

// 		const image_data_rgba = await CoreImage.data_from_url(url)
// 		const data_rgba = image_data_rgba.data
// 		const pixels_count = image_data_rgba.width * image_data_rgba.height
// 		let src_stride, dest_stride;
// 		const dest_data = this._texture.image.data
// 		if(this._param_hires){
// 			let elevation, R, G, B;
// 			for(let i=0; i<pixels_count; i++){
// 				src_stride = i * 4;
// 				dest_stride = i * 3;
// 				R = data_rgba[src_stride+0]
// 				G = data_rgba[src_stride+1]
// 				B = data_rgba[src_stride+2]
// 				elevation = /*-10000 +*/ ((R * 256 * 256 + G * 256 + B) * 0.1) / (256 * 256)

// 				dest_data[dest_stride+0] = elevation
// 				dest_data[dest_stride+1] = elevation
// 				dest_data[dest_stride+2] = elevation
// 			}
// 		}
// 	}
// 	private async _cook_for_satellite(){
// 		const url = await this._url('mapbox.satellite')
// 		console.log(url)
// 		const image_data_rgba = await CoreImage.data_from_url(url)
// 		const data_rgba = image_data_rgba.data
// 		const pixels_count = image_data_rgba.width * image_data_rgba.height
// 		let src_stride, dest_stride;
// 		const dest_data = this._texture.image.data
// 		if(this._param_hires){
// 			for(let i=0; i<pixels_count; i++){
// 				src_stride = i * 4;
// 				dest_stride = i * 3;
// 				dest_data[dest_stride+0] = data_rgba[src_stride+0] / 255
// 				dest_data[dest_stride+1] = data_rgba[src_stride+1] / 255
// 				dest_data[dest_stride+2] = data_rgba[src_stride+2] / 255
// 			}
// 		} else {
// 			// TODO: this isn't yet working
// 			const resolution = TileRes.LOW
// 			console.log("resolution", resolution)
// 			for(let i=0; i<resolution; i++){
// 				for(let j=0; j<resolution; j++){
// 					let k = i*resolution + j
// 					src_stride = k * 4;

// 					dest_stride = k * 3;
// 					dest_data[dest_stride+0] = data_rgba[src_stride+0] // / 255
// 					dest_data[dest_stride+1] = data_rgba[src_stride+1] // / 255
// 					dest_data[dest_stride+2] = data_rgba[src_stride+2] // / 255

// 					k = (i+1)*resolution + j
// 					dest_stride = k * 3;
// 					dest_data[dest_stride+0] = data_rgba[src_stride+0] // / 255
// 					dest_data[dest_stride+1] = data_rgba[src_stride+1] // / 255
// 					dest_data[dest_stride+2] = data_rgba[src_stride+2] // / 255

// 					k = i*resolution + (j+1)
// 					dest_stride = k * 3;
// 					dest_data[dest_stride+0] = data_rgba[src_stride+0] // / 255
// 					dest_data[dest_stride+1] = data_rgba[src_stride+1] // / 255
// 					dest_data[dest_stride+2] = data_rgba[src_stride+2] // / 255

// 					k = (i+1)*resolution + (j+1)
// 					dest_stride = k * 3;
// 					dest_data[dest_stride+0] = data_rgba[src_stride+0] // / 255
// 					dest_data[dest_stride+1] = data_rgba[src_stride+1] // / 255
// 					dest_data[dest_stride+2] = data_rgba[src_stride+2] // / 255
// 				}
// 			}
// 		}
// 	}

// 	private async _url(endpoint:string){

// 		const tile_number = CoreMapboxUtils.lnglat_to_tile_number(
// 			this._param_lng_lat.x,
// 			this._param_lng_lat.y,
// 			this._param_zoom
// 		)
// 		const x = tile_number.x
// 		const y = tile_number.y
// 		const z = this._param_zoom

// 		const res = this._param_hires ? '@2x' : ''

// 		const token = await CoreMapboxClient.token(this.scene());
// 		return `${ROOT_URL}/${endpoint}/${z}/${x}/${y}${res}.pngraw?access_token=${token}`
// 	}

// 	private _convert_color(R,G,B,a){
// 		return [R/255, G/255, B/255]
// 	}
// }
