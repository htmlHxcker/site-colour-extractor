document.getElementById('exportFormat').addEventListener('change', (e) => {
	const format = e.target.value;
	if (!format) return;

	switch (format) {
		case 'css':
			exportAsCSS();
			break;
		case 'scss':
			exportAsSCSS();
			break;
		case 'tailwind':
			exportAsTailwind();
			break;
		case 'json':
			exportAsJSON();
			break;
		case 'pdf':
			exportAsPDF();
			break;
		case 'png':
			exportAsPNG();
			break;
		case 'ase':
			exportAsASE();
			break;
	}

	// Reset select to default after export
	e.target.value = '';
});

function exportAsCSS() {
	const cssContent = colorData
		.map(([color, data], index) => `  --color-${index + 1}: ${color};`)
		.join('\n');

	downloadFile('colors.css', `:root {\n${cssContent}\n}`);
}

function exportAsSCSS() {
	const scssContent = colorData
		.map(([color, data], index) => `$color-${index + 1}: ${color};`)
		.join('\n');

	downloadFile('colors.scss', scssContent);
}

function exportAsTailwind() {
	const colors = Object.fromEntries(
		colorData.map(([color, data], index) => [
			`color-${index + 1}`,
			rgbToHex(color),
		])
	);

	const config = {
		theme: {
			extend: {
				colors: colors,
			},
		},
	};

	downloadFile(
		'tailwind.config.js',
		`module.exports = ${JSON.stringify(config, null, 2)}`
	);
}

function exportAsJSON() {
	const colors = colorData.map(([color, data]) => ({
		color: color,
		hex: rgbToHex(color),
		hsl: rgbToHsl(color),
		usage: data.count,
		types: Array.from(data.types),
	}));

	downloadFile('colors.json', JSON.stringify(colors, null, 2));
}

function exportAsPDF() {
	import('jspdf').then(({ default: JsPDF }) => {
		const doc = new JsPDF();
		// Add color swatches and information
		colorData.forEach(([color, data], index) => {
			// Implementation for PDF generation
		});
		doc.save('color-palette.pdf');
	});
}

function exportAsPNG() {
	html2canvas(document.getElementById('colorGrid')).then((canvas) => {
		const link = document.createElement('a');
		link.download = 'color-palette.png';
		link.href = canvas.toDataURL();
		link.click();
	});
}

function exportAsASE() {
	// ASE file format implementation
	const aseData = generateASEFormat(colorData);
	downloadFile('colors.ase', aseData, 'application/octet-stream');
}

function downloadFile(filename, content, type = 'text/plain') {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
