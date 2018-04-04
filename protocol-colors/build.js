const fs = require('fs');
const colors = require('./colors/protocol-colors.json');
const metadata = require('./package.json');
const colorArray = [];

const jsLicense = `/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
`;
const xmlLicense = `<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at http://mozilla.org/MPL/2.0/. -->
`;
const shLicense = `# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
`;

function getRgb(value) {
  const r = parseInt(value.substr(1, 2), 16);
  const g = parseInt(value.substr(3, 2), 16);
  const b = parseInt(value.substr(5, 2), 16);
  return {r,g,b};
}

function toHex(value) {
  return ('0' + Math.floor(value / 100 * 255).toString(16).split('.')[0]).substr(-2);
}

// Colors
function createColor(color, element, format) {
  const rv = [];

  for (const variant in element) {
    if (element.hasOwnProperty(variant)) {
      const value = element[variant];
      const alias = value.map;
      rv.push(format.formatter(color, variant, value.hex, '100', value.map));
      for (let alpha of value.opacity || []) {
        let out = format.formatter(color, variant, value.hex, alpha, value.map);
        if (out) {
          rv.push(out);
        }
      }
    }
  }
  if (format.group_end === undefined) {
    format.group_end = '\n';
  }
  if (format.group_end) {
    rv.push(format.group_end);
  }
  return rv;
}

const formats = {
  'android': {
    'folder': 'colors',
    'output': [`<?xml version="1.0" encoding="utf-8"?>\n\n${xmlLicense}\n<resources>\n    <!-- Protocol Color Palette v${metadata.version} -->\n`],
    'formatter': (color, variant, value, alpha, alias) => {
      if (alpha != '100') {
        value = '#' + toHex(alpha) + value.substr(1);
        if(typeof alias !== "undefined") {
          if (variant == 'default') {
            return `    <color name="${color}_a${alpha}">${value}</color>\n    <color name="${alias}_a${alpha}">${value}</color>\n`
          } else {
            return `    <color name="${color}_${variant}_a${alpha}">${value}</color>\n    <color name="${alias}_a${alpha}">${value}</color>\n`
          }
        } else {
          if (variant == 'default') {
            return `    <color name="${color}_a${alpha}">${value}</color>\n`
          } else {
            return `    <color name="${color}_${variant}_a${alpha}">${value}</color>\n`
          }
        }
      } else {
        if(typeof alias !== "undefined") {
          if (variant == 'default') {
            return `    <color name="${color}">${value}</color>\n    <color name="${alias}">${value}</color>\n`
          } else {
            return `    <color name="${color}_${variant}">${value}</color>\n    <color name="${alias}">${value}</color>\n`
          }
        } else {
          if (variant == 'default') {
            return `    <color name="${color}">${value}</color>\n`
          } else {
            return `    <color name="${color}_${variant}">${value}</color>\n`
          }
        }
      }
    },
    'ext': 'android.xml',
    'footer': '</resources>'
  },
  'css': {
    'folder': 'colors',
    'output': [`${jsLicense}\n/* Protocol Colors CSS Variables v${metadata.version} */\n\n:root {\n`],
    'formatter': (color, variant, value, alpha, alias) => {
      if(typeof alias !== "undefined") {
        if (alpha == '100') {
          if (variant == 'default') {
            return `  --${color}: ${value};\n  --${alias}: ${value};\n`;
          } else {
            return `  --${color}-${variant}: ${value};\n  --${alias}-${variant}: ${value};\n`;
          }
        } else {
          const {r,g,b} = getRgb(value);
          if (variant == 'default') {
            return `  --${color}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n  --${alias}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n`;
          } else {
            return `  --${color}-${variant}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n  --${alias}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n`;
          }
        }
      } else {
        if (alpha == '100') {
          if (variant == 'default') {
            return `  --${color}: ${value};\n`;
          } else {
            return `  --${color}-${variant}: ${value};\n`;
          }
        } else {
          const {r,g,b} = getRgb(value);
          if (variant == 'default') {
            return `  --${color}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n`;
          } else {
            return `  --${color}-${variant}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n`;
          }
        }
      }
    },
    'footer': '}\n',
    'ext': 'css'
  },
  'gimp': {
    'folder': 'colors',
    'output': [`GIMP Palette\nName: Protocol Colors\n${shLicense}\n# Protocol Colors GPL Color Palette v${metadata.version}\n# ${metadata.homepage}\n\n`],
    'formatter': (color, variant, value, alpha, alias) => {
      if (alpha == '100') {
        color = color.charAt(0).toUpperCase() + color.slice(1);
        variant = variant.charAt(0).toUpperCase() + variant.slice(1);
        const {r,g,b} = getRgb(value);
        if(typeof alias !== "undefined") {
          alias = alias.charAt(0).toUpperCase() + alias.slice(1);
          if (variant == 'Default') {
            return `${r} ${g} ${b} ${color}\n${r} ${g} ${b} ${alias}\n`;
          } else {
            return `${r} ${g} ${b} ${color} ${variant}\n${r} ${g} ${b} ${alias}\n`;
          }
        } else {
          if (variant == 'Default') {
            return `${r} ${g} ${b} ${color}\n`;
          } else {
            return `${r} ${g} ${b} ${color} ${variant}\n`;
          }
        }
      }
    },
    'ext': 'gpl'
  },
  'ios': {
    'folder': 'colors',
    'output': [`${jsLicense}\n/* Protocol Colors iOS Variables v${metadata.version}\n   From ${metadata.homepage} */\n\nextension UIColor {\n    struct Protocol {\n`],
    'formatter': (color, variant, value, alpha, alias) => {
      color = color[0].toUpperCase() + color.substr(1);
      if (alpha != '100') {
        value = `rgba: 0x${value.substr(1) + toHex(alpha)}`;
        if(typeof alias !== "undefined") {
          alias = alias[0].toUpperCase() + alias.substr(1);
          if (variant == 'default') {
            return `        static let ${color}A${alpha} = UIColor(${value})\n        static let ${alias}A${alpha} = UIColor(${value})\n`;
          } else {
            return `        static let ${color}${variant}A${alpha} = UIColor(${value})\n        static let ${alias}A${alpha} = UIColor(${value})\n`;
          }
        } else {
          if (variant == 'default') {
            return `        static let ${color}A${alpha} = UIColor(${value})\n`;
          } else {
            return `        static let ${color}${variant}A${alpha} = UIColor(${value})\n`;
          }
        }
      } else {
        value = `rgb: 0x${value.substr(1)}`;
        if(typeof alias !== "undefined") {
          alias = alias[0].toUpperCase() + alias.substr(1);
          if (variant == 'default') {
            return `        static let ${color} = UIColor(${value})\n        static let ${alias} = UIColor(${value})\n`;
          } else {
            return `        static let ${color}${variant} = UIColor(${value})\n        static let ${alias} = UIColor(${value})\n`;
          }
        } else {
          if (variant == 'default') {
            return `        static let ${color} = UIColor(${value})\n`;
          } else {
            return `        static let ${color}${variant} = UIColor(${value})\n`;
          }
        }
      }
    },
    'ext': 'swift',
    'footer': '  }\n}'
  },
  'js': {
    'folder': 'colors',
    'output': [`${jsLicense}\n/* Protocol Colors JS Variables v${metadata.version} */\n\n`],
    'formatter': (color, variant, value, alpha, alias) => {
      if (alpha != '100') {
        value = value + toHex(alpha);
        if(typeof alias !== "undefined") {
          if (variant == 'default') {
            return `exports.${color.toUpperCase()}_A${alpha} = '${value}';\nexports.${alias.toUpperCase()}_A${alpha} = '${value}';\n`;
          } else {
            return `exports.${color.toUpperCase()}_${variant.toUpperCase()}_A${alpha} = '${value}';\nexports.${alias.toUpperCase()}_A${alpha} = '${value}';\n`;
          }
        } else {
          if (variant == 'default') {
            return `exports.${color.toUpperCase()}_A${alpha} = '${value}';\n`;
          } else {
            return `exports.${color.toUpperCase()}_${variant.toUpperCase()}_A${alpha} = '${value}';\n`;
          }
        }
      } else {
        if(typeof alias !== "undefined") {
          if (variant == 'default') {
            return `exports.${color.toUpperCase()} = '${value}';\nexports.${alias.toUpperCase()} = '${value}';\n`;
          } else {
            return `exports.${color.toUpperCase()}_${variant.toUpperCase()} = '${value}';\nexports.${alias.toUpperCase()} = '${value}';\n`;
          }
        } else {
          if (variant == 'default') {
            return `exports.${color.toUpperCase()} = '${value}';\n`;
          } else {
            return `exports.${color.toUpperCase()}_${variant.toUpperCase()} = '${value}';\n`;
          }
        }
      }
    },
    'ext': 'js'
  },
  'less': {
    'folder': 'colors',
    'output': [`${jsLicense}\n/* Protocol Colors Less Variables v${metadata.version} */\n\n`],
    'formatter': (color, variant, value, alpha, alias) => {
      if(typeof alias !== "undefined") {
        if (alpha == '100') {
          if (variant == 'default') {
            return `@color-${color}: ${value};\n@color-${alias}: ${value};\n`;
          } else {
            return `@color-${color}-${variant}: ${value};\n@color-${color}-${variant}: ${value};\n`;
          }
        } else {
          const {r,g,b} = getRgb(value);
          if (variant == 'default') {
            return `@color-${color}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n@color-${alias}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n`;
          } else {
            return `@color-${color}-${variant}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n@color-${alias}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n`;
          }
        }
      } else {
        if (alpha == '100') {
          if (variant == 'default') {
            return `@color-${color}: ${value};\n`;
          } else {
            return `@color-${color}-${variant}: ${value};\n`;
          }
        } else {
          const {r,g,b} = getRgb(value);
          if (variant == 'default') {
            return `@color-${color}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n`;
          } else {
            return `@color-${color}-${variant}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n`;
          }
        }
      }
    },
    'ext': 'less'
  },
  'libreoffice': {
    'folder': 'colors',
    'output': [`<?xml version="1.0" encoding="UTF-8"?>\n${xmlLicense}\n<ooo:color-table\n  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"\n  xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"\n  xmlns:xlink="http://www.w3.org/1999/xlink"\n  xmlns:svg="http://www.w3.org/2000/svg"\n  xmlns:ooo="http://openoffice.org/2004/office">\n<!-- Protocol Color Palette v${metadata.version} -->\n\n`],
    'formatter': (color, variant, value, alpha, alias) => {
      if(typeof alias !== "undefined") {
        if (alpha == '100') {
          if (variant == 'default') {
            return `  <draw:color draw:name="${color}" draw:color="${value}" />\n  <draw:color draw:name="${alias}" draw:color="${value}" />\n`;
          } else {
            return `  <draw:color draw:name="${color}-${variant}" draw:color="${value}" />\n  <draw:color draw:name="${alias}" draw:color="${value}" />\n`;
          }
        }
      } else {
        if (alpha == '100') {
          if (variant == 'default') {
            return `  <draw:color draw:name="${color}" draw:color="${value}" />\n`;
          } else {
            return `  <draw:color draw:name="${color}-${variant}" draw:color="${value}" />\n`;
          }
        }
      }
    },
    'ext': 'soc',
    'footer': '</ooo:color-table>'
  },
  'sass': {
    'folder': 'colors',
    'output': [`${jsLicense}\n/* Protocol Colors SCSS Variables v${metadata.version} */\n\n`],
    'formatter': (color, variant, value, alpha, alias) => {
      const {r,g,b} = getRgb(value);
      if(typeof alias !== "undefined") {
        if (variant == 'default') {
          if (alpha == '100') {
            return `$color-${color}: ${value};\n$color-${alias}: ${value};\n`;
          } else {
            return `$color-${color}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n$color-${alias}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n`;
          }
        } else if (alpha == '100') {
            return `$color-${color}-${variant}: ${value};\n$color-${alias}: ${value};\n`;
        } else {
          return `$color-${color}-${variant}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n$color-${alias}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n`;
        }
      } else {
        if (variant == 'default') {
          if (alpha == '100') {
            return `$color-${color}: ${value};\n`;
          } else {
            return `$color-${color}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n`;
          }
        } else if (alpha == '100') {
            return `$color-${color}-${variant}: ${value};\n`;
        } else {
          return `$color-${color}-${variant}-a${alpha}: rgba(${r}, ${g}, ${b}, ${alpha/100});\n`;
        }
      }
    },
    'ext': 'scss'
  }
}

for (const color in colors) {
  const element = colors[color];
  for (const key in formats) {
    const format = formats[key];
    format.output.push(...createColor(color, element, format));
  }
}

// output key/value formats to files
for (let key in formats) {
  const format = formats[key];
  if (format.footer) {
    format.output.push(format.footer);
  }
  let out_func = format.outputter;
  if (!out_func) {
    out_func = (data) => data.join('');
  }
  fs.writeFile(`${format.folder}/protocol-colors.${format.ext}`, out_func(format.output), 'utf8', (err) => {
    if (err) throw err;
  });
}
