// commons/constants/color.ts

// Commerce Color Palette
export const commerceColors = {
  primary: {
    main: "#000000", // Brand color
    dark: "#23262F", // Neutral/05/100%
    light: "#23262F",
  },
  background: {
    default: "#FFFFFF", // White
    paper: "#FEFEFE",
    light: "#F3F5F7",
    neutral: {
      "01-100": "#FEFEFE", // Neutral/01/100%
      "01-95": "#FEFEFEF2", // Neutral/01/95%
      "02-100": "#F4F5F7", // Neutral/02/100%
      "03-100": "#E8EDEF", // Neutral/03/100%
    },
  },
  text: {
    primary: "#000000", // Brand color
    secondary: "#23262F", // Neutral/05/100%
    tertiary: "#6C7275", // Neutral/04/100%
    disabled: "#6C727580", // Neutral/04/50%
    inverse: "#FFFFFF",
  },
  neutral: {
    "01": {
      "100": "#FEFEFE", // Neutral/01/100%
      "95": "#FEFEFEF2", // Neutral/01/95%
      "20": "#FEFEFE33", // Neutral/01/20%
      "10": "#FEFEFE1A", // Neutral/01/10%
    },
    "02": {
      "100": "#F4F5F7", // Neutral/02/100%
      "50": "#F4F5F780", // Neutral/02/50%
    },
    "03": {
      "100": "#E8EDEF", // Neutral/03/100%
      "75": "#E8ECEFBF", // Neutral/03/75%
      "50": "#E8EDEF80", // Neutral/03/50%
    },
    "04": {
      "100": "#6C7275", // Neutral/04/100%
      "75": "#6C7275BF", // Neutral/04/75%
      "50": "#6C727580", // Neutral/04/50%
      "25": "#6C727540", // Neutral/04/25%
      "15": "#6C727526", // Neutral/04/15%
    },
    "05": {
      "100": "#23262F", // Neutral/05/100%
      "50": "#23262F80", // Neutral/05/50%
    },
    "06": {
      "100": "#23262F", // Neutral/06/100%
      "95": "#23262FF2", // Neutral/06/95%
      "90": "#23262FE6", // Neutral/06/90%
      "50": "#23262F80", // Neutral/06/50%
    },
    "07": {
      "100": "#141718", // Neutral/07/100%
      "95": "#141718F2", // Neutral/07/95%
      "50": "#14171880", // Neutral/07/50%
    },
  },
  semantic: {
    success: "#38CB89", // Green
    warning: "#FFAB00", // Yellow
    error: "#FF5630", // Red
    info: "#3772FF", // Blue
  },
  grey: {
    "50": "#E8E8E8", // Foundation /Grey/grey-50
    "100": "#B6B7B7", // Foundation /Grey/grey-100
    "200": "#939496", // Foundation /Grey/grey-200
    "300": "#626464", // Foundation /Grey/grey-300
    "400": "#43444A", // Foundation /Grey/grey-400
    "500": "#141718", // Foundation /Grey/grey-500
    "600": "#12151A", // Foundation /Grey/grey-600
    "700": "#0E1011", // Foundation /Grey/grey-700
    "800": "#0B0D0D", // Foundation /Grey/grey-800
    "900": "#080A0A", // Foundation /Grey/grey-900
  },
} as const;

// Admin Color Palette
export const adminColors = {
  primary: {
    main: "#000000", // Brand color
    dark: "#141718",
    light: "#23262F",
  },
  background: {
    default: "#FFFFFF", // White
    paper: "#FEFEFE",
    light: "#F3F5F7",
    gray: "#99A1AF", // Gray Chateau - 어드민 전용
    neutral: {
      "01-100": "#FEFEFE", // Neutral/01/100%
      "01-95": "#FEFEFEF2", // Neutral/01/95%
      "02-100": "#F4F5F7", // Neutral/02/100%
      "03-100": "#E8EDEF", // Neutral/03/100%
    },
    athensGray: "#F9FAFB", // Athens Gray
    athensGrayAlt: "#F3F5F7", // Athens Gray-64169
  },
  text: {
    primary: "#000000",
    secondary: "#141718",
    tertiary: "#6C7275", // Neutral/04/100%
    disabled: "#6C727580", // Neutral/04/50%
    inverse: "#FFFFFF",
    stormGray: "#717182", // Storm Gray
    paleSky: "#6A7282", // Pale Sky
  },
  neutral: {
    "01": {
      "100": "#FEFEFE", // Neutral/01/100%
      "95": "#FEFEFEF2", // Neutral/01/95%
      "20": "#FEFEFE33", // Neutral/01/20%
      "10": "#FEFEFE1A", // Neutral/01/10%
    },
    "02": {
      "100": "#F4F5F7", // Neutral/02/100%
      "50": "#F4F5F780", // Neutral/02/50%
    },
    "03": {
      "100": "#E8EDEF", // Neutral/03/100%
      "75": "#E8ECEFBF", // Neutral/03/75%
      "50": "#E8EDEF80", // Neutral/03/50%
    },
    "04": {
      "100": "#6C7275", // Neutral/04/100%
      "75": "#6C7275BF", // Neutral/04/75%
      "50": "#6C727580", // Neutral/04/50%
      "25": "#6C727540", // Neutral/04/25%
      "15": "#6C727526", // Neutral/04/15%
    },
    "05": {
      "100": "#23262F", // Neutral/05/100%
      "50": "#23262F80", // Neutral/05/50%
    },
    "06": {
      "100": "#23262F", // Neutral/06/100%
      "95": "#23262FF2", // Neutral/06/95%
      "90": "#23262FE6", // Neutral/06/90%
      "50": "#23262F80", // Neutral/06/50%
    },
    "07": {
      "100": "#141718", // Neutral/07/100%
      "95": "#141718F2", // Neutral/07/95%
      "50": "#14171880", // Neutral/07/50%
    },
  },
  semantic: {
    success: "#38CB89", // Green
    warning: "#FFAB00", // Yellow
    error: "#FF5630", // Red
    info: "#3772FF", // Blue
    selectiveYellow: "#F0B100", // Selective Yellow
    dodgerBlue: "#4D49FC", // Dodger Blue
    blueRibbon: "#155DFB", // Blue Ribbon
  },
  grey: {
    "50": "#E8E8E8", // Foundation /Grey/grey-50
    "100": "#B6B7B7", // Foundation /Grey/grey-100
    "200": "#939496", // Foundation /Grey/grey-200
    "300": "#626464", // Foundation /Grey/grey-300
    "400": "#43444A", // Foundation /Grey/grey-400
    "500": "#141718", // Foundation /Grey/grey-500
    "600": "#12151A", // Foundation /Grey/grey-600
    "700": "#0E1011", // Foundation /Grey/grey-700
    "800": "#0B0D0D", // Foundation /Grey/grey-800
    "900": "#080A0A", // Foundation /Grey/grey-900
    G50: "#E8E8E8", // Foundation /Grey/G50
    G75: "#9FA0A0", // Foundation /Grey/G75
    G100: "#77787A", // Foundation /Grey/G100
    G200: "#3C3E3F", // Foundation /Grey/G200
    G300: "#141718", // Foundation /Grey/G300
    G400: "#0E1011", // Foundation /Grey/G400
    G500: "#0C0E0F", // Foundation /Grey/G500
  },
  codGray: "#0A0A0A", // Cod Gray
  mineShaft: "#2C2C2C", // Mine Shaft
  mercury: "#E6E6E6", // Mercury
  wildSand: "#F5F5F5", // Wild Sand
} as const;
