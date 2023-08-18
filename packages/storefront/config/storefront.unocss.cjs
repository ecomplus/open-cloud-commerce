const deepmerge = require('@fastify/deepmerge')();
const {
  defineConfig,
  presetUno,
  presetIcons,
  presetTypography,
  transformerCompileClass,
  transformerDirectives,
} = require('unocss');
const {
  genTailwindConfig,
  defaultThemeOptions,
  brandColors,
  brandColorsPalletes,
  onBrandColors,
} = require('./storefront.tailwind.cjs');

const colorCSSVars = {};
Object.keys(brandColors).forEach((colorName) => {
  Object.keys(brandColorsPalletes[colorName]).forEach((tone) => {
    const cssRGB = brandColorsPalletes[colorName][tone];
    const colorLabel = tone === 'DEFAULT' ? colorName : `${colorName}-${tone}`;
    colorCSSVars[`rgb-${colorLabel}`] = cssRGB.substring(4).replace(')', ''); // rgb(rgb) -> rgb
    if (!/\d/.test(tone)) {
      colorCSSVars[`c-${colorLabel}`] = cssRGB;
      colorCSSVars[`c-on-${colorLabel}`] = onBrandColors[colorLabel];
    }
  });
});
Object.keys(onBrandColors).forEach((colorLabel) => {
  const cssRGB = onBrandColors[colorLabel];
  const [colorName] = colorLabel.split('-');
  const colorCSSVar = Object.keys(colorCSSVars).find((varName) => {
    return `rgb(${colorCSSVars[varName]})` === cssRGB
      && new RegExp(`${colorName}-\\d`).test(varName);
  });
  if (colorCSSVar) {
    colorCSSVars[`rgb-on-${colorLabel}`] = colorCSSVar;
  } else {
    colorCSSVars[`rgb-on-${colorLabel}`] = cssRGB.startsWith('rgb')
      ? cssRGB.substring(4).replace(')', '')
      : cssRGB.replace('--c-', '--rgb-');
  }
});

const genUnoCSSConfig = (_tailwindConfig) => {
  const themeOptions = _tailwindConfig?.themeOptions || {};
  const {
    preflights = [{
      getCSS: () => {
        const strCSSVars = Object.entries(colorCSSVars)
          .map(([varName, value]) => `--${varName}:${value};`)
          .join(' ');
        return `:root { ${strCSSVars} }`;
      },
    }],
  } = deepmerge(defaultThemeOptions, themeOptions);
  const tailwindConfig = _tailwindConfig || genTailwindConfig(themeOptions);
  const rules = [];
  const shortcuts = [];
  tailwindConfig.plugins?.forEach((plugin) => {
    plugin({
      addUtilities: (utilities) => {
        Object.keys(utilities).forEach((s) => {
          /* Skip icons, custom UI and prose selectors
          added on tailwind.config.cjs only for IntelliSense */
          if (s.startsWith('.i-')) {
            const {
              '--collection': iconset,
              '--icon': icon,
            } = utilities[s];
            shortcuts.push({ [`i-${icon}`]: `i-${iconset}:${icon}` });
          } else if (!s.startsWith('.ui-') && !s.includes('prose')) {
            rules.push([s.replace('.', ''), utilities[s]]);
          }
        });
      },
    });
  });
  const theme = tailwindConfig.theme.extend;
  return defineConfig({
    preflights,
    rules,
    shortcuts,
    theme: {
      ...theme,
      colors: {
        ...theme.colors,
        // Generate runtime themeable brand colors utilities with CSS vars
        ...Object.keys(brandColors).reduce((colors, colorName) => {
          colors[colorName] = {};
          Object.keys(brandColorsPalletes[colorName]).forEach((tone) => {
            const colorLabel = tone === 'DEFAULT' ? colorName : `${colorName}-${tone}`;
            colors[colorName][tone] = `rgb(var(--rgb-${colorLabel}))`;
          });
          return colors;
        }, {}),
        on: Object.keys(onBrandColors).reduce((onColors, colorLabel) => {
          return {
            ...onColors,
            [colorLabel]: `rgb(var(--rgb-on-${colorLabel}))`,
          };
        }, {}),
      },
    },
    transformers: [
      transformerDirectives(),
      transformerCompileClass(),
    ],
    presets: [
      presetUno(),
      presetIcons({
        extraProperties: {
          display: 'inline-block',
          'vertical-align': 'middle',
          'margin-bottom': '0.22rem',
        },
      }),
      presetTypography(),
    ],
  });
};

exports.genUnoCSSConfig = genUnoCSSConfig;
exports.colorCSSVars = colorCSSVars;
