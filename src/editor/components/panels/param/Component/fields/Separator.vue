<template lang='pug'>

	include /pug/mixins.pug

	doctype html

	.Field.Separator
		.horizontal-border

</template>

<script lang='coffee'>

	# mixins
	import Field from './Field'

	export default component =
		name: 'separator-field'
		mixins: [Field]

</script>

<style lang='sass'>

	.Field.Separator
		.horizontal-border
			height: 2px
			background-color: darkgray
			margin: 10px

</style>
