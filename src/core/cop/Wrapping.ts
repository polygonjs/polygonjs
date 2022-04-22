import {ClampToEdgeWrapping, RepeatWrapping, MirroredRepeatWrapping} from 'three';
import {PolyDictionary} from '../../types/GlobalTypes';

export const WRAPPINGS: PolyDictionary<number>[] = [{ClampToEdgeWrapping}, {RepeatWrapping}, {MirroredRepeatWrapping}];
