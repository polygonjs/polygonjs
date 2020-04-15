import lodash_range from 'lodash/range';

// import {CoreFont} from '../../../Core/Font'
import {TypedSopNode} from './_Base';
import {ObjectType} from '../../../core/geometry/Constant';

import {TextBufferGeometry} from 'three/src/geometries/TextGeometry';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {ShapeBufferGeometry} from 'three/src/geometries/ShapeGeometry';
import {FontLoader} from 'three/src/loaders/FontLoader';
import {Font} from 'three/src/extras/core/Font';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {Vector3} from 'three/src/math/Vector3';
import {Path} from 'three/src/extras/core/Path';
import {Shape} from 'three/src/extras/core/Shape';

import {BufferGeometryUtils} from '../../../../modules/three/examples/jsm/utils/BufferGeometryUtils';

var opentype = require('opentype.js');

import {TTFLoader} from '../../../../modules/three/examples/jsm/loaders/TTFLoader';
import {SVGLoader} from '../../../../modules/three/examples/jsm/loaders/SVGLoader';

const DEFAULT_URL = '/fonts/droid_sans_regular.typeface.json';

declare global {
	interface Window {
		opentype: any;
	}
}

// const DEFAULT_PARAMS = {
// 	size: 1,
// 	height: 0.1,
// 	curveSegments: 1
// };

export enum TEXT_TYPE {
	MESH = 'mesh',
	FLAT = 'flat',
	LINE = 'line',
	STROKE = 'stroke',
}
export const TEXT_TYPES: Array<TEXT_TYPE> = [TEXT_TYPE.MESH, TEXT_TYPE.FLAT, TEXT_TYPE.LINE, TEXT_TYPE.STROKE];

interface FontByUrl {
	[propName: string]: Font;
}

const GENERATION_ERROR_MESSAGE = `failed to generate geometry. Try to remove some characters`;

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class TextSopParamsConfig extends NodeParamsConfig {
	font = ParamConfig.STRING('');
	text = ParamConfig.STRING('polygonjs', {multiline: true});
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: TEXT_TYPES.map((type, i) => {
				return {
					name: type,
					value: i,
				};
			}),
		},
	});
	size = ParamConfig.FLOAT(1, {
		range: [0, 1],
		range_locked: [true, false],
	});
	extrude = ParamConfig.FLOAT(0.1, {
		visible_if: {
			type: TEXT_TYPES.indexOf(TEXT_TYPE.MESH),
		},
	});
	segments = ParamConfig.INTEGER(1, {
		range: [1, 20],
		range_locked: [true, false],
		visible_if: {
			type: TEXT_TYPES.indexOf(TEXT_TYPE.MESH),
		},
	});
	stroke_width = ParamConfig.FLOAT(0.02, {
		visible_if: {
			type: TEXT_TYPES.indexOf(TEXT_TYPE.STROKE),
		},
	});
}

const ParamsConfig = new TextSopParamsConfig();

export class TextSopNode extends TypedSopNode<TextSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'text';
	}
	// static required_three_imports() {
	// 	return ['loaders/TTFLoader', 'loaders/SVGLoader'];
	// }

	private _font_loader: FontLoader = new FontLoader();
	private _ttf_loader: TTFLoader | undefined;
	private _svg_loader: typeof SVGLoader | undefined;
	private _loaded_fonts: FontByUrl = {};

	initialize_node() {}

	async cook() {
		try {
			this._loaded_fonts[this.pv.font] = this._loaded_fonts[this.pv.font] || (await this._load_url(this.pv.font));
		} catch (err) {
			this.states.error.set(`count not load font (${this.pv.font})`);
			return;
		}
		const font = this._loaded_fonts[this.pv.font];
		if (font) {
			switch (TEXT_TYPES[this.pv.type]) {
				case TEXT_TYPE.MESH:
					return this._create_geometry_from_type_mesh(font);
				case TEXT_TYPE.FLAT:
					return this._create_geometry_from_type_flat(font);
				case TEXT_TYPE.LINE:
					return this._create_geometry_from_type_line(font);
				case TEXT_TYPE.STROKE:
					return this._create_geometry_from_type_stroke(font);
				default:
					console.warn('type is not valid');
			}
		}
	}

	private _create_geometry_from_type_mesh(font: Font) {
		const text = this.displayed_text();

		const parameters = {
			font: font,
			size: this.pv.size,
			height: this.pv.extrude,
			curveSegments: this.pv.segments,
		};

		try {
			const geometry = new TextBufferGeometry(text, parameters);
			if (!geometry.index) {
				const position_array = geometry.getAttribute('position').array;
				geometry.setIndex(lodash_range(position_array.length / 3));
			}
			this.set_geometry(geometry);
		} catch (err) {
			this.states.error.set(GENERATION_ERROR_MESSAGE);
		}
	}

	private _create_geometry_from_type_flat(font: Font) {
		const shapes = this._get_shapes(font);
		if (shapes) {
			var geometry = new ShapeBufferGeometry(shapes);
			this.set_geometry(geometry);
		}
	}
	private _create_geometry_from_type_line(font: Font) {
		const shapes = this.shapes_from_font(font);
		if (shapes) {
			const positions = [];
			const indices = [];
			let current_index = 0;

			for (let i = 0; i < shapes.length; i++) {
				const shape = shapes[i];
				const points = shape.getPoints();
				for (let j = 0; j < points.length; j++) {
					const point = points[j];
					positions.push(point.x);
					positions.push(point.y);
					positions.push(0);
					indices.push(current_index);
					if (j > 0 && j < points.length - 1) {
						indices.push(current_index);
					}
					current_index += 1;
				}
			}
			const geometry = new BufferGeometry();
			geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
			geometry.setIndex(indices);
			this.set_geometry(geometry, ObjectType.LINE_SEGMENTS);
		}
	}
	private async _create_geometry_from_type_stroke(font: Font) {
		const shapes = this.shapes_from_font(font);
		if (shapes) {
			// const color = new Color( 0xffffff );
			this._svg_loader = this._svg_loader || (await this._load_svg_loader());
			// TODO: typescript: correct definition for last 3 optional args
			var style = this._svg_loader.getStrokeStyle(this.pv.stroke_width, 'white', 'miter', 'butt', 4);
			const geometries = [];

			// const positions = [];
			// const indices = [];
			// let current_index = 0;

			for (let i = 0; i < shapes.length; i++) {
				const shape = shapes[i];
				const points = shape.getPoints();
				// TODO: typescript: correct definition for points, arcDivisions, and minDistance
				const arcDivisions = 12;
				const minDistance = 0.001;
				const geometry = this._svg_loader.pointsToStroke(
					(<unknown>points) as Vector3[],
					style,
					arcDivisions,
					minDistance
				);
				geometries.push(geometry);
			}
			const merged_geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
			this.set_geometry(merged_geometry); //, CoreConstant.OBJECT_TYPE.LINE_SEGMENTS);
		}
	}

	private shapes_from_font(font: Font) {
		const shapes = this._get_shapes(font);
		if (shapes) {
			const holeShapes: Path[] = [];
			for (let i = 0; i < shapes.length; i++) {
				const shape = shapes[i];
				if (shape.holes && shape.holes.length > 0) {
					for (let j = 0; j < shape.holes.length; j++) {
						const hole = shape.holes[j];
						holeShapes.push(hole);
					}
				}
			}
			shapes.push.apply(shapes, holeShapes as Shape[]);
			return shapes;
		}
	}

	private _get_shapes(font: Font) {
		const text = this.displayed_text();
		try {
			const shapes = font.generateShapes(text, this.pv.size);
			return shapes;
		} catch (err) {
			this.states.error.set(GENERATION_ERROR_MESSAGE);
		}
	}

	private displayed_text(): string {
		return this.pv.text || '';
	}

	// _create_shape(font){
	// 	const shapes = font.generateShapes( this.displayed_text(), 100 );
	// 	var geometry = new ShapeBufferGeometry( shapes );
	// 	return geometry
	// 	// geometry.computeBoundingBox();
	// 	// xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
	// 	// geometry.translate( xMid, 0, 0 );
	// 	// make shape ( N.B. edge view not visible )
	// 	// text = new Mesh( geometry, matLite );
	// 	// text.position.z = - 150;
	// }

	private _load_url(url: string) {
		if (url === '') {
			url = DEFAULT_URL;
		}
		const elements1 = url.split('?')[0];
		const elements2 = elements1.split('.');
		const ext = elements2[elements2.length - 1];
		url = `${url}?${Date.now()}`;
		switch (ext) {
			case 'ttf': {
				return this._load_ttf(url);
			}
			case 'json': {
				return this._load_json(url);
			}
			default: {
				return null;
			}
		}
	}

	private _load_ttf(url: string): Promise<Font> {
		return new Promise(async (resolve, reject) => {
			this._ttf_loader = this._ttf_loader || (await this._load_ttf_loader());
			window.opentype = opentype;
			this._ttf_loader.load(
				url,
				(fnt: object) => {
					const parsed = this._font_loader.parse(fnt);
					// make sure not to delete opentype from window, as it may be required by other nodes
					// delete window.opentype;
					resolve(parsed);
				},
				undefined,
				() => {
					reject();
				}
			);
		});
	}
	private _load_json(url: string): Promise<Font> {
		return new Promise((resolve, reject) => {
			this._font_loader.load(
				url,
				(font) => {
					resolve(font);
				},
				undefined,
				() => {
					reject();
				}
			);
		});
	}

	// private _default_font_parameters(options){
	// 	if (options == null) { options = {}; }
	// 	const default_options = lodash_clone(DEFAULT_PARAMS);
	// 	if (options['font'] == null) { options['font'] = this.font(); }

	// 	for(let key of Object.keys(options)){
	// 		default_options[key] = options[key];
	// 	}

	// 	return default_options;
	// }
	private async _load_ttf_loader(): Promise<TTFLoader> {
		const {TTFLoader} = await import(`../../../../modules/three/examples/jsm/loaders/TTFLoader`);
		const loader_constructor = (<unknown>TTFLoader) as typeof TTFLoader;
		return new loader_constructor();
	}
	private async _load_svg_loader(): Promise<typeof SVGLoader> {
		const {SVGLoader} = await import(`../../../../modules/three/examples/jsm/loaders/SVGLoader`);
		return (<unknown>SVGLoader) as typeof SVGLoader;
	}
}
