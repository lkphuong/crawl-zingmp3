# ZingMP3 Lyrics Crawler

A Node.js application that automatically extracts karaoke (LRC) lyrics files from ZingMP3 by searching for and playing songs.

## Description

This tool uses Puppeteer to automate the process of:
1. Searching for songs on ZingMP3
2. Playing the song
3. Activating karaoke mode
4. Capturing and downloading the LRC lyrics file

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

## Prerequisites

- Node.js (v14 or higher recommended)
- Google Chrome browser 
- An internet connection

## Usage

1. Edit the `songName` variable in [index.js](index.js) to search for your desired song:

```javascript
const songName = "your song name here";
```

2. Run the script:

```bash
node index.js
```

3. The script will:
   - Open a Chrome browser window
   - Search for the song on ZingMP3
   - Play the first matching song
   - Enable karaoke mode
   - Download the LRC file to the `lyrics` folder

## How It Works

The application uses Puppeteer to automate browser interaction and:
1. Navigates to ZingMP3's search page with your query
2. Clicks on the first song in the search results
3. Activates karaoke mode in the player
4. Intercepts the network request for the LRC file
5. Saves the file with a name based on the artist and song title

## File Structure

- `index.js` - Main application script
- `lyrics/` - Directory where downloaded LRC files are stored
- `package.json` - Project dependencies and configuration

## Dependencies

- [puppeteer](https://www.npmjs.com/package/puppeteer) - Headless Chrome browser automation
- [slugify](https://www.npmjs.com/package/slugify) - For creating clean filenames from song titles

## License

ISC