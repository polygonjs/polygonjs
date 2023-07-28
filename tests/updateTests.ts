const fs = require('fs');
const path = require('path');

async function main() {
	const testsContent = fs.readFileSync(path.join(__dirname, 'tests.ts'), 'utf8');
	const lines = testsContent.split('\n');
	let count = 0;
	for (const line of lines) {
		if (line.includes('import')) {
			count++;
			console.log(line);
		}
	}
	console.log(count);
}

main();
