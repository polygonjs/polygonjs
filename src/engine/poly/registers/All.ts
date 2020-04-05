import {CopRegister} from './Cop';
import {EventRegister} from './Event';
import {GlRegister} from './Gl';
import {MatRegister} from './Mat';
import {ObjRegister} from './Obj';
import {SopRegister} from './Sop';

import {Poly} from '../../Poly';

export class AllRegister {
	static run() {
		CopRegister.run(Poly.instance());
		EventRegister.run(Poly.instance());
		GlRegister.run(Poly.instance());
		MatRegister.run(Poly.instance());
		ObjRegister.run(Poly.instance());
		SopRegister.run(Poly.instance());
	}
}
