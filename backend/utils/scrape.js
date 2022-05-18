export function scrape(sitemap) {
  function countShopeeStars(wrapper) {
    if (!wrapper) return null;

    let rating = 0;
    const litSelector = ".shopee-rating-stars__lit";
    const stars = Array.from(wrapper.querySelectorAll(litSelector));
    for (let star of stars) {
      rating += +(star.style.width.replace("%", "") / 100).toFixed(2);
    }

    return rating;
  }

  const { source } = sitemap;

  const selectorType = {
    SelectorText: "innerText",
    SelectorImage: "src",
    SelectorLink: "href",
  };

  const data = [];

  const products = document.querySelectorAll(sitemap.productWrapper.selector);

  Array.from(products).forEach((e) => {
    const product = {};
    for (let id in sitemap) {
      if (id == "productWrapper") continue;
      if (id == "source") continue;

      const currentProps = sitemap[id];

      const element = currentProps
        ? e.querySelector(currentProps.selector)
        : null;

      product[id] = element ? element[selectorType[currentProps.type]] : null;

      if (source == "shopee") {
        // convert html rating to numerical
        if (id == "rating") {
          product.rating = countShopeeStars(element);
          continue;
        }

        // convert price range to array
        if (id == "price" && product[id]?.includes(" - ")) {
          product[id] = product[id].split(" - ");
          continue;
        }
      }

      if (!product[id]) continue;

      // trim new line
      if (currentProps.type == "SelectorText") product[id] = product[id].trim();

      // convert rating to number
      if (id == "rating") product[id] = +product[id];

      // remove "Terjual"
      if (id == "sold")
        product[id] = product[id].replace(/terjual/i, "").trim();
    }

    data.push(product);
  });

  return data;
}
