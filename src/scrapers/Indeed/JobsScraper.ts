import puppeteer from "puppeteer-core";
import { ScrapedJob } from "../../Contracts/IJobs";

async function scrapeJobs(
  baseURL: string,
  pages: number
): Promise<ScrapedJob[]> {
  const browser = await puppeteer.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    await page.setViewport({ width: 1366, height: 768 });

    const allJobs: ScrapedJob[] = [];

    for (let pageNum = 0; pageNum < pages; pageNum++) {
      const url = `${baseURL}&start=${pageNum * 10}`;
    //   await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      await Promise.race([
        page.waitForSelector('li.css-1ac2h1w.eu4oa1w0', { timeout: 60000 }),
        page.waitForSelector('.no_results', { timeout: 60000 })
      ]);


      const pageJobs = await page.$$eval(
        "li.css-1ac2h1w.eu4oa1w0 div.cardOutline.tapItem",
        (cards) => {
          return cards.map((card) => {
            const title =
              card
                .querySelector("h2.jobTitle a.jcs-JobTitle")
                ?.textContent?.trim() || "";
            const url = `https://uk.indeed.com/${card
              .querySelector("h2.jobTitle a.jcs-JobTitle")
              ?.getAttribute("href")
              ?.trim()}`;

            const company =
              card
                .querySelector('[data-testid="company-name"]')
                ?.textContent?.trim() || "";
            const location =
              card
                .querySelector('[data-testid="text-location"]')
                ?.textContent?.trim() || "";
            const salary =
              card
                .querySelector('[data-testid="attribute_snippet_testid"]')
                ?.textContent?.trim() || "";

            return {
              title,
              company,
              location,
              url,
              salary,
              date: "",
            };
          });
        }
      );
      allJobs.push(...pageJobs);
      await new Promise((resolve) =>
        setTimeout(resolve, 2000 + Math.random() * 3000)
      );
    }
    return allJobs;
  } catch (error) {
    console.error("Scraping failed:", error);
    return [];
  } finally {
    await browser.close();
  }
}

export default scrapeJobs;

