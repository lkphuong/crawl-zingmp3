const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const path = require("path");
const slugify = require("slugify");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function openZingMp3Search(songName) {
  const url =
    "https://zingmp3.vn/tim-kiem/tat-ca?q=" + encodeURIComponent(songName);

  // Launch a new browser instance
  const browser = await puppeteer.launch({
    headless: false,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });

  try {
    // Open a new page
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(url, { waitUntil: "networkidle2" });

    console.log("Page opened successfully:", url);
    await sleep(5000);

    // Wait for and close the popup if it appears
    try {
      await page.waitForSelector(
        "#root > div.promotion-home-popup-container > div > button",
        { timeout: 5000 }
      );
      await page.click(
        "#root > div.promotion-home-popup-container > div > button"
      );
      console.log("Popup closed.");
    } catch (e) {
      console.log("No popup found or failed to close popup.");
    }

    // await sleep(5000);

    // Wait for the first song in the "Bài Hát" section
    await page.waitForSelector(
      ".container.mar-t-30 .list-item.media-item.hide-right.full-left .action-play",
      { timeout: 50000 }
    );
    // await sleep(5000);

    // Get the text content of the first song's title
    // const firstSongArtists = await page.evaluate(() => {
    //   const firstSongElement = document.querySelector(
    //     ".container.mar-t-30 .list-item.media-item.hide-right.full-left .subtitle"
    //   );
    //   if (!firstSongElement) return [];
    //   const artistLinks = firstSongElement.querySelectorAll("a.is-ghost");
    //   return Array.from(artistLinks).map((link) => link.textContent.trim());
    // });
    // console.log("First song artists:", firstSongArtists.join(", "));

    // Click the play button of the first song
    await page.click(
      ".container.mar-t-30 .list-item.media-item.hide-right.full-left .action-play"
    );
    console.log("Clicked on the first song in the 'Bài Hát' section.");

    // await sleep(5000);

    // Wait for the player controls to load
    await page.waitForSelector(
      "#root > div.zm-section.zm-layout.has-player > div.zm-section.now-playing-bar > div.player-controls.clickable > div > div.player-controls-right.level-right > div:nth-child(2) > button",
      { timeout: 50000 }
    );

    // await sleep(5000);

    // Click the play/pause button
    await page.click(
      "#root > div.zm-section.zm-layout.has-player > div.zm-section.now-playing-bar > div.player-controls.clickable > div > div.player-controls-right.level-right > div:nth-child(2) > button"
    );
    console.log("Clicked play/pause button.");

    // Monitor network requests without enabling request interception
    page.on("response", async (response) => {
      const reqUrl = response.url();
      if (reqUrl.endsWith(".lrc")) {
        console.log("LRC File URL:", reqUrl);
        try {
          // Get the text content of the .lrc file
          const lrcContent = await response.text();
          console.log("LRC Content Preview:", lrcContent.slice(0, 100)); // Log first 100 chars

          // Generate a safe filename from the URL or song name
          const fileName = `${slugify(songName)}.lrc`;
          const filePath = path.join(__dirname, "lyrics", fileName);

          // Ensure the lyrics directory exists
          await fs.mkdir(path.join(__dirname, "lyrics"), { recursive: true });

          // Save the .lrc file
          await fs.writeFile(filePath, lrcContent);
          console.log(`LRC file saved to: ${filePath}`);
        } catch (error) {
          console.error("Failed to process .lrc file:", error);
        }
      }
    });

    await sleep(5000); // Wait to capture network requests
  } catch (error) {
    console.error("Error opening the page:", error);
  } finally {
    // Close the browser
    await browser.close();
  }
}

const songName = "không phải dạng vừa đâu";
openZingMp3Search(songName);
