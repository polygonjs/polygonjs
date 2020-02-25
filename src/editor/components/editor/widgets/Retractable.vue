<template lang="pug">

include /mixins.pug

doctype html

.Retractable.cell.shrink
	.grid-x(v-show = 'retracted')
		.retractable-toggler.horizontal(@click = 'toggle')
	.grid-x(v-show = '!retracted')
		.cell.shrink
			.retractable-toggler.vertical(@click = 'toggle')
		.cell.auto
			slot




</template>

<script lang="ts">
import {defineComponent, ref} from '@vue/composition-api';
export default defineComponent({
	name: 'retractable',

	setup() {
		const retracted = ref(false);
		function toggle() {
			retracted.value = !retracted.value;
		}

		return {
			retracted,
			toggle,
		};
	},
});
</script>

<style lang="sass">
@import "globals.sass"

.Retractable
	.retractable-toggler
		background-color: red
		cursor: pointer
		opacity: 0.5
		&:hover
			opacity: 1
		&.horizontal
			width: 100%
			height: 5px
		&.vertical
			width: 5px
			height: 100%
</style>
