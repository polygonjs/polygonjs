<template lang="pug">
	div
		h1 Hello Vue 3!
		button(@click="inc") Clicked {{ count }} times.
</template>

<script>
import {createComponent, ref} from '@vue/composition-api';

export default createComponent({
	name: 'activedesign-main',
	components: {},
	props: {},
	setup() {
		const count = ref(0);
		const inc = () => {
			count.value++;
		};

		return {
			count,
			inc,
		};
	},
});
</script>

<style scoped lang="sass">
img
	width: 200px

h1
	font-family: Arial, Helvetica, sans-serif
	font-size: 5rem
</style>
