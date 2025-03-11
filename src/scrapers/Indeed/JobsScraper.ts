import puppeteer from "puppeteer";
import { ScrapedJob } from "../../Contracts/IJobs";

async function scrapeJobs(url: string, pages: number): Promise<ScrapedJob[]> {
  const browser = await puppeteer.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Wait for job cards to load
  await page.waitForSelector("li.css-1ac2h1w.eu4oa1w0");

  const jobs = await page.$$eval(
    "li.css-1ac2h1w.eu4oa1w0 div.cardOutline.tapItem",
    (cards) => {
      return cards.map((card) => {
        const title =
          card
            .querySelector("h2.jobTitle a.jcs-JobTitle")
            ?.textContent?.trim() || "";
        const url =
          card
            .querySelector("h2.jobTitle a.jcs-JobTitle:href")
            ?.textContent?.trim() || "";

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

  await browser.close();
  return jobs;
}

export default scrapeJobs;
