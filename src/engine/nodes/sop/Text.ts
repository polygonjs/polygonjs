/**
 * Creates text
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {ArrayUtils} from '../../../core/ArrayUtils';
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
import {BufferGeometryUtils} from '../../../modules/three/examples/jsm/utils/BufferGeometryUtils';
import {ModuleName} from '../../poly/registers/modules/_BaseRegister';
import {Poly} from '../../Poly';
import {DEMO_ASSETS_ROOT_URL} from '../../../core/Assets';

const DEFAULT_FONT_URL = `${DEMO_ASSETS_ROOT_URL}/fonts/droid_sans_regular.typeface.json`;

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
import {FileType} from '../../params/utils/OptionsController';
class TextSopParamsConfig extends NodeParamsConfig {
	/** @param font used */
	font = ParamConfig.STRING(DEFAULT_FONT_URL, {
		fileBrowse: {type: [FileType.FONT]},
	});
	/** @param text created */
	text = ParamConfig.STRING('polygonjs', {multiline: true});
	/** @param type of geometry created */
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
	/** @param font size */
	size = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param extrude depth */
	extrude = ParamConfig.FLOAT(0.1, {
		visibleIf: {
			type: TEXT_TYPES.indexOf(TEXT_TYPE.MESH),
		},
	});
	/** @param segments count */
	segments = ParamConfig.INTEGER(1, {
		range: [1, 20],
		rangeLocked: [true, false],
		visibleIf: {
			type: TEXT_TYPES.indexOf(TEXT_TYPE.MESH),
		},
	});
	/** @param stroke width */
	strokeWidth = ParamConfig.FLOAT(0.02, {
		visibleIf: {
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

	private _font_loader: FontLoader = new FontLoader();
	private _loaded_fonts: FontByUrl = {};

	initializeNode() {
		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.url], () => {
					return this.p.text.rawInput();
				});
			});
		});
	}

	async cook() {
		try {
			this._loaded_fonts[this.pv.font] = this._loaded_fonts[this.pv.font] || (await this._load_url());
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
				geometry.setIndex(ArrayUtils.range(position_array.length / 3));
			}
			this.setGeometry(geometry);
		} catch (err) {
			this.states.error.set(GENERATION_ERROR_MESSAGE);
		}
	}

	private _create_geometry_from_type_flat(font: Font) {
		const shapes = this._get_shapes(font);
		if (shapes) {
			var geometry = new ShapeBufferGeometry(shapes);
			this.setGeometry(geometry);
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
			this.setGeometry(geometry, ObjectType.LINE_SEGMENTS);
		}
	}
	private async _create_geometry_from_type_stroke(font: Font) {
		const shapes = this.shapes_from_font(font);
		if (shapes) {
			const loader = await this._load_svg_loader();
			if (!loader) {
				return;
			}
			// TODO: typescript: correct definition for last 3 optional args
			var style = loader.getStrokeStyle(this.pv.strokeWidth, 'white', 'miter', 'butt', 4);
			const geometries = [];

			for (let i = 0; i < shapes.length; i++) {
				const shape = shapes[i];
				const points = shape.getPoints();
				// TODO: typescript: correct definition for points, arcDivisions, and minDistance
				const arcDivisions = 12;
				const minDistance = 0.001;
				const geometry = loader.pointsToStroke(
					(<unknown>points) as Vector3[],
					style,
					arcDivisions,
					minDistance
				);
				geometries.push(geometry);
			}
			const merged_geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
			this.setGeometry(merged_geometry); //, CoreConstant.OBJECT_TYPE.LINE_SEGMENTS);
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

	private _load_url() {
		const url = `${this.pv.font}?${Date.now()}`;
		const ext = this.get_extension();
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
	async requiredModules() {
		if (this.p.font.isDirty()) {
			await this.p.font.compute();
		}
		const ext = this.get_extension();
		switch (ext) {
			case 'ttf': {
				return [ModuleName.TTFLoader];
			}
			case 'json': {
				return [ModuleName.SVGLoader];
			}
		}
	}
	private get_extension() {
		const url = this.pv.font;
		const elements1 = url.split('?')[0];
		const elements2 = elements1.split('.');
		return elements2[elements2.length - 1];
	}

	private _load_ttf(url: string): Promise<Font> {
		return new Promise(async (resolve, reject) => {
			const loaded_module = await this._load_ttf_loader();
			if (!loaded_module) {
				return;
			}
			loaded_module.load(
				url,
				(fnt: object) => {
					const parsed = this._font_loader.parse(fnt);
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

	private async _load_ttf_loader() {
		const module = await Poly.modulesRegister.module(ModuleName.TTFLoader);
		if (module) {
			return new module.TTFLoader();
		}
	}
	private async _load_svg_loader() {
		const module = await Poly.modulesRegister.module(ModuleName.SVGLoader);
		if (module) {
			return module.SVGLoader;
		}
	}
}
