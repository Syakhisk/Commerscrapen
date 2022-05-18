import { scrollPageToBottom } from "puppeteer-autoscroll-down";
import puppeteer from "puppeteer-core";
import config from "./config.js";
import { scrape } from "./utils/scrape.js";
import { createRequire } from "module";
import { setTimeout } from "timers/promises";

import { writeFile } from "fs/promises";

const require = createRequire(import.meta.url);
const sitemapTokopedia = require("./sitemaps/parsed/tokopedia.json");
const sitemapShopee = require("./sitemaps/parsed/shopee.json");
const sitemapBukalapak = require("./sitemaps/parsed/bukalapak.json");

const sitemaps = {
  tokopedia: sitemapTokopedia,
  shopee: sitemapShopee,
  bukalapak: sitemapBukalapak,
};

const pptr_cfg = {
  headless: true,
  executablePath: "/usr/bin/google-chrome-stable",
  // devtools: true,
  // args: ["--force-device-scale-factor=0.3"],
  args: ["--start-maximized"],
};

(async () => {
  const keyword = "kipas";

  // const browser = await puppeteer.launch(pptr_cfg);
  const cfg = config();

  const targets = Object.keys(cfg);
  const browsers = {};
  const pages = [];


  for (let target of targets) {
    console.log("Launching browser for", target);
    browsers[target] = await puppeteer.launch({
      ...pptr_cfg,
      userDataDir: `./datadir/${target}`,
    });
  }

  async function scraping(target) {
    const _ = {};
    const log = (msg) => console.log(`[${target}] ${msg}`);

    try {
      let page = await browsers[target].newPage();
      log("setting up page");
      page = await setupPage(page);

      log("visiting url");
      await page.goto(cfg[target].url(keyword), { waitUntil: "networkidle2" });
      log("scrolling");

      await autoScroll(page);
      log("done");

      // await setTimeout(2000);
      log("waiting for network idle");
      const pageAvailable = await page
        .waitForNetworkIdle()
        .catch(() => null)
        .then(() => true);

      if (!pageAvailable) {
        log("timeout reached");
        browsers[target].close();
        return;
      }

      log("network has idled");

      const data = await page.evaluate(scrape, sitemaps[target]);

      const found = data.length;

      const nonNull = data.filter((i) =>
        Object.values(i).every((j) => j == null)
      ).length;

      log(`found: ${found} | null: ${nonNull}`);

      await handleFinished(target, data);

      _.target = target;
      _.page = page;

      pages.push(_);

      browsers[target].close();
    } catch (e) {
      console.log("something went wrong");
    }
  }

  Promise.all(targets.map((target) => scraping(target)));
})();

async function handleFinished(target, data) {
  await writeFile(
    `./results/${target}.json`,
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

async function setupPage(page) {
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36"
  );

  await page.setViewport({ width: 1920, height: 1080 });

  // function noConsole() {
  //   window.console = null;
  // }
  // await page.addScriptTag({ content: `${noConsole}` });

  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const rtype = req.resourceType();

    // const blockedrtype = ["image", "media", "font", "stylesheet", "ping"];
    const blockedrtype = ["ping"];

    if (blockedrtype.includes(rtype)) return req.abort();

    req.continue();
  });

  return page;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 300;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        document.querySelector("html").scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  });
}
