# Auxiliary Gutter & Wireway Sizing Calculator

A web-based calculator for determining the minimum auxiliary gutter and wireway size per NEC (National Electrical Code) requirements.

🔗 **[Live Demo](https://jelloshooter848.github.io/gutter-sizing-calc/)**

## Features

- **NEC Compliant Calculations**: Based on NEC 366.22 (20% fill rule) and 312.6(A) for bending space requirements
- **Multiple Conductor Support**: Add multiple conductor types and quantities
- **Real-time Calculations**: Instant results as you input conductor specifications
- **Standard Size Recommendations**: Provides standard gutter/wireway dimensions
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## How to Use

1. Open `index.html` in your web browser
2. Select conductor size (AWG/kcmil) from the dropdown
3. Enter the quantity of conductors
4. Add additional conductors using the "Add Conductor" button if needed
5. Click "Calculate" to see the results

## Calculations

The calculator performs the following calculations:

- **Total Conductor Area**: Sum of all conductor cross-sectional areas
- **Minimum Cross-Sectional Area**: Based on 20% fill rule (total area ÷ 0.2)
- **Minimum Bending Space**: Largest bending space requirement from all conductors
- **Recommended Size**: Standard gutter/wireway size that meets all requirements

## Technical Details

- Uses NEC Table 5 conductor areas for THHN/THWN insulation
- Implements NEC Table 312.6(A) bending space requirements
- Supports conductor sizes from 16 AWG to 600 kcmil
- Provides warnings for custom sizes exceeding 24x24 inches

## Important Notes

- Calculations assume THHN/THWN insulation type
- If more than 30 current-carrying conductors are present, they must be derated per NEC 310.15
- Splices/taps must be accessible and cannot exceed 75% of cross-sectional volume per NEC 366.56/376.56
- Always consult local electrical codes and a qualified electrician for final installations

## Browser Compatibility

This calculator works in all modern web browsers and requires no additional dependencies or server setup.