import {CoreString} from 'src/core/String'
import {Assert} from 'tests/Assert'

test('string timestamp', () => {
	Assert.equal(
		CoreString.timestamp_to_seconds('2018-09-28 10:44:32'),
		1538127872
	)

	Assert.equal(CoreString.seconds_to_timestamp(1538127872), '09:44:32')
})

test('string pluralize', () => {
	Assert.equal(CoreString.pluralize('node'), 'nodes')
	Assert.equal(CoreString.pluralize('nodes'), 'nodes')
})

test('string precision', () => {
	Assert.equal(CoreString.precision(12.7, 4), '12.7000')
	Assert.equal(CoreString.precision(12.75789465, 4), '12.7578')
	Assert.equal(CoreString.precision(12.0, 4), '12.0000')
	Assert.equal(CoreString.precision(12, 4), '12.0000')

	Assert.equal(CoreString.precision(12.52345, 6), '12.523450')
	Assert.equal(CoreString.precision(12.52345, 5), '12.52345')
	Assert.equal(CoreString.precision(12.52345, 4), '12.5234')
	Assert.equal(CoreString.precision(12.52345, 3), '12.523')
	Assert.equal(CoreString.precision(12.52345, 2), '12.52')
	Assert.equal(CoreString.precision(12.52345, 1), '12.5')
	Assert.equal(CoreString.precision(12.52345, 0), '12')
	Assert.equal(CoreString.precision(12.52345, -1), '12')

	Assert.equal(CoreString.precision(12.5, -2), '12')
	Assert.equal(CoreString.precision(12.56, -2), '12')
})

test('string match_mask', () => {
	Assert.ok(CoreString.match_mask('abc', 'a*'))
	Assert.notOk(CoreString.match_mask('abc', 'e*'))
})

test('string attrib_names', () => {
	Assert.deepEqual(CoreString.attrib_names('position, normal'), [
		'position',
		'normal',
	])
	Assert.deepEqual(CoreString.attrib_names('position,normal'), [
		'position',
		'normal',
	])
	Assert.deepEqual(CoreString.attrib_names('position,   normal'), [
		'position',
		'normal',
	])
	Assert.deepEqual(CoreString.attrib_names('position,		  normal'), [
		'position',
		'normal',
	])
	Assert.deepEqual(CoreString.attrib_names('  position  ,		  normal  '), [
		'position',
		'normal',
	])
	Assert.deepEqual(CoreString.attrib_names('position,normal,'), [
		'position',
		'normal',
	])
})
test('string utils to_id', () => {
	Assert.equal(CoreString.to_id('ab'), 1068)
	Assert.equal(CoreString.to_id('ba'), 1077)

	Assert.equal(CoreString.to_id('a'), 97)
	Assert.equal(CoreString.to_id('b'), 98)
	Assert.equal(CoreString.to_id('c'), 99)
	Assert.equal(CoreString.to_id('e'), 101)
	Assert.equal(CoreString.to_id('bb'), 1078)
	Assert.equal(CoreString.to_id('cab'), 10968)
	Assert.equal(CoreString.to_id('auniqueid'), 10991758250)
	Assert.equal(CoreString.to_id('auniqueid'), 10991758250)
	Assert.equal(CoreString.to_id('anotherid'), 10923753550)
	Assert.equal(CoreString.to_id('Clerkenwell Rd'), 118330371044)
	Assert.equal(CoreString.to_id('אליהו בן חור'), 1661326144322)
})

test('string increment name', () => {
	Assert.equal(CoreString.increment('a'), 'a1')
	Assert.equal(CoreString.increment('a12_11'), 'a12_12')
	Assert.equal(CoreString.increment('a1211'), 'a1212')
	Assert.equal(CoreString.increment('attrib_create'), 'attrib_create1')
	Assert.equal(CoreString.increment('attrib_create1'), 'attrib_create2')
	Assert.equal(CoreString.increment('attrib_create2'), 'attrib_create3')
	Assert.equal(CoreString.increment('attrib_create3'), 'attrib_create4')
	Assert.equal(CoreString.increment('attrib_create4'), 'attrib_create5')
	Assert.equal(CoreString.increment('attrib_create5'), 'attrib_create6')
	Assert.equal(CoreString.increment('attrib_create6'), 'attrib_create7')
	Assert.equal(CoreString.increment('attrib_create7'), 'attrib_create8')
	Assert.equal(CoreString.increment('attrib_create8'), 'attrib_create9')
	Assert.equal(CoreString.increment('attrib_create9'), 'attrib_create10')
	Assert.equal(CoreString.increment('attrib_create10'), 'attrib_create11')
	Assert.equal(CoreString.increment('attrib_create11'), 'attrib_create12')
	Assert.equal(CoreString.increment('attrib_create12'), 'attrib_create13')
	Assert.equal(CoreString.increment('attrib_create13'), 'attrib_create14')
	Assert.equal(CoreString.increment('attrib_create14'), 'attrib_create15')
	Assert.equal(CoreString.increment('attrib_create15'), 'attrib_create16')
	Assert.equal(CoreString.increment('attrib_create16'), 'attrib_create17')
	Assert.equal(CoreString.increment('attrib_create17'), 'attrib_create18')
	Assert.equal(CoreString.increment('attrib_create18'), 'attrib_create19')
	Assert.equal(CoreString.increment('attrib_create19'), 'attrib_create20')
	Assert.equal(CoreString.increment('attrib_create20'), 'attrib_create21')
	Assert.equal(CoreString.increment('attrib_create21'), 'attrib_create22')
	Assert.equal(CoreString.increment('attrib_create22'), 'attrib_create23')
	Assert.equal(CoreString.increment('attrib_create23'), 'attrib_create24')
	Assert.equal(CoreString.increment('attrib_create24'), 'attrib_create25')
	Assert.equal(CoreString.increment('attrib_create25'), 'attrib_create26')
	Assert.equal(CoreString.increment('attrib_create26'), 'attrib_create27')
	Assert.equal(CoreString.increment('attrib_create27'), 'attrib_create28')
	Assert.equal(CoreString.increment('attrib_create28'), 'attrib_create29')
	Assert.equal(CoreString.increment('attrib_create29'), 'attrib_create30')
	Assert.equal(CoreString.increment('attrib_create30'), 'attrib_create31')
	Assert.equal(CoreString.increment('attrib_create31'), 'attrib_create32')
	Assert.equal(CoreString.increment('attrib_create32'), 'attrib_create33')
})

test('indices', () => {
	Assert.deepEqual(CoreString.indices('1'), [1])
	Assert.deepEqual(CoreString.indices('1,2'), [1, 2])
	Assert.deepEqual(CoreString.indices('1,2 4-6'), [1, 2, 4, 5, 6])
})
