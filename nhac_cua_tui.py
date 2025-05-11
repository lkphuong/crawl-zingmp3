from playwright.sync_api import sync_playwright
import requests
import os
from urllib.parse import urlparse

# Thư mục để lưu file tải về
DOWNLOAD_DIR = "downloaded_media"
if not os.path.exists(DOWNLOAD_DIR):
    os.makedirs(DOWNLOAD_DIR)

def download_file(url, headers):
    """Tải file từ URL và lưu vào thư mục DOWNLOAD_DIR"""
    try:
        # Gửi yêu cầu GET tới URL với headers
        response = requests.get(url, headers=headers, stream=True)
        response.raise_for_status()  # Kiểm tra lỗi HTTP

        # Lấy tên file từ URL hoặc tạo tên mặc định
        parsed_url = urlparse(url)
        file_name = os.path.basename(parsed_url.path)
        if not file_name:
            file_name = "media_file_" + url.split("/")[-1] + ".mp3"  # Mặc định là .mp3, thay đổi nếu cần

        # Đường dẫn lưu file
        file_path = os.path.join(DOWNLOAD_DIR, file_name)

        # Lưu file
        with open(file_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        print(f"Downloaded: {file_path}")
    except requests.exceptions.RequestException as e:
        print(f"Error downloading {url}: {e}")

def main():
    # Lưu trữ các Media API
    media_urls = []

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Bắt các yêu cầu mạng
        def handle_request(route, request):
            if request.resource_type == "media":
                print(f"Media API: {request.url}")
                print(f"Headers: {request.headers}")
                # Lưu URL và headers để tải sau
                media_urls.append({"url": request.url, "headers": request.headers})
            route.continue_()

        page.route("**/*", handle_request)

        # Truy cập website
        page.goto(
            "https://www.nhaccuatui.com/bai-hat/mua-thang-sau-chi-dep-dap-gio-re-song-ft-thieu-bao-tram-ft-gil-le-ft-dj-mie-ft-duong-hoang-yen-ft-vu-ngoc-anh.dwOpsY8vdIwe.html",
            wait_until="networkidle"
        )

        browser.close()

    # Tải các file từ Media API
    for media in media_urls:
        download_file(media["url"], media["headers"])

if __name__ == "__main__":
    main()