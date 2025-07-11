// Gutter & Wireway Sizing Calculator JavaScript

// File handling variables and functions
var gk_isXlsx = false;
var gk_xlsxFileLookup = {};
var gk_fileData = {};

function filledCell(cell) {
    return cell !== '' && cell != null;
}

function loadFileData(filename) {
    if (gk_isXlsx && gk_xlsxFileLookup[filename]) {
        try {
            var workbook = XLSX.read(gk_fileData[filename], { type: 'base64' });
            var firstSheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[firstSheetName];

            // Convert sheet to JSON to filter blank rows
            var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
            // Filter out blank rows (rows where all cells are empty, null, or undefined)
            var filteredData = jsonData.filter(row => row.some(filledCell));

            // Heuristic to find the header row by ignoring rows with fewer filled cells than the next row
            var headerRowIndex = filteredData.findIndex((row, index) =>
                row.filter(filledCell).length >= filteredData[index + 1]?.filter(filledCell).length
            );
            // Fallback
            if (headerRowIndex === -1 || headerRowIndex > 25) {
                headerRowIndex = 0;
            }

            // Convert filtered JSON back to CSV
            var csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex)); // Create a new sheet from filtered array of arrays
            csv = XLSX.utils.sheet_to_csv(csv, { header: 1 });
            return csv;
        } catch (e) {
            console.error(e);
            return "";
        }
    }
    return gk_fileData[filename] || "";
}

// Conductor area (sq in) per NEC Table 5 (THHN/THWN)
const conductorAreas = {
    '16': 0.0072,
    '14': 0.111,
    '12': 0.130,
    '10': 0.164,
    '8': 0.216,
    '6': 0.254,
    '4': 0.324,
    '3': 0.352,
    '2': 0.348,
    '1': 0.446,
    '1/0': 0.486,
    '2/0': 0.532,
    '3/0': 0.584,
    '4/0': 0.642,
    '250': 0.711,
    '300': 0.766,
    '350': 0.817,
    '400': 0.864,
    '500': 0.949,
    '600': 1.051,
    '700': 1.122,
    '750': 1.156,
    '800': 1.188,
    '900': 1.252,
    '1000': 1.310

};

// Bending space (inches) per NEC Table 312.6(A), 1 wire per terminal
const bendingSpace = {
    '16': 1.5,
    '14': 1.5,
    '12': 1.5,
    '10': 1.5,
    '8': 1.5,
    '6': 1.5,
    '4': 2,
    '3': 2,
    '2': 2.5,
    '1': 3,
    '1/0': 3.5,
    '2/0': 3.5,
    '3/0': 4,
    '4/0': 4,
    '250': 4.5,
    '300': 5,
    '350': 5,
    '400': 6,
    '500': 6,
    '600': 8,
    '700': 8,
    '750': 8,
    '800': 8,
    '900': 8,
    '1000': 10
};

function addConductor() {
    const template = document.querySelector('.conductor-entry').cloneNode(true);
    template.querySelector('input').value = '1';
    document.getElementById('conductorInputs').appendChild(template);
}

function removeConductor(button) {
    const entries = document.querySelectorAll('.conductor-entry');
    if (entries.length > 1) {
        button.closest('.conductor-entry').remove();
    }
}

function calculateSize() {
    let totalArea = 0;
    let maxBendingSpace = 0;

    const entries = document.querySelectorAll('.conductor-entry');
    entries.forEach(entry => {
        const size = entry.querySelector('select').value;
        const quantity = parseInt(entry.querySelector('input').value) || 0;
        totalArea += conductorAreas[size] * quantity;
        if (bendingSpace[size] > maxBendingSpace) {
            maxBendingSpace = bendingSpace[size];
        }
    });

    // 20% fill rule (NEC 366.22)
    const minCrossSection = totalArea / 0.2;
    const minDimension = Math.ceil(Math.sqrt(minCrossSection));

    // Minimum dimensions considering bending space
    const minSize = Math.max(minDimension, maxBendingSpace);

    // Find standard size (e.g., 4x4, 6x6, 8x8, 10x10, 12x12, 16x16, 20x20, 24x24)
    const standardSizes = [4, 6, 8, 10, 12, 16, 20, 24];
    let recommendedSize = standardSizes.find(size => size >= minSize) || 24;

    // Display results
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('hidden');
    document.getElementById('totalArea').textContent = `Total Conductor Area: ${totalArea} sq in`;
    document.getElementById('minCrossSection').textContent = `Minimum Cross-Sectional Area (20% fill): ${minCrossSection.toFixed(2)} sq in`;
    document.getElementById('minBendingSpace').textContent = `Minimum Bending Space: ${maxBendingSpace} inches`;

    // Update recommended size text and warning
    const warningDiv = document.getElementById('sizeWarning');
    if (minSize > 24) {
        document.getElementById('recommendedSize').textContent = `Recommended Gutter/Wireway Size: >24" (Custom size required)`;
        warningDiv.classList.remove('hidden');
    } else {
        document.getElementById('recommendedSize').textContent = `Recommended Gutter/Wireway Size: ${recommendedSize} x ${recommendedSize} inches`;
        warningDiv.classList.add('hidden');
    }
}