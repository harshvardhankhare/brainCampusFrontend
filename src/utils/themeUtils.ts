const generateShades = (hex) => {
  const adjust = (color, percent) => {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt((R * (100 + percent)) / 100);
    G = parseInt((G * (100 + percent)) / 100);
    B = parseInt((B * (100 + percent)) / 100);

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    const RR = R.toString(16).padStart(2, "0");
    const GG = G.toString(16).padStart(2, "0");
    const BB = B.toString(16).padStart(2, "0");
    return `#${RR}${GG}${BB}`;
  };

  return {
    "--brand-50": adjust(hex, 90),
    "--brand-100": adjust(hex, 75),
    "--brand-200": adjust(hex, 50),
    "--brand-300": adjust(hex, 25),
    "--brand-400": adjust(hex, 10),
    "--brand-500": hex,
    "--brand-600": adjust(hex, -15),
    "--brand-700": adjust(hex, -30),
    "--brand-800": adjust(hex, -45),
  };
};
export const applySavedTheme = () => {
  const savedTheme = localStorage.getItem("app-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  const savedColor = localStorage.getItem("brand-color");
  if (savedColor) {
    const shades = generateShades(savedColor);
    Object.entries(shades).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }
};
export { generateShades };