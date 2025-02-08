# Bg3_Icon_bulder

## Overview
This project is a tool designed for processing and managing texture atlases for use in modding, specifically for **Baldur's Gate 3**. It automates the conversion, resizing, and formatting of icons for spells and items into the appropriate formats and structures used by the game.

## Features
- **Automatic Texture Atlas Creation**: Combines multiple images into a single atlas.
- **DDS Conversion**: Converts images into `.DDS` format for game compatibility.
- **XML Metadata Generation**: Generates `.lsx` files with UV mapping data.
- **Mod Structure Handling**: Places generated assets into appropriate mod directories.
- **Batch Processing**: Handles large numbers of images efficiently.
- **Support for PNG Processing**: Works with PNG files directly without needing temporary files.

## Dependencies
This project relies on the following external libraries and tools:
- [Sharp](https://sharp.pixelplumbing.com/) - For image manipulation
- `fs` (File System) - For handling file operations
- `path` - For managing file paths
- `child_process` - For executing external programs
- `xmlbuilder2` - For XML file generation
- `texconv.exe` - A tool for converting images to `.DDS`
- `Divine.exe` - A tool for working with Larian game files

## Installation
1. Install **Node.js** (recommended '18.*'  LTS version).
2. Clone this repository:
   ```sh
   git clone https://github.com/Atamg1994/Bg3_Icon_bulder.git
   cd project-name
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Ensure `texconv.exe` and `Divine.exe` are placed in `./lib/bin/` and `./lib/Tools/` respectively.

## Usage
1. **Prepare input images**:
   - Place item icons in `./images/Item_Images/` *.png 380X380 (with transparent background)
   - Place spell icons in `./images/Spell_Images/` *.png 380X380 (with transparent background)
   - Place spell icons in `./images/Portraits_152x152/` *.png 152X152 or more is possible (the size will be automatically changed to the desired size)
   - Place spell icons in `./images/Portraits_160x160/` *.png 160X160 or more is possible (the size will be automatically changed to the desired size)
2. **Modify `config.json`** with the appropriate mod name and UUID:
   ```json
   {
     "modName": "YourModName",
     "atlasId": "YourUUID",
     "atlasName": "YourAtlas"
   }
   ```
3. **Run the script**:
   ```sh
   node app.js
   ```
4. The processed files will be placed in the `./Build/` directory with the necessary structure.

## Output Structure
```
Build/
 ├── YourModName/
 │   ├── Public/
 │   │   ├── Assets/Textures/Icons/YourAtlas.DDS
 │   │   ├── GUI/YourAtlas.lsx
 │   │   ├── Content/UI/[PAK]_UI/YourAtlas.lsx
 │   ├── Mods/
 │   │   ├── GUI/metadata.lsx
 │   │   ├── GUI/Assets/Tooltips/Icons/
 │   │   ├── GUI/Assets/Tooltips/ItemIcons/
 │   │   ├── GUI/AssetsLowRes/Tooltips/Icons/
 │   │   ├── GUI/AssetsLowRes/Tooltips/ItemIcons/
 │   │   ├── GUI/Assets/ControllerUIIcons/
 │   │   ├── GUI/AssetsLowRes/ControllerUIIcons/
```

## Contribution
Feel free to fork the repository and submit pull requests for improvements. 

## License
This project is open-source and distributed under the **MIT License**.

