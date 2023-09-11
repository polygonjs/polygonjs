import {
	VAR_OBJECT,
	VAR_ENTITIES,
	CLASS_CORE_POINT,
	CLASS_CORE_THREEJS_POINT,
	FUNC_GET_ENTITIES_ATTRIBUTE,
} from './Common';

export class AttributeRequirementsController {
	private _attributeNames: Set<string> | undefined;
	constructor() {}

	reset() {
		if (this._attributeNames) {
			this._attributeNames.clear();
		}
	}
	assignAttributesLines(): string {
		if (this._attributeNames) {
			const lines: string[] = [];
			for (let attribName of this._attributeNames) {
				lines.push(AttributeRequirementsController.assignAttributeLine(attribName));
			}
			return lines.join(';\n');
		} else {
			return '';
		}
	}
	assignArraysLines(): string {
		if (this._attributeNames) {
			const lines: string[] = [];
			if (this._attributeNames.size > 0) {
				const objectLine = `const ${VAR_OBJECT} = entities[0].object();`;
				lines.push(objectLine);
			}
			for (let attribName of this._attributeNames) {
				lines.push(AttributeRequirementsController.assignItemSizeLine(attribName));
				lines.push(AttributeRequirementsController.assignArrayLine(attribName));
			}
			return lines.join(';\n');
		} else {
			return '';
		}
	}
	attributePresenceCheckLine(): string {
		if (this._attributeNames) {
			const varNames: string[] = [];
			for (let attribName of this._attributeNames) {
				const varName = AttributeRequirementsController._varAttribute(attribName);
				varNames.push(varName);
			}
			if (varNames.length > 0) {
				return varNames.join(' && ');
			}
		}
		// TODO: add test that a Point Sop can take an expression that does not require attributes
		return 'true';
	}
	missingAttributesLine(): string {
		if (this._attributeNames) {
			let lineElements: string[] = ['(()=>{', 'const missingAttributes = [];'];
			for (let attribName of this._attributeNames) {
				const varName = AttributeRequirementsController._varAttribute(attribName);
				lineElements.push(`if( !${varName} ) {	missingAttributes.push('${attribName}'); }`);
			}

			lineElements.push('return missingAttributes;', '})');
			return lineElements.join('');
		}
		return '[]';
	}

	add(attribName: string) {
		this._attributeNames = this._attributeNames || new Set<string>();
		this._attributeNames.add(attribName);
	}

	static assignAttributeLine(attribName: string) {
		const varAttribute = this._varAttribute(attribName);
		return `const ${varAttribute} = ${FUNC_GET_ENTITIES_ATTRIBUTE}(${VAR_ENTITIES},'${attribName}')`;
	}
	private static assignItemSizeLine(attribName: string) {
		const varAttribute = this._varAttribute(attribName);
		const varAttributeSize = this._varAttribSize(attribName);
		return `const ${varAttributeSize} = ${varAttribute}.itemSize`;
	}
	private static assignArrayLine(attribName: string) {
		const varAttribute = this._varAttribute(attribName);
		const varArray = this._varArray(attribName);
		const isIndexedCondition = `(${VAR_ENTITIES}[0] && ${VAR_ENTITIES}[0] instanceof ${CLASS_CORE_THREEJS_POINT} && ${CLASS_CORE_POINT}.isAttribIndexed(${VAR_OBJECT}, '${attribName}'))`;
		const indexedArray = `${VAR_ENTITIES}.map(e=>e.indexedAttribValue('${attribName}'))`;
		const nonIndexedArray = `${varAttribute}.array`;
		return `const ${varArray} = ${isIndexedCondition} ? ${indexedArray} : ${nonIndexedArray};`;
	}

	private static _varAttribute(attribName: string) {
		return `attrib_${attribName}`;
	}
	private static _varAttribSize(attribName: string) {
		return `attribSize_${attribName}`;
	}
	private static _varArray(attribName: string) {
		return `array_${attribName}`;
	}
	varAttributeSize(attribName: string) {
		return AttributeRequirementsController._varAttribSize(attribName);
	}
	varArray(attribName: string) {
		return AttributeRequirementsController._varArray(attribName);
	}
}
