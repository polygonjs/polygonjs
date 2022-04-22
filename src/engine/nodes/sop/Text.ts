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
import {BufferGeometry} from 'three';
import {ShapeBufferGeometry} from 'three';
import {Font} from '../../../modules/three/examples/jsm/loaders/FontLoader';
import {Float32BufferAttribute} from 'three';
import {Vector3} from 'three';
import {Path} from 'three';
import {Shape} from 'three';
import {mergeBufferGeometries} from '../../../modules/three/examples/jsm/utils/BufferGeometryUtils';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {FileType} from '../../params/utils/OptionsController';
import {CoreLoaderFont} from '../../../core/loader/Font';
import {Poly} from '../../Poly';
import {DEMO_ASSETS_ROOT_URL} from '../../../core/Assets';
import {TypeAssert} from '../../poly/Assert';
import {Attribute} from '../../../core/geometry/Attribute';
import {isBooleanTrue} from '../../../core/Type';
import {CoreObject} from '../../../core/geometry/Object';
import {CoreString} from '../../../core/String';

const DEFAULT_FONT_URL = `${DEMO_ASSETS_ROOT_URL}/fonts/droid_sans_regular.typeface.json`;

export enum TextType {
	MESH = 'mesh',
	FLAT = 'flat',
	LINE = 'line',
	STROKE = 'stroke',
}
export const TEXT_TYPES: Array<TextType> = [TextType.MESH, TextType.FLAT, TextType.LINE, TextType.STROKE];

enum TextSopJustifiyMode {
	LEFT = 'left',
	RIGHT = 'right',
	CENTER = 'center',
}
const TEXT_SOP_JUSTIFY_MODES: Array<TextSopJustifiyMode> = [
	TextSopJustifiyMode.LEFT,
	TextSopJustifiyMode.RIGHT,
	TextSopJustifiyMode.CENTER,
];

function isGeometryValid(geometry: BufferGeometry) {
	return geometry.getAttribute(Attribute.POSITION).count != 0;
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
			type: TEXT_TYPES.indexOf(TextType.MESH),
		},
	});
	/** @param segments count */
	segments = ParamConfig.INTEGER(1, {
		range: [1, 20],
		rangeLocked: [true, false],
		visibleIf: {
			type: TEXT_TYPES.indexOf(TextType.MESH),
		},
	});
	/** @param stroke width */
	strokeWidth = ParamConfig.FLOAT(0.02, {
		visibleIf: {
			type: TEXT_TYPES.indexOf(TextType.STROKE),
		},
	});
	/** @param line height */
	lineHeight = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		rangeLocked: [false, false],
	});
	/** @param justify mode */
	justifyMode = ParamConfig.INTEGER(TEXT_SOP_JUSTIFY_MODES.indexOf(TextSopJustifiyMode.LEFT), {
		menu: {
			entries: TEXT_SOP_JUSTIFY_MODES.map((name, value) => ({name, value})),
		},
	});
	/** @param create one object per line */
	splitPerLine = ParamConfig.BOOLEAN(0);
}

const ParamsConfig = new TextSopParamsConfig();

export class TextSopNode extends TypedSopNode<TextSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'text';
	}
	override dispose(): void {
		super.dispose();
		Poly.blobs.clearBlobsForNode(this);
	}

	private _loadedFonts: Map<string, Font> = new Map();

	override async cook(): Promise<void> {
		const fontUrl = this.pv.font;
		let font: Font | null | undefined = this._loadedFonts.get(fontUrl);
		try {
			if (!font) {
				font = await this._loadFont();
				if (font) {
					this._loadedFonts.set(fontUrl, font);
				}
			}
		} catch (err) {
			console.log(err);
			this.states.error.set(`count not load font (${this.pv.font})`);
			this.cookController.endCook();
			return;
		}
		if (!font) {
			this.cookController.endCook();
			return;
		}
		const textType = TEXT_TYPES[this.pv.type];
		if (!TEXT_TYPES.includes(textType)) {
			this.cookController.endCook();
			return;
		}

		const geometries = await this._gatherAndOffsetGeometries(textType, font);
		this._applyJustifyModeToGeometries(geometries);

		const objectType = textType == TextType.LINE ? ObjectType.LINE_SEGMENTS : ObjectType.MESH;
		if (isBooleanTrue(this.pv.splitPerLine)) {
			this.setObjects(
				geometries.map((geo, i) => {
					const object = this.createObject(geo, objectType);
					object.name = geo.name;
					const coreObject = new CoreObject(object, i);
					coreObject.addAttribute('lineIndex', i);
					return object;
				})
			);
		} else {
			try {
				const mergedGeometry = mergeBufferGeometries(geometries);
				this.setGeometry(mergedGeometry, objectType);
			} catch (err) {
				this.states.error.set(`failed to generate geometry. Try to remove some characters`);
				this.cookController.endCook();
				return;
			}
		}
	}
	private async _gatherAndOffsetGeometries(textType: TextType, font: Font) {
		const lines = this.pv.text.split('\n');
		const geometries: BufferGeometry[] = [];
		let previousGeometry: BufferGeometry | undefined;
		for (let line of lines) {
			const geometry = await this._buildGeometries(line, textType, font);
			if (geometry) {
				geometry.name = CoreString.sanitizeName(line);
				// TODO: if the returned geometry is empty (which may be the case if the line is blank),
				// we still add the previous offset,
				// so that we have an empty line

				if (previousGeometry) {
					if (isGeometryValid(geometry) && isGeometryValid(previousGeometry)) {
						const newOffset = this._geometryOffset(geometry, previousGeometry);
						if (newOffset != null && isFinite(newOffset)) {
							geometry.translate(0, newOffset, 0);
						}
					}
				}

				geometries.push(geometry);
				previousGeometry = geometry;
			}
		}
		return geometries;
	}
	private _geometryOffset(geometry: BufferGeometry, previousGeometry: BufferGeometry) {
		previousGeometry.computeBoundingBox();
		geometry.computeBoundingBox();
		const previousBbox = previousGeometry.boundingBox;
		const currentBbox = geometry.boundingBox;

		if (!(previousBbox && currentBbox)) {
			return;
		}
		// const previousHeight = Math.abs(previousBbox.max.y - previousBbox.min.y);
		const currentHeight = Math.abs(currentBbox.max.y - currentBbox.min.y);
		const offset = previousBbox.min.y - (currentHeight + this.pv.lineHeight);
		return offset;
	}
	private _applyJustifyModeToGeometries(geometries: BufferGeometry[]) {
		if (geometries.length == 0) {
			return;
		}
		// let minX = 1;
		// let maxX = -1;
		// for (let geometry of geometries) {
		// 	geometry.computeBoundingBox();
		// 	const bbox = geometry.boundingBox;
		// 	if (bbox) {
		// 		minX = Math.min(minX, bbox.min.x);
		// 		maxX = Math.max(maxX, bbox.max.x);
		// 	}
		// }
		const justifyMode = TEXT_SOP_JUSTIFY_MODES[this.pv.justifyMode];
		for (let geometry of geometries) {
			this._applyJustifyModeToGeometry(geometry, justifyMode);
		}
	}

	private _applyJustifyModeToGeometry(geometry: BufferGeometry, justifyMode: TextSopJustifiyMode) {
		geometry.computeBoundingBox();
		if (!geometry.boundingBox) {
			return;
		}
		switch (justifyMode) {
			case TextSopJustifiyMode.LEFT: {
				// do nothing
				return;
			}
			case TextSopJustifiyMode.CENTER: {
				const currentCenter = 0.5 * (geometry.boundingBox.min.x + geometry.boundingBox.max.x);
				geometry.translate(-currentCenter, 0, 0);
				return;
			}
			case TextSopJustifiyMode.RIGHT: {
				const currentRight = geometry.boundingBox.max.x;
				geometry.translate(-currentRight, 0, 0);
				return;
			}
		}
		TypeAssert.unreachable(justifyMode);
	}

	private _buildGeometries(line: string, textType: TextType, font: Font) {
		if (line.trim().length == 0) {
			// currently not creating a geometry if the line is empty
			// but we should create something that tells us to offset the next geometry
			return;
		}
		switch (textType) {
			case TextType.MESH:
				return this._createGeometryFromTypeMesh(line, font);
			case TextType.FLAT:
				return this._createGeometryFromTypeFlat(line, font);
			case TextType.LINE:
				return this._createGeometryFromTypeLine(line, font);
			case TextType.STROKE:
				return this._createGeometryFromTypeStroke(line, font);
		}
		TypeAssert.unreachable(textType);
	}

	private _createGeometryFromTypeMesh(line: string, font: Font) {
		const parameters = {
			font: font,
			size: this.pv.size,
			height: this.pv.extrude,
			curveSegments: this.pv.segments,
		};

		try {
			const geometry = new TextGeometry(line, parameters);
			if (!geometry.index) {
				const positionArray = geometry.getAttribute('position').array;
				geometry.setIndex(ArrayUtils.range(positionArray.length / 3));
			}
			return geometry;
		} catch (err) {
			this.states.error.set(GENERATION_ERROR_MESSAGE);
		}
	}

	private _createGeometryFromTypeFlat(line: string, font: Font) {
		const shapes = this._getShapes(line, font);
		if (shapes) {
			var geometry = new ShapeBufferGeometry(shapes);
			return geometry;
		}
	}
	private _createGeometryFromTypeLine(line: string, font: Font) {
		const shapes = this._shapesFromFont(line, font);
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
			return geometry;
		}
	}
	private async _createGeometryFromTypeStroke(line: string, font: Font) {
		const shapes = this._shapesFromFont(line, font);
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
			const mergedGeometry = mergeBufferGeometries(geometries);
			return mergedGeometry;
		}
	}

	private _shapesFromFont(line: string, font: Font) {
		const shapes = this._getShapes(line, font);
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

	private _getShapes(line: string, font: Font) {
		try {
			const shapes = font.generateShapes(line, this.pv.size);
			return shapes;
		} catch (err) {
			this.states.error.set(GENERATION_ERROR_MESSAGE);
		}
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
