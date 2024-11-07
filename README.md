# YourTube 🚀

![License](https://img.shields.io/github/license/mukund2808/YourTube)
![Issues](https://img.shields.io/github/issues/mukund2808/YourTube)
![Stars](https://img.shields.io/github/stars/mukund2808/YourTube)
![Forks](https://img.shields.io/github/forks/mukund2808/YourTube)

An innovative browser extension that enhances your YouTube experience with custom features and improved functionality.

---

## Table of Contents

- [Features](#features)
<!-- - [Demo](#demo) -->
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Features

- **Real-Time Filtering:** Uses MutationObserver to manage YouTube’s infinite scroll dynamically.
- **Advanced Keyword Filtering:** Employs regex for precise, personalized control over content.
- **Optimized YouTube API Integration:** Targets relevant content while minimizing API usage.
- **Cross-Device Syncing:** Utilizes chrome.storage.sync for a consistent experience across devices.
- **Debounced Storage Updates:** Enables real-time toggling without performance issues.
- **Customizable Spaces:** Create multiple spaces (like “Work” and “Learning”) to personalize filters for different needs.

---

<!-- ## Demo

![YourTube Demo](images/demo.gif)

*Experience the seamless integration and enhanced features provided by YourTube.*

--- -->

## Installation

### Prerequisites

- **Browser**: Google Chrome, Microsoft Edge, or any Chromium-based browser.

### Steps

1. **Download the Extension Files**

   - Download the latest release from the [Releases](https://github.com/mukund2808/YourTube/releases) page.
   - Alternatively, clone the repository:

     ```bash
     git clone https://github.com/mukund2808/YourTube.git
     ```

2. **Unzip the Files (If Downloaded as a Zip)**

   - Extract the contents to a folder on your computer.

3. **Load the Extension into Your Browser**

   - **For Google Chrome or Edge:**

     - Open the browser and navigate to `chrome://extensions/` (for Edge, use `edge://extensions/`).
     - Enable **Developer mode** by toggling the switch in the top right corner.
     - Click **Load unpacked**.
     - Select the folder containing the extension files (`YourTube` folder).

4. **Verify the Extension is Installed**

   - You should see the YourTube extension listed among your installed extensions.
   - Ensure it is enabled.

---

## Usage

- **Access the Extension:**

  - Click on the YourTube icon in the browser toolbar.

- **Customize Settings:**

  - Use the extension's settings page to enable or disable features according to your preferences.

- **Enjoy Enhanced YouTube Experience:**

  - Navigate to [YouTube](https://www.youtube.com/) and experience the enhanced features provided by YourTube.

---

## Configuration

### API Key Setup

YourTube requires a YouTube Data API key for certain features, such as enhanced search capabilities.

#### Obtaining an API Key

1. **Create a Google Cloud Project**

   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Click **Select a Project** > **New Project**.
   - Enter a project name and click **Create**.

2. **Enable YouTube Data API v3**

   - In the Dashboard, click **Enable APIs and Services**.
   - Search for **YouTube Data API v3** and enable it.

3. **Create Credentials**

   - Navigate to **APIs & Services** > **Credentials**.
   - Click **Create Credentials** > **API key**.
   - Copy the generated API key.

#### Setting Up the API Key in Your Extension

1. **Locate the Configuration File**

   - In the `YourTube` extension folder, find the `config.js` or `options.js` file (whichever is used for configuration).

2. **Add Your API Key**

   - Open the configuration file in a text editor.
   - Locate the placeholder for the API key.
   - Insert your API key:

     ```javascript
     const API_KEY = 'your_api_key_here';
     ```

3. **Save the File**

   - Ensure the file is saved after adding your API key.

#### Important Note

- **Security Reminder:**

  - Do **not** commit your API key to any public repositories.
  - The API key is stored locally in your extension and is not exposed to others.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**

   - Click on the **Fork** button at the top right corner of the repository page.

2. **Clone Your Fork**

   ```bash
   git clone https://github.com/yourusername/YourTube.git
   ```

3. **Create a New Branch**

   ```bash
   git checkout -b feature/YourFeature
   ```

4. **Make Your Changes**

   - Implement your feature or bug fix.

5. **Commit Your Changes**

   ```bash
   git commit -m "Add feature: YourFeature"
   ```

6. **Push to Your Branch**

   ```bash
   git push origin feature/YourFeature
   ```

7. **Open a Pull Request**

   - Navigate to the original repository.
   - Click on **Pull Requests**.
   - Click **New Pull Request** and select your branch.

### Guidelines

- **Code Style**: Follow the existing code style and formatting.
- **Testing**: Ensure all features are tested and working.
- **Documentation**: Update the README and comments as necessary.

---

## License

This project is licensed under the terms of the [My crazy mind](LICENSE).

---

## Contact

- **Author**: Mukund Sharma
- **Email**: [mukundsharma1719@gmail.com](mailto:mukundsharma1719@gmail.com)
- **GitHub**: [mukund2808](https://github.com/mukund2808)
- **LinkedIn**: [mukundsharma28](https://www.linkedin.com/in/mukundsharma28)

---

*Feel free to reach out for any questions or suggestions!*

---

<!-- ### Instructions for Viewing in VS Code

To view this `README.md` in a beautified format in Visual Studio Code:

1. **Open the `README.md` File in VS Code**

   - Launch VS Code.
   - Open your project folder containing the `README.md` file.
   - Click on `README.md` in the Explorer pane to open it in the editor.

2. **Use the Markdown Preview**

   - Press **`Cmd + Shift + V`** (macOS) or **`Ctrl + Shift + V`** (Windows/Linux) to open the Markdown preview.
   - Alternatively, right-click inside the editor and select **"Open Preview"** or **"Open Preview to the Side"** to view the rendered markdown alongside your code.

3. **Ensure Proper Rendering**

   - The preview should display the README with all formatting, including headings, lists, code blocks, images, and links.

4. **Install Recommended Extensions (Optional)**

   - **Markdown All in One**: Provides enhanced Markdown editing features.
   - **Markdown Preview Enhanced**: Offers advanced preview capabilities, including support for diagrams and other features.
   - **To Install Extensions:**
     - Click on the **Extensions** icon on the left sidebar (it looks like four squares).
     - Search for the extension name.
     - Click **Install**.

---

**Tips:**

- **Proper Markdown Syntax**: Ensure that all markdown elements are correctly formatted. For example, use `#` for headings, `-` or `*` for bullet points, and triple backticks for code blocks.

- **Including Images**:

  - Place your images in an `images` folder within your project directory.
  - Reference them in your README using relative paths, like `![Alt Text](images/your-image.png)`.

- **Checking Links and References**: Verify that all hyperlinks and references in the README are accurate and functional.

---

**Note**: Replace `'your_api_key_here'` with your actual API key in the configuration file (but do not commit the API key to any public repositories). Also, update any placeholder information with accurate details related to your project.

---

By following these instructions, you can view and edit your beautified `README.md` file in VS Code, ensuring it looks great both in the editor and on platforms like GitHub.

**Let me know if you need further assistance with formatting or if you have any other questions!** -->
