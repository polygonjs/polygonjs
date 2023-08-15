/**
 * Creates CSS3DObjects.
 *
 * @remarks
 * This is very useful to create 2D html labels that would be positioned at specific points in the 3D world.
 * Note that the camera must be configured to use a CSS2DRenderer to display them
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreCSSObjectAttribute, DEFAULT_CSS3DOBJECT} from '../../../core/render/CSSRenderers/CSSObjectAttribute';
import {createCSS3DObject} from '../../../core/render/CSSRenderers/CSS3DObject';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {StringParamLanguage} from '../../params/utils/OptionsController';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {stringToAttribNames} from '../../../core/String';
import {Object3D} from 'three';
import {replaceChild} from '../../poly/PolyOnObjectsAddRemoveHooksController';
class CSS3DObjectSopParamsConfig extends NodeParamsConfig {
	/** @param toggles on if attributes are copied from the geometry to the html element */
	copyAttributes = ParamConfig.BOOLEAN(true);
	/** @param names of the attributes that are copied from the geometry to the html element */
	attributesToCopy = ParamConfig.STRING('', {
		visibleIf: {copyAttributes: true},
	});
	/** @param HTML elements may appear to large at first, so this gives you a quick way to scale them down */
	scale = ParamConfig.FLOAT(0.02);
	/** @param defines if the vertex id attribute is used to create the html id attribute */
	overrideId = ParamConfig.BOOLEAN(true);
	/** @param value of the html element id attribute */
	id = ParamConfig.STRING(DEFAULT_CSS3DOBJECT.id, {
		visibleIf: {overrideId: 1},
	});
	/** @param defines if the vertex class attribute is used to create the html class */
	overrideClassName = ParamConfig.BOOLEAN(true);
	/** @param value of the html class */
	className = ParamConfig.STRING(DEFAULT_CSS3DOBJECT.className, {
		visibleIf: {overrideClassName: 1},
	});
	/** @param defines if the vertex html attribute is used to create the html content */
	overrideHTML = ParamConfig.BOOLEAN(true);
	/** @param value of the html content */
	html = ParamConfig.STRING(DEFAULT_CSS3DOBJECT.html, {
		visibleIf: {overrideHTML: 1},
		language: StringParamLanguage.HTML,
	});
}
const ParamsConfig = new CSS3DObjectSopParamsConfig();

export class CSS3DObjectSopNode extends TypedSopNode<CSS3DObjectSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSS3D_OBJECT;
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		if (coreGroup) {
			// if there are input objects,
			// add attributes to them
			const objects = coreGroup.allObjects();
			for (const object of objects) {
				this._addAttributes(object);
			}
			this.setCoreGroup(coreGroup);
		} else {
			const object = new Object3D();
			object.name = this.name();
			this._addAttributes(object);
			this.setObjects([object]);
		}
	}
	private _addAttributes(object: ObjectContent<CoreObjectType>) {
		Poly.onObjectsAddRemoveHooks.assignOnAddHookHandler(object, this);
		// CoreCSSObjectAttribute.setNodeId(object, this.graphNodeId());
		if (this.pv.overrideId) {
			CoreCSSObjectAttribute.setElementId(object, this.pv.id);
		}
		if (this.pv.overrideClassName) {
			CoreCSSObjectAttribute.setElementClass(object, this.pv.className);
		}
		if (this.pv.overrideHTML) {
			CoreCSSObjectAttribute.setElementHTML(object, this.pv.html);
		}
		CoreCSSObjectAttribute.setCopyAttributes(object, this.pv.copyAttributes);
		CoreCSSObjectAttribute.setAttributesToCopy(object, this.pv.attributesToCopy);
		CoreCSSObjectAttribute.setScale(object, this.pv.scale);
	}
	public override updateObjectOnAdd(object: Object3D, parent: Object3D) {
		const id = CoreCSSObjectAttribute.getElementId(object);
		const className = CoreCSSObjectAttribute.getElementClass(object);
		const html = CoreCSSObjectAttribute.getElementHTML(object);
		const copyAttributes = CoreCSSObjectAttribute.getCopyAttributes(object);
		const attributesToCopy = CoreCSSObjectAttribute.getAttributesToCopy(object);
		const scale = CoreCSSObjectAttribute.getScale(object);
		const CSSObject = createCSS3DObject({
			object,
			id,
			className,
			html,
			copyAttributes,
			attributesToCopy: stringToAttribNames(attributesToCopy),
			scale,
		});
		replaceChild(parent, object, CSSObject);
	}
}
