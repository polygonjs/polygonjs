import {AttribValue} from '../../../types/GlobalTypes';

export type AttributeReactiveCallback<V extends AttribValue> = (proxy: AttributeProxy<V>) => void;

export interface AttributeProxy<V extends AttribValue> {
	value: V;
	previousValue: V;
	// callbackRanAtFrame: number;
}
