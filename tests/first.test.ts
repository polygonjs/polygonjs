import {CoreObject} from '../src/core/Object'

class Dummy extends CoreObject {
	is_dummy() {
		return true
	}
}
class ExtendedDummy extends Dummy {
	is_extended_dummy() {
		return true
	}
}
class Dummy2 extends CoreObject {
	is_dummy() {
		return true
	}
}
class ExtendedDummy2 extends Dummy2 {
	is_extended_dummy2() {
		return true
	}
}

class Assert {
	static ok(statement: any) {
		expect(statement).toBeTruthy()
	}
	static notOk(statement: any) {
		expect(statement).not.toBeTruthy()
	}
}
// declare global {
// 	const assert = Assert
// }

test('adds 1 + 2 to equal 3', () => {
	expect(1 + 2).toBe(3)
	const extended_dummy = new ExtendedDummy()
	const extended_dummy2 = new ExtendedDummy2()
	Assert.ok(extended_dummy.is_a(Dummy))
	Assert.ok(extended_dummy2.is_a(Dummy2))
	Assert.notOk(extended_dummy.is_a(Dummy2))
	Assert.notOk(extended_dummy2.is_a(Dummy))
})
