# DiscordFileServer

DiscordFileServer is a simple tool that allows you to host files up to 25MB on Discord's servers. It features Discord's anti-malware, a rolling URL fix, unique ID codes assigned to each file, and a web interface.

## License

This project is licensed under the [Your Name License](LICENSE). See the [LICENSE](LICENSE) file for details.

## Features

1. **Rolling URL Fix:** Implements a rolling URL fix to maintain functionality when Discord changes its CDN codes.

2. **ID Codes:** Assigns unique ID codes to each hosted file for identification.

3. **Web Interface:** Provides a  web interface to upload files and get the URL for them.

## How to Use

1. Open `index.js` in a text editor.

2. Replace the placeholder `"WEBHOOKURL"` with your Discord webhook URL.

3. Save the changes.

4. Run the server using the following command in your terminal:

    ```bash
    node index.js
    ```

Make sure to install any required dependencies using `npm install` before running the server.

## Contribution

Feel free to contribute to the project by opening issues or submitting pull requests.
