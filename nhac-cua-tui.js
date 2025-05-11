const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Bắt tất cả các yêu cầu mạng
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    // Lọc các yêu cầu thuộc loại "media"
    if (request.resourceType() === "media") {
      console.log("Media API:", request.url());
      // Ghi lại các thông tin khác nếu cần
      console.log("Headers:", request.headers());
    }
    request.continue();
  });

  // Truy cập website
  await page.goto(
    "https://www.nhaccuatui.com/bai-hat/ky-si-va-anh-sao-dong-nhi.ubpVbNRSvJ4k.html",
    { waitUntil: "networkidle2" }
  );

  await browser.close();
})();
