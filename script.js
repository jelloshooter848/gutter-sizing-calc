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
    '14': 0.0097,
    '12': 0.0133,
    '10': 0.0211,
    '8': 0.03666,
    '6': 0.0507,
    '4': 0.0824,
    '3': 0.0973,
    '2': 0.1158,
    '1': 0.1562,
    '1/0': 0.1855,
    '2/0': 0.2223,
    '3/0': 0.2679,
    '4/0': 0.3237,
    '250': 0.3970,
    '300': 0.4608,
    '350': 0.5242,
    '400': 0.5863,
    '500': 0.7073,
    '600': 0.8676,
    '700': 0.9887,
    '750': 1.0496,
    '800': 1.1085,
    '900': 1.2311,
    '1000': 1.3478

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
        document.getElementById('recommendedSize').textContent = `>24" custom size required`;
        warningDiv.classList.remove('hidden');
    } else {
        document.getElementById('recommendedSize').textContent = `${recommendedSize}x${recommendedSize} minimum gutter size recommended`;
        warningDiv.classList.add('hidden');
    }
}

// Modal functions for conductor table
function showConductorTable() {
    document.getElementById('conductorTableModal').classList.remove('hidden');
}

function closeConductorTable() {
    document.getElementById('conductorTableModal').classList.add('hidden');
}

// Reset calculator function
function resetCalculator() {
    // Reset to single conductor row with default values matching the original HTML structure
    const conductorsDiv = document.getElementById('conductorInputs');
    conductorsDiv.innerHTML = `
        <div class="conductor-entry grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded">
            <div>
                <label class="block text-sm font-medium text-gray-700">Conductor Size (AWG/kcmil)</label>
                <select class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="16" selected>16 AWG</option>
                    <option value="14">14 AWG</option>
                    <option value="12">12 AWG</option>
                    <option value="10">10 AWG</option>
                    <option value="8">8 AWG</option>
                    <option value="6">6 AWG</option>
                    <option value="4">4 AWG</option>
                    <option value="3">3 AWG</option>
                    <option value="2">2 AWG</option>
                    <option value="1">1 AWG</option>
                    <option value="1/0">1/0 AWG</option>
                    <option value="2/0">2/0 AWG</option>
                    <option value="3/0">3/0 AWG</option>
                    <option value="4/0">4/0 AWG</option>
                    <option value="250">250 kcmil</option>
                    <option value="300">300 kcmil</option>
                    <option value="350">350 kcmil</option>
                    <option value="400">400 kcmil</option>
                    <option value="500">500 kcmil</option>
                    <option value="600">600 kcmil</option>
                    <option value="700">700 kcmil</option>
                    <option value="750">750 kcmil</option>
                    <option value="800">800 kcmil</option>
                    <option value="900">900 kcmil</option>
                    <option value="1000">1000 kcmil</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Quantity</label>
                <input type="number" min="1" value="1" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            </div>
            <div class="flex items-end">
                <button onclick="removeConductor(this)" class="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">Remove</button>
            </div>
        </div>
    `;
    
    // Hide results section
    document.getElementById('results').classList.add('hidden');
}