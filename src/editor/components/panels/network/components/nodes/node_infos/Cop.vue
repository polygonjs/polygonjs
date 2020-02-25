<template lang="pug">

	include /mixins.pug

	doctype html

	.NetworkNodeInfoCop(
		)

		.node_info_cop_section.inline.resolution(v-if = 'resolution')
			.node_info_cop_section_title resolution:
			.node_info_cop_section_content
				span {{resolution}}
		.node_info_cop_section
			canvas(ref = 'canvas')



</template>

<script lang="ts">
import Vue from 'vue';
import {BaseCopNodeType} from 'src/engine/nodes/cop/_Base';
import {StoreController} from '../../../../../../store/controllers/StoreController';
import {Texture} from 'three/src/textures/Texture';
import {DataTexture} from 'three/src/textures/DataTexture';

interface CopInfoProps {
	graph_node_id: string;
}

import {defineComponent, ref, onMounted} from '@vue/composition-api';
import {CoreMath} from '../../../../../../../core/math/_Module';
export default defineComponent({
	name: 'network_node_info_cop',
	props: {
		graph_node_id: {
			type: String,
		},
	},

	setup(props: CopInfoProps) {
		const node = StoreController.engine.node(props.graph_node_id)! as BaseCopNodeType;
		const resolution = ref<Number2>([0, 0]);
		const canvas = ref<HTMLCanvasElement | null>(null);

		onMounted(() => {
			compute_node();
		});

		async function compute_node() {
			const container = await node.request_container();

			const texture = container.core_content();
			console.log('texture', texture, container.resolution());

			const res = container.resolution();
			Vue.set(resolution.value, 0, res[0]);
			Vue.set(resolution.value, 1, res[1]);

			draw_texture_on_canvas(texture);
		}

		function draw_texture_on_canvas(texture: Texture) {
			if (canvas.value) {
				if (texture instanceof DataTexture) {
					draw_data_texture(canvas.value, texture);
				} else {
					draw_texture(canvas.value, texture);
				}
			}
		}
		function draw_data_texture(canvas: HTMLCanvasElement, texture: DataTexture) {
			const image_data = texture.image;
			canvas.width = image_data.width;
			canvas.height = image_data.height;
			const context = canvas.getContext('2d') as CanvasRenderingContext2D;
			const image_data_ctx = context.createImageData(image_data.width, image_data.height);

			let mult = 1;
			if (image_data.data instanceof Float32Array) {
				mult = 255;
			}

			image_data_ctx.data.values;
			for (let i = 0; i < image_data_ctx.data.length; i++) {
				const new_val = CoreMath.clamp(image_data.data[i] * mult, 0, 255);
				image_data_ctx.data[i] = new_val;
			}
			context.putImageData(image_data_ctx, 0, 0);
		}

		function draw_texture(canvas: HTMLCanvasElement, texture: Texture) {
			const image_data = texture.image;
			canvas.width = image_data.width;
			canvas.height = image_data.height;
			const context = canvas.getContext('2d') as CanvasRenderingContext2D;
			context.drawImage(image_data, 0, 0);
		}

		return {
			resolution,
			canvas,
		};
	},
});
</script>

<style lang="sass">

@import "globals.sass"

$color_table_border: black

.NetworkNodeInfoCop

	.bbox_infos
		table
			margin-top: 10px
			td
				border: 1px solid $color_table_border
				text-align: center
				padding: 0px 5px
				&.number
					white-space: nowrap
			// tr.odd

	.node_info_cop_section
		white-space: nowrap
		&.inline
			.node_info_cop_section_title
				display: inline-block
				margin-right: 5px
			.node_info_cop_section_content
				display: inline-block
	canvas
		max-width: 512px
		border: 1px solid lightgrey
</style>
