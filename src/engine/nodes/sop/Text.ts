/**
 * Creates text
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {ArrayUtils} from '../../../core/ArrayUtils';
import {ObjectType} from '../../../core/geometry/Constant';
import {TextGeometry} from '../../../modules/three/examples/jsm/geometries/TextGeometry';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {ShapeBufferGeometry} from 'three/src/geometries/ShapeGeometry';
import {Font} from '../../../modules/three/examples/jsm/loaders/FontLoader';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {Vector3} from 'three/src/math/Vector3';
import {Path} from 'three/src/extras/core/Path';
import {Shape} from 'three/src/extras/core/Shape';
import {mergeBufferGeometries} from '../../../modules/three/examples/jsm/utils/BufferGeometryUtils';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {FileType} from '../../params/utils/OptionsController';
import {CoreLoaderFont} from '../../../core/loader/Font';
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

class TextSopParamsConfig extends NodeParamsConfig {
	/** @param font used */
	font = ParamConfig.STRING(DEFAULT_FONT_URL, {
		fileBrowse: {type: [FileType.FONT]},
	});
	/** @param text created */
	text = ParamConfig.STRING('polygonjs', {
		multiline: true,
	});
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
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'text';
	}

	private _loadedFonts: FontByUrl = {};

	override async cook() {
		try {
			this._loadedFonts[this.pv.font] = this._loadedFonts[this.pv.font] || (await this._loadFont());
		} catch (err) {
			this.states.error.set(`count not load font (${this.pv.font})`);
			return;
		}
		const font = this._loadedFonts[this.pv.font];
		if (font) {
			switch (TEXT_TYPES[this.pv.type]) {
				case TEXT_TYPE.MESH:
					return this._createGeometryFromTypeMesh(font);
				case TEXT_TYPE.FLAT:
					return this._createGeometryFromTypeFlat(font);
				case TEXT_TYPE.LINE:
					return this._createGeometryFromTypeLine(font);
				case TEXT_TYPE.STROKE:
					return this._createGeometryFromTypeStroke(font);
				default:
					console.warn('type is not valid');
			}
		}
	}
	override dispose(): void {
		super.dispose();
		Poly.blobs.clearBlobsForNode(this);
	}

	private _createGeometryFromTypeMesh(font: Font) {
		const text = this._displayedText();

		const parameters = {
			font: font,
			size: this.pv.size,
			height: this.pv.extrude,
			curveSegments: this.pv.segments,
		};

		try {
			const geometry = new TextGeometry(text, parameters);
			if (!geometry.index) {
				const positionArray = geometry.getAttribute('position').array;
				geometry.setIndex(ArrayUtils.range(positionArray.length / 3));
			}
			this.setGeometry(geometry);
		} catch (err) {
			this.states.error.set(GENERATION_ERROR_MESSAGE);
		}
	}

	private _createGeometryFromTypeFlat(font: Font) {
		const shapes = this._getShapes(font);
		if (shapes) {
			var geometry = new ShapeBufferGeometry(shapes);
			this.setGeometry(geometry);
		}
	}
	private _createGeometryFromTypeLine(font: Font) {
		const shapes = this._shapesFromFont(font);
		if (shapes) {
			const positions = [];
			const indices = [];
			let currentIndex = 0;

			for (let i = 0; i < shapes.length; i++) {
				const shape = shapes[i];
				const points = shape.getPoints();
				for (let j = 0; j < points.length; j++) {
					const point = points[j];
					positions.push(point.x);
					positions.push(point.y);
					positions.push(0);
					indices.push(currentIndex);
					if (j > 0 && j < points.length - 1) {
						indices.push(currentIndex);
					}
					currentIndex += 1;
				}
			}
			const geometry = new BufferGeometry();
			geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
			geometry.setIndex(indices);
			this.setGeometry(geometry, ObjectType.LINE_SEGMENTS);
		}
	}
	private async _createGeometryFromTypeStroke(font: Font) {
		const shapes = this._shapesFromFont(font);
		if (shapes) {
			const loader = await CoreLoaderFont.loadSVGLoader();
			if (!loader) {
				return;
			}
			// TODO: typescript: correct definition for last 3 optional args
			var style = loader.getStrokeStyle(this.pv.strokeWidth, 'white', 'miter', 'butt', 4);
			const geometries = [];

			for (let i = 0; i < shapes.length; i++) {
				const shape = shapes[i];
				const points = shape.getPoints();
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
			const merged_geometry = mergeBufferGeometries(geometries);
			this.setGeometry(merged_geometry); //, CoreConstant.OBJECT_TYPE.LINE_SEGMENTS);
		}
	}

	private _shapesFromFont(font: Font) {
		const shapes = this._getShapes(font);
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

	private _getShapes(font: Font) {
		const text = this._displayedText();
		try {
			const shapes = font.generateShapes(text, this.pv.size);
			return shapes;
		} catch (err) {
			this.states.error.set(GENERATION_ERROR_MESSAGE);
		}
	}

	private _displayedText(): string {
		return this.pv.text || '';
	}

	private _loadFont() {
		const loader = new CoreLoaderFont(this.pv.font, this.scene(), this);
		return loader.load();
	}
	override async requiredModules() {
		if (this.p.font.isDirty()) {
			await this.p.font.compute();
		}
		return CoreLoaderFont.requiredModules(this.pv.font);
	}
}
