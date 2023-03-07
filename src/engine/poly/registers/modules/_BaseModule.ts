import {ModuleName} from './Common';
// import {ModulesMap} from './_BaseRegister';

export interface BaseModule<M extends ModuleName> {
	moduleName: M;
	// abstract module(): ModulesMap[M];
	onRegister: () => void;
}
