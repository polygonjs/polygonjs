// This function is of course very very basic and probably will never remove ts types from here
// So this is just a tiny helper
export function removeTypes(code: string) {
	return code.replace(/:\sCoreGroup\[\]/g, '').replace(/override\s/g, '');
}
