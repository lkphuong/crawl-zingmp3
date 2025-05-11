const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const path = require("path");
const slugify = require("slugify");

const singer =
  "#body-scroll > div.container > div.container.page-search > div.container.mar-t-30 > div > div:nth-child(1) > div > div.media-left > div.card-info > h3";
const playSong =
  "div > div.media-left > div.song-thumb > div.zm-actions-container > div > button.zm-btn.action-play.button";
const playKaraoke =
  "#root > div.zm-section.zm-layout.has-player > div.zm-section.now-playing-bar > div.player-controls.clickable > div > div.player-controls-right.level-right > div:nth-child(2) > button";

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

    await sleep(5000);
    console.log("Page opened successfully:", url);
    // Wait for and close the popup if it appears
    try {
      await page.mouse.click(100, 100);
    } catch (e) {
      console.log("No popup found or failed to close popup.");
    }

    // await sleep(5000);

    // Wait for the first song in the "Bài Hát" section
    await page.waitForSelector(playSong, { timeout: 5000 });
    await page.click(playSong);
    console.log("Clicked on the first song in the 'Bài Hát' section.");

    // Get the text content of the first song's title
    const artistNames = await page.evaluate(() => {
      const item = document.querySelector(
        ".list-item.media-item.hide-right.full-left"
      );
      if (!item) return null;

      const artistLinks = item.querySelectorAll("h3.subtitle a.is-ghost");
      return Array.from(artistLinks).map((el) => el.textContent.trim());
    });
    console.log("Artist Names:", artistNames.join(", "));

    // Wait for the player controls to load
    await page.waitForSelector(playKaraoke, {
      timeout: 10000,
    });

    // await sleep(5000);

    // Click the play/pause button
    await page.click(playKaraoke);
    console.log("Clicked play/pause button.");

    // Monitor network requests without enabling request interception
    page.on("response", async (response) => {
      const reqUrl = response.url();
      if (reqUrl.endsWith(".lrc")) {
        console.log("LRC File URL:", reqUrl);
        try {
          // Get the text content of the .lrc file
          const lrcContent = await response.text();

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

const songName = "thu cuối";
openZingMp3Search(songName);
