/**
 * Creates text
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreLoaderFont} from '../../../core/loader/font/CoreFontLoader';
import {Font} from '../../../core/loader/font/Font';
import {Poly} from '../../Poly';
import {DEMO_ASSETS_ROOT_URL} from '../../../core/Assets';
import {TextSopJustifiyMode, TEXT_SOP_JUSTIFY_MODES} from './utils/text/TextJustify';
import {textBuildGeometries} from './utils/text/TextGeometries';
import {TextType, TEXT_TYPES} from './utils/text/TextType';
import {textMergeLetters} from './utils/text/TextMergeLetters';
import {isBooleanTrue} from '../../../core/Type';

const DEFAULT_FONT_URL = `${DEMO_ASSETS_ROOT_URL}/fonts/droid_sans_regular.typeface.json`;

// function isGeometryValid(geometry: BufferGeometry) {
// 	return geometry.getAttribute(Attribute.POSITION).count != 0;
// }

const GENERATION_ERROR_MESSAGE = `failed to generate geometry. Try to remove some characters`;
class TextSopParamsConfig extends NodeParamsConfig {
	/** @param font used */
	font = ParamConfig.STRING(DEFAULT_FONT_URL, {
		fileBrowse: {extensions: ['ttf', 'json']},
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
	/** @param bevelEnabled */
	bevelEnabled = ParamConfig.BOOLEAN(false, {
		visibleIf: {
			type: TEXT_TYPES.indexOf(TextType.MESH),
		},
	});
	/** @param bevelThickness */
	bevelThickness = ParamConfig.FLOAT(0, {
		visibleIf: {
			type: TEXT_TYPES.indexOf(TextType.MESH),
			bevelEnabled: true,
		},
	});
	/** @param bevelSize */
	bevelSize = ParamConfig.FLOAT(0, {
		visibleIf: {
			type: TEXT_TYPES.indexOf(TextType.MESH),
			bevelEnabled: true,
		},
	});
	/** @param bevelOffset */
	bevelOffset = ParamConfig.FLOAT(0, {
		visibleIf: {
			type: TEXT_TYPES.indexOf(TextType.MESH),
			bevelEnabled: true,
		},
	});
	/** @param bevelSegments */
	bevelSegments = ParamConfig.INTEGER(2, {
		range: [1, 6],
		visibleIf: {
			type: TEXT_TYPES.indexOf(TextType.MESH),
			bevelEnabled: true,
		},
	});
	/** @param stroke width */
	strokeWidth = ParamConfig.FLOAT(0.02, {
		visibleIf: {
			type: TEXT_TYPES.indexOf(TextType.STROKE),
		},
	});
	/** @param line height */
	lineHeight = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [false, false],
	});
	/** @param create one object per letter */
	splitPerLetter = ParamConfig.BOOLEAN(0);
	/** @param justify mode */
	justifyMode = ParamConfig.INTEGER(TEXT_SOP_JUSTIFY_MODES.indexOf(TextSopJustifiyMode.LEFT), {
		menu: {
			entries: TEXT_SOP_JUSTIFY_MODES.map((name, value) => ({name, value})),
		},
	});
	/** @param open advanced options */
	tadvanced = ParamConfig.BOOLEAN(0);
	/** @param is counter clock wise: defines the vertex order when parsing the font */
	isCCW = ParamConfig.BOOLEAN(0, {
		visibleIf: {tadvanced: true},
	});
	/** @param defines if holes should be found when parsing the font */
	noHoles = ParamConfig.BOOLEAN(0, {
		visibleIf: {tadvanced: true},
	});
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

	setTextType(type: TextType) {
		this.p.type.set(TEXT_TYPES.indexOf(type));
	}

	private _loadedFonts: Map<string, Font> = new Map();

	override async cook(): Promise<void> {
		const fontUrl = this.pv.font;
		let font: Font | null | undefined = this._loadedFonts.get(fontUrl);
		try {
			if (!font) {
				const loader = new CoreLoaderFont(this.pv.font, this);
				font = await loader.load();
				if (font) {
					this._loadedFonts.set(fontUrl, font);
				}
			}
		} catch (err) {
			console.warn('error:', err);
			this.states.error.set(`could not load font (${this.pv.font}, reason:${(err as Error).message})`);
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

		const textWithoutSpaces = this.pv.text.replace(/\s/g, '');
		if (textWithoutSpaces.length == 0) {
			return this.setObjects([]);
		}
		const geometries = await await textBuildGeometries({
			text: this.pv.text,
			textType,
			font,
			size: this.pv.size,
			extrude: this.pv.extrude,
			curveSegments: this.pv.segments,
			strokeWidth: this.pv.strokeWidth,
			// bevel
			bevelEnabled: this.pv.bevelEnabled,
			bevelThickness: this.pv.bevelThickness,
			bevelSize: this.pv.bevelSize,
			bevelOffset: this.pv.bevelOffset,
			bevelSegments: this.pv.bevelSegments,
			//
			isCCW: isBooleanTrue(this.pv.tadvanced) ? this.pv.isCCW : undefined,
			noHoles: isBooleanTrue(this.pv.tadvanced) ? this.pv.noHoles : undefined,
		});
		if (geometries) {
			const objects = textMergeLetters({
				text: this.pv.text,
				geometries: geometries,
				textType,
				splitPerLetter: this.pv.splitPerLetter,
				justifyMode: TEXT_SOP_JUSTIFY_MODES[this.pv.justifyMode],
				lineHeight: this.pv.lineHeight,
			});
			if (objects) {
				return this.setObjects(objects);
			}
		}
		this.states.error.set(GENERATION_ERROR_MESSAGE);
		this.cookController.endCook();
	}
}
