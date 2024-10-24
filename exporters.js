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
	const doc = new window.jspdf.jsPDF();
	const margin = 20;
	let yPosition = margin;

	doc.setFontSize(20);
	doc.text('Color Palette Report', margin, yPosition);
	yPosition += 20;

	colorData.forEach(([color, data], index) => {
		// Convert RGB string to numbers
		const rgbValues = color.match(/\d+/g).map(Number);

		// Draw color rectangle
		doc.setFillColor(rgbValues[0], rgbValues[1], rgbValues[2]);
		doc.rect(margin, yPosition, 30, 30, 'F');

		// Add color information
		doc.setFontSize(12);
		doc.text(
			[
				`Color ${index + 1}`,
				`HEX: ${rgbToHex(color)}`,
				`RGB: ${color}`,
				`Usage Count: ${data.count}`,
				`Used as: ${Array.from(data.types).join(', ')}`,
			],
			margin + 40,
			yPosition + 5
		);

		yPosition += 40;

		// Add new page if needed
		if (yPosition > 250) {
			doc.addPage();
			yPosition = margin;
		}
	});

	doc.save('color-palette.pdf');
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
	// ASE file structure constants
	const SIGNATURE = 'ASEF';
	const VERSION_MAJOR = 1;
	const VERSION_MINOR = 0;
	const COLOR_START = 0x0001;
	const COLOR_RGB = 'RGB ';

	// Calculate total buffer size
	const headerSize = 12; // Signature(4) + Version(4) + Blocks(4)
	const totalSize = colorData.reduce((size, [color, data]) => {
		const name = `Color-${data.count}`;
		return size + (14 + name.length * 2 + 12); // Block header + name + RGB values
	}, headerSize);

	const buffer = new ArrayBuffer(totalSize);
	const dv = new DataView(buffer);
	let offset = 0;

	// Write header
	SIGNATURE.split('').forEach((char, i) => {
		dv.setUint8(offset + i, char.charCodeAt(0));
	});
	offset += 4;

	dv.setUint16(offset, VERSION_MAJOR);
	offset += 2;
	dv.setUint16(offset, VERSION_MINOR);
	offset += 2;
	dv.setUint32(offset, colorData.length);
	offset += 4;

	// Write color blocks
	colorData.forEach(([color, data]) => {
		const name = `Color-${data.count}`;
		const rgb = color.match(/\d+/g).map((n) => parseFloat(n) / 255);

		// Block start marker
		dv.setUint16(offset, COLOR_START);
		offset += 2;

		// Block length
		const blockLength = 6 + name.length * 2 + 12; // Header + name + RGB values
		dv.setUint32(offset, blockLength);
		offset += 4;

		// Color name length and Unicode string
		dv.setUint16(offset, name.length + 1);
		offset += 2;
		name.split('').forEach((char) => {
			dv.setUint16(offset, char.charCodeAt(0));
			offset += 2;
		});
		dv.setUint16(offset, 0); // Null terminator
		offset += 2;

		// Color model signature
		COLOR_RGB.split('').forEach((char) => {
			dv.setUint8(offset, char.charCodeAt(0));
			offset += 1;
		});

		// RGB values as float32
		rgb.forEach((value) => {
			dv.setFloat32(offset, value);
			offset += 4;
		});
	});

	downloadFile(
		'palette.ase',
		new Uint8Array(buffer),
		'application/octet-stream'
	);
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
