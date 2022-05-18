import { readFile, writeFile } from "fs/promises";
import config from "../config.js";
import path from "path";

const transform = (data) => {
  data = JSON.parse(data);
  const find = (data, id) => data.selectors.find((e) => e.id == id);

  const props = {
    productWrapper: find(data, "product-wrapper"),
    thumbnailUrl: find(data, "thumbnail"),
    location: find(data, "location"),
    name: find(data, "name"),
    price: find(data, "price"),
    rating: find(data, "rating"),
    store: find(data, "store"),
    sold: find(data, "sold"),
    link: find(data, "link"),
  };

  const out = {};
  for (let prop in props) {
    out[prop] = {
      selector: props[prop].selector,
      type: props[prop].type,
      isWrapper: prop == "productWrapper",
    };
  }

  return out;
};

(async () => {
  const root = path.join(path.resolve(), "sitemaps");
  const inputDir = path.join(root, "original");
  const outputDir = path.join(root, "parsed");

  const cfg = config();

  for (let target in cfg) {
    const filename = cfg[target].filename;
    const filepath = path.resolve(inputDir, filename);
    console.info(`[Info] reading ${filename} to ${inputDir}`);
    const data = await readFile(`${filepath}`, "utf8").catch(() => null);
    if (!data) continue;

    console.info(`[Info] transforming json...`);
    const transformed = transform(data);

    transformed.source = target;

    console.info(`[Info] writing ${filename} to ${outputDir}`);
    await writeFile(
      path.resolve(outputDir, filename),
      JSON.stringify(transformed, null, 2),
      "utf8"
    );
  }
})();
