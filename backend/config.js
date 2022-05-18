export default function () {
  const config = {
    //-----------
    tokopedia: {
      "product-count": 80,
      filename: "tokopedia.json",
      url: (keyword) => {
        const url = new URL("https://www.tokopedia.com/search");
        const params = {
          st: "product",
          q: keyword,
        };

        Object.keys(params).forEach((e) => {
          url.searchParams.append(e, params[e]);
        });

        return url.href;
      },
    },
    //-----------
    bukalapak: {
      "product-count": 50,
      filename: "bukalapak.json",
      url: (keyword) => {
        const url = new URL("https://www.bukalapak.com/products");
        const params = {
          "search[keywords]": keyword,
        };

        Object.keys(params).forEach((e) => {
          url.searchParams.append(e, params[e]);
        });

        return url.href;
      },
    },
    //-----------
    shopee: {
      "product-count": 60,
      filename: "shopee.json",
      url: (keyword) => {
        const url = new URL("https://shopee.co.id/search");
        const params = {
          // keyword: encodeURI(keyword),
          keyword: keyword,
        };

        Object.keys(params).forEach((e) => {
          url.searchParams.append(e, params[e]);
        });

        return url.href;
      },
    },
  };

  return config;
}
