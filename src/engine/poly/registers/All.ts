import {CopRegister} from './Cop';
import {EventRegister} from './Event';
import {GlRegister} from './Gl';
import {MatRegister} from './Mat';
import {ObjRegister} from './Obj';
import {SopRegister} from './Sop';

import {POLY} from '../../Poly';

export class AllRegister {
	static run() {
		CopRegister.run(POLY);
		EventRegister.run(POLY);
		GlRegister.run(POLY);
		MatRegister.run(POLY);
		ObjRegister.run(POLY);
		SopRegister.run(POLY);
	}
}
