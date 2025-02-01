const GAP_COLUMN_VALUES = ['column-gap', 'grid-column-gap'];
const GAP_VALUES = ['gap', 'grid-gap', ...GAP_COLUMN_VALUES];
const [GAP, COLUMN_GAP, GRID_GAP, GRID_COLUMN_GAP] = GAP_VALUES;

const hasDisplayGrid = (nodes) => (
  !!nodes.some((node) => node.prop === 'display' && node.value === 'grid')
);

const hasGapZero = (nodes) => (
  !!nodes.some((node) => GAP_VALUES.includes(node.prop) && node.value === '0')
);

const hasFlexWrap = (nodes) => (
  !!nodes.some((node) => node.prop === 'flex-flow' && node.value.includes('wrap'))
);


const modifyGapProp = (decl) => {
  const parentNodes = decl.parent.nodes;
  if (
    hasDisplayGrid(parentNodes)
    || hasGapZero(parentNodes)
    || hasFlexWrap(parentNodes)
  ) return;
  decl.parent.after(`${decl.parent.selector} > * + * { margin-left: ${decl.value}; }`);
};

module.exports = () => {
  return {
    postcssPlugin: 'flexbox-gap-polyfill',
    Declaration: {
      [GAP]: modifyGapProp,
      [COLUMN_GAP]: modifyGapProp,
      [GRID_GAP]: modifyGapProp,
      [GRID_COLUMN_GAP]: modifyGapProp
    }
  }
}

module.exports.postcss = true
