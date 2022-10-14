import {BaseGlNodeType} from '../_Base';

interface SDFSmoothUtilsOption {
	node: BaseGlNodeType;
	vars: {
		sdf0: string;
		sdf1: string;
		sdfContext: string;
		smooth: boolean;
		matBlendDist: string;
		smoothFactor: string;
	};
	functionNames: {
		smooth: string;
		default: string;
	};
	bodyLines: string[];
}

export function sdfSmoothLines(options: SDFSmoothUtilsOption) {
	const {node, vars, bodyLines, functionNames} = options;
	const {sdfContext, sdf0, sdf1, smooth, matBlendDist, smoothFactor} = vars;
	const functionNameSmooth = functionNames.smooth;
	const functionNameNonSmooth = functionNames.default;
	const side = node.glVarName('side');
	const matId = node.glVarName('matId');
	const matId2 = node.glVarName('matId2');
	const d = node.glVarName('d');
	const setSide = `bool ${side} = ${sdf0}.d < ${sdf1}.d`;
	const setMatId = `int ${matId} = ${side} ? ${sdf0}.matId : ${sdf1}.matId`;
	const setMatId2 = `int ${matId2} = ${side} ? ${sdf1}.matId : ${sdf0}.matId`;
	bodyLines.push(setSide);
	bodyLines.push(setMatId);
	bodyLines.push(setMatId2);
	if (smooth) {
		const matBlend = node.glVarName('matBlend');
		const dist = node.glVarName('dist');
		const halfBlendDist = node.glVarName('halfBlendDist');
		const setHalfBlendDist = `float ${halfBlendDist} = ${matBlendDist} * 0.5`;
		const setDist = `float ${dist} = ${sdf0}.d - ${sdf1}.d`;
		const setMatBlend = `float ${matBlend} = smoothstep(-${halfBlendDist},${halfBlendDist}, ${dist})`;
		const setMatBlend2 = `${matBlend} = ${dist} > 0. ? 1.0-${matBlend} : ${matBlend}`;
		const setDistance = `float ${d} = ${functionNameSmooth}(${sdf0}.d, ${sdf1}.d, ${smoothFactor})`;
		const withSmooth = `SDFContext(${d}, 0, ${matId}, ${matId2}, ${matBlend})`;
		bodyLines.push(setDist);
		bodyLines.push(setHalfBlendDist);
		bodyLines.push(setMatBlend);
		bodyLines.push(setMatBlend2);
		bodyLines.push(setDistance);
		bodyLines.push(`SDFContext ${sdfContext} = ${withSmooth}`);
	} else {
		const setDistance = `float ${d} = ${functionNameNonSmooth}(${sdf0}.d, ${sdf1}.d)`;
		const withoutSmooth = `SDFContext(${d}, 0, ${matId}, ${matId}, 0.)`;
		bodyLines.push(setDistance);
		bodyLines.push(`SDFContext ${sdfContext} = ${withoutSmooth}`);
	}
}
