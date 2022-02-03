import sss_declaration_fragment from '../../../../gl/sss/declaration.glsl';
import sss_injected_fragment from '../../../../gl/sss/injected.glsl';

const USE_SSS = true;

export function includeSSSDeclarations(fragmentShader: string) {
	if (USE_SSS) {
		fragmentShader = fragmentShader.replace(
			/void main\s?\(\) {/,
			`${sss_declaration_fragment}

void main() {`
		);

		fragmentShader = fragmentShader.replace(
			'#include <lights_fragment_begin>',
			`#include <lights_fragment_begin>
${sss_injected_fragment}
`
		);
	}
	return fragmentShader;
}
