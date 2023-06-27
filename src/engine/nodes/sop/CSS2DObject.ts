/**
 * Creates CSS2DObjects.
 *
 * @remarks
 * This is very useful to create 2D html labels that would be positioned at specific points in the 3D world.
 * Note that the camera must be configured to use a CSS2DRenderer to display them
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {StringParamLanguage} from '../../params/utils/OptionsController';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {Poly} from '../../Poly';
import {CoreCSSObjectAttribute, DEFAULT_CSS2DOBJECT} from '../../../core/render/CSSRenderers/CSSObjectAttribute';
import {createCSS2DObject} from '../../../core/render/CSSRenderers/CSS2DObject';
import {stringToAttribNames} from '../../../core/String';
import {Object3D} from 'three';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
class CSS2DObjectSopParamsConfig extends NodeParamsConfig {
	/** @param toggles on if attributes are copied from the geometry to the html element */
	copyAttributes = ParamConfig.BOOLEAN(true);
	/** @param names of the attributes that are copied from the geometry to the html element */
	attributesToCopy = ParamConfig.STRING('', {
		visibleIf: {copyAttributes: true},
	});
	/** @param defines if the vertex id attribute is used to create the html id attribute */
	overrideId = ParamConfig.BOOLEAN(true);
	/** @param value of the html element id attribute */
	id = ParamConfig.STRING(DEFAULT_CSS2DOBJECT.id, {
		visibleIf: {overrideId: 1},
	});
	/** @param defines if the vertex class attribute is used to create the html class */
	overrideClassName = ParamConfig.BOOLEAN(true);
	/** @param value of the html class */
	className = ParamConfig.STRING(DEFAULT_CSS2DOBJECT.className, {
		visibleIf: {overrideClassName: 1},
	});
	/** @param defines if the vertex html attribute is used to create the html content */
	overrideHTML = ParamConfig.BOOLEAN(true);
	/** @param value of the html content */
	html = ParamConfig.STRING(DEFAULT_CSS2DOBJECT.html, {
		visibleIf: {overrideHTML: 1},
		language: StringParamLanguage.HTML,
	});
}
const ParamsConfig = new CSS2DObjectSopParamsConfig();

export class CSS2DObjectSopNode extends TypedSopNode<CSS2DObjectSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSS2D_OBJECT;
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
			// if no input, create CSS object
			// and also add attributes.
			// Even if the attributes can be redundant,
			// they give clues that they can be changed
			// to update the output
			const group = createCSS2DObject({
				id: this.pv.id,
				className: this.pv.className,
				html: this.pv.html,
				copyAttributes: this.pv.copyAttributes,
				attributesToCopy: stringToAttribNames(this.pv.attributesToCopy),
			});
			group.name = this.name();
			this._addAttributes(group);
			this.setObjects([group]);
		}
	}
	private _addAttributes(object: ObjectContent<CoreObjectType>) {
		Poly.onObjectsAddedHooks.assignHookHandler(object, this);
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
	}

	public override updateObjectOnAdd(object: Object3D, parent: Object3D) {
		const id = CoreCSSObjectAttribute.getElementId(object);
		const className = CoreCSSObjectAttribute.getElementClass(object);
		const html = CoreCSSObjectAttribute.getElementHTML(object);
		const copyAttributes = CoreCSSObjectAttribute.getCopyAttributes(object);
		const attributesToCopy = CoreCSSObjectAttribute.getAttributesToCopy(object);
		const CSSObject = createCSS2DObject({
			object,
			id,
			className,
			html,
			copyAttributes,
			attributesToCopy: stringToAttribNames(attributesToCopy),
		});
		// new object replaces old Object directly,
		// and not using .remove and .add,
		// as this would make traversing the scenes from the hooks handler
		// unpredictable.
		const index = parent.children.indexOf(object);
		parent.children[index] = CSSObject;
		CSSObject.parent = parent;
		// parent.remove(object);
		// parent.add(CSSObject);
	}
}
