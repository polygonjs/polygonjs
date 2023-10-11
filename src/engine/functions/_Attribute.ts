import {NamedFunction3} from './_Base';
import {CoreObjectType, ObjectContent} from '../../core/geometry/ObjectContent';
import {corePrimitiveClassFactory} from '../../core/geometry/CoreObjectFactory';

export class importPrimitiveAttributeNumber extends NamedFunction3<[ObjectContent<CoreObjectType>, string, number]> {
	static override type() {
		return 'importPrimitiveAttributeNumber';
	}
	func(object: ObjectContent<CoreObjectType>, attribName: string, index: number): number {
		return corePrimitiveClassFactory(object).attribValue(object, index, attribName) as number;
	}
}
