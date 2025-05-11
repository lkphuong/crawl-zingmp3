import asyncio
import os
from pyppeteer import launch
from slugify import slugify
from urllib.parse import quote

async def open_zingmp3_search(song_name):
    url = f"https://zingmp3.vn/tim-kiem/tat-ca?q={quote(song_name)}"

    # Launch a new browser instance
    browser = await launch(
        headless=False,
        executablePath="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    )

    try:
        # Open a new page
        page = await browser.newPage()

        # Navigate to the URL
        await page.goto(url, waitUntil="networkidle2")
        print(f"Page opened successfully: {url}")

        # Wait for and close the popup if it appears
        try:
            await page.waitForSelector(
                "#root > div.promotion-home-popup-container > div > button",
                timeout=5000,
                visible=True
            )
            await page.click(
                "#root > div.promotion-home-popup-container > div > button",
                delay=100
            )
            print("Popup closed.")
        except Exception as e:
            print(f"No popup found or failed to close popup: {e}")

        # Wait for the first song in the "Bài Hát" section
        try:
            await page.waitForSelector(
                ".container.mar-t-30 .list-item.media-item.hide-right.full-left .action-play",
                timeout=10000,
                visible=True
            )
        except Exception as e:
            print(f"Failed to find first song play button: {e}")
            # Log page content for debugging
            content = await page.content()
            print(f"Page HTML (first 500 chars): {content[:500]}")
            raise

        # Get the text content of the first song's artists
        first_song_artists = await page.evaluate('''() => {
            const firstSongElement = document.querySelector(
                ".container.mar-t-30 .list-item.media-item.hide-right.full-left .subtitle"
            );
            if (!firstSongElement) return [];
            const artistLinks = firstSongElement.querySelectorAll("a.is-ghost");
            return Array.from(artistLinks).map(link => link.textContent.trim());
        }''')
        print(f"First song artists: {', '.join(first_song_artists)}")

        # Click the play button of the first song
        try:
            await page.click(
                ".container.mar-t-30 .list-item.media-item.hide-right.full-left .action-play",
                delay=100
            )
            print("Clicked on the first song in the 'Bài Hát' section.")
        except Exception as e:
            print(f"Failed to click first song play button: {e}")
            raise

        # Wait for the player controls to load
        try:
            await page.waitForSelector(
                "#root > div.zm-section.zm-layout.has-player > div.zm-section.now-playing-bar > div.player-controls.clickable > div > div.player-controls-right.level-right > div:nth-child(2) > button",
                timeout=15000,
                visible=True
            )
        except Exception as e:
            print(f"Failed to find player controls: {e}")
            raise

        # Click the play/pause button
        try:
            await page.click(
                "#root > div.zm-section.zm-layout.has-player > div.zm-section.now-playing-bar > div.player-controls.clickable > div > div.player-controls-right.level-right > div:nth-child(2) > button",
                delay=100
            )
            print("Clicked play/pause button.")
        except Exception as e:
            print(f"Failed to click play/pause button: {e}")
            raise

        # Monitor network responses for .lrc files
        async def handle_response(response):
            req_url = response.url
            if req_url.endswith(".lrc"):
                print(f"LRC File URL: {req_url}")
                try:
                    # Get the text content of the .lrc file
                    lrc_content = await response.text()
                    print(f"LRC Content Preview: {lrc_content[:100]}")

                    # Generate a safe filename from the song name
                    file_name = f"{slugify(song_name)}.lrc"
                    file_path = os.path.join(os.getcwd(), "lyrics", file_name)

                    # Ensure the lyrics directory exists
                    os.makedirs(os.path.dirname(file_path), exist_ok=True)

                    # Save the .lrc file
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(lrc_content)
                    print(f"LRC file saved to: {file_path}")
                except Exception as error:
                    print(f"Failed to process .lrc file: {error}")

        page.on("response", handle_response)

        # Wait to capture network requests
        await asyncio.sleep(10)

    except Exception as error:
        print(f"Error opening the page: {error}")
        # Take a screenshot for debugging
        await page.screenshot({"path": "error_screenshot.png"})
        raise
    finally:
        # Close the browser
        await browser.close()

# Run the script
song_name = "thu cuối"
asyncio.run(open_zingmp3_search(song_name))