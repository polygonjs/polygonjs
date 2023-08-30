import {BasePrimitiveAttribute} from './PrimitiveAttribute';

export type PrimitiveAttributesDict = Record<string, BasePrimitiveAttribute>;

export interface UserDataWithPrimitiveAttributes {
	primAttributes?: PrimitiveAttributesDict;
}
