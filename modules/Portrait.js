const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
const MODNAME = config.modName;
const UUID = config.atlasId;
const atlasName = config.atlasName;


const Portraits_152x152 = "./images/Portraits_152x152";
const Portraits_160x160 = "./images/Portraits_160x160";

const Portraits_out = `./Build/${MODNAME}/Mods/${MODNAME}/GUI/Assets/Portraits/`;
// Утилита для создания папок
function ensureDirectoryExists(directory) {
    console.log(`✅ ensureDirectoryExists в ${directory}`);
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

function getImages(folder) {
    return fs.readdirSync(folder)
        .filter(file => /\.(png|jpg|jpeg)$/i.test(file))
        .map(file => path.join(folder, file));
}

async function createRequiredDirectories() {
    const directories = [
        Portraits_160x160,
        Portraits_152x152,
        Portraits_out,
    ];
    directories.forEach(ensureDirectoryExists);
}

async function getImagesForAtlas() {
   return [];
}


function Normalize_gui_metadata_p_info(directory) {
    const Normalize  = directory.replace(/\\/g, '/')
    return Normalize.substring(Normalize.indexOf('Assets/'))
}

async function getMetadataData(saveAsDDS) {
    const format = 'BC7_UNORM';
    const fileData = [];
    const Portraits_152x152_images = getImages(Portraits_152x152);

    for (const fullPath of Portraits_152x152_images) {
        const file = path.basename(fullPath); // Получаем только имя файла
        const inputPath = fullPath; // У нас уже есть полный путь
        const itemBuffer = await sharp(inputPath).resize(152, 152).toBuffer();
        const Portraits_out_path = path.join(Portraits_out, file);
        fileData.push({ path: Normalize_gui_metadata_p_info(Portraits_out_path), h: 152, w: 152, mipcount:9 });
        await saveAsDDS(itemBuffer, Portraits_out_path.replace(/\.(png|jpg|jpeg)$/i, '.DDS'),format);
    }

    const Portraits_160x160_images = getImages(Portraits_160x160);
    for (const fullPath of Portraits_160x160_images) {
        const file = path.basename(fullPath); // Получаем только имя файла
        const inputPath = fullPath; // У нас уже есть полный путь

        const itemBuffer = await sharp(inputPath).resize(160, 160).toBuffer();
        const Portraits_out_path = path.join(Portraits_out, file);
        fileData.push({ path: Normalize_gui_metadata_p_info(Portraits_out_path), h: 160, w: 160, mipcount:9 });
        await saveAsDDS(itemBuffer, Portraits_out_path.replace(/\.(png|jpg|jpeg)$/i, '.DDS'),format);
    }
    return fileData
}




module.exports = { createRequiredDirectories, getImagesForAtlas, getMetadataData };
