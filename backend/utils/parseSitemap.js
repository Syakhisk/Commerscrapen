import { createRequire } from "module";

const require = createRequire(import.meta.url);
const sitemapTokped = require("../sitemaps/tokped.json");

const ids = [
  "product-wrapper",
  "name",
  "price",
  "thumbnail",
  "rating",
  "sold",
  "location",
  "store",
];

const vars = {
  sitemapTokped,
};

export function eval_tokped(sitemap) {
  const selectorType = {
    SelectorText: "innerText",
    SelectorImage: "src",
  };
  const { selectors } = sitemap;
  const productWrapperSel = selectors.find((e) => e.id == "product-wrapper");

  const productWrapperEl = productWrapperSel
    ? document.querySelectorAll(productWrapperSel.selector)
    : null;

  const data = [];

  Array.from(productWrapperEl).forEach((e) => {
    const product = {};

    const s = selectors.filter((e) =>
      e.parentSelectors.includes("product-wrapper")
    );

    s.forEach((f) => {
      const element = e.querySelector(f.selector);
      product[f.id] = element ? element[selectorType[f.type]] : null;
    });

    data.push(product);
  });

  return data;
}

export default {
  ...vars,
  ids,
};

// export default function () {
//   const select = document.querySelector;
//   const { selectors } = tokped;

//   const productWrapper = selectors.find(
//     (e) => e.id == "product-wrapper"
//   )?.selector;

//   const productWrapperEl =
//     (productWrapper.selector && select(productWrapper.selector)) || null;

//   return productWrapperEl
// }
