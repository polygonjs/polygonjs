import {onGsapModuleRegister} from '../../../../../core/thirdParty/gsap/gsapModule';
import {ModuleName} from '../Common';
import {BaseModule} from '../_BaseModule';

const GSAPModule: BaseModule<ModuleName.GSAP> = {
	moduleName: ModuleName.GSAP,
	// module: cadModule,
	onRegister: onGsapModuleRegister,
};
export {GSAPModule};
