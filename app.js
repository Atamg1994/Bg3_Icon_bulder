const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const texconvPath = path.resolve(__dirname, "./lib/bin/texconv.exe");
const Divine = path.resolve(__dirname, "./lib/Tools/Divine.exe");
const { exec } = require("child_process");
const { create } = require("xmlbuilder2");

// Чтение конфигурации
const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
const MODNAME = config.modName;
const UUID = config.atlasId;
const atlasName = config.atlasName;

const ATLAS_SIZE = 2048;
const TILE_SIZE = 64;
const IMAGES_PER_ROW = ATLAS_SIZE / TILE_SIZE;

const itemInputFolder = "./images/Item_Images";
const spellInputFolder = "./images/Spell_Images";
const outputAtlas = `./${atlasName}.png`;
const outputDDS = `./Build/${MODNAME}/Public/${MODNAME}/Assets/Textures/Icons/${atlasName}.DDS`;
const outputXml = `./Build/${MODNAME}/Public/${MODNAME}/GUI/${atlasName}.lsx`;
const mergedLsfPath = `./Build/${MODNAME}/Public/${MODNAME}/Content/UI/[PAK]_UI/${atlasName}.lsx`;



const metadataXml = `./Build/${MODNAME}/Mods/${MODNAME}/GUI/metadata.lsx`;
const tooltipSpellFolder = `./Build/${MODNAME}/Mods/${MODNAME}/GUI/Assets/Tooltips/Icons/`;
const tooltipSpellFolderAssetsLowRes = `./Build/${MODNAME}/Mods/${MODNAME}/GUI/AssetsLowRes/Tooltips/Icons/`;
const tooltipItemFolder = `./Build/${MODNAME}/Mods/${MODNAME}/GUI/Assets/Tooltips/ItemIcons/`;
const tooltipItemFolderAssetsLowRes = `./Build/${MODNAME}/Mods/${MODNAME}/GUI/AssetsLowRes/Tooltips/ItemIcons/`;


const controllerSpellFolder = `./Build/${MODNAME}/Mods/${MODNAME}/GUI/Assets/ControllerUIIcons/skills_png`;
const controllerSpellFolderAssetsLowRes = `./Build/${MODNAME}/Mods/${MODNAME}/GUI/AssetsLowRes/ControllerUIIcons/skills_png`;
const controllerItemFolder = `./Build/${MODNAME}/Mods/${MODNAME}/GUI/Assets/ControllerUIIcons/items_png/`;
const controllerItemFolderAssetsLowRes = `./Build/${MODNAME}/Mods/${MODNAME}/GUI/AssetsLowRes/ControllerUIIcons/items_png/`;



// Утилита для создания папок
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Проверяем и создаём все необходимые папки
function createRequiredDirectories() {
  const directories = [
    path.dirname(outputAtlas),
    path.dirname(outputDDS),
    path.dirname(outputXml),
    path.dirname(mergedLsfPath),
    tooltipSpellFolder,
    tooltipItemFolder,
    controllerSpellFolder,
    controllerItemFolder,
    tooltipSpellFolderAssetsLowRes,
    tooltipItemFolderAssetsLowRes,
    controllerSpellFolderAssetsLowRes,
    controllerItemFolderAssetsLowRes,
  ];
  directories.forEach(ensureDirectoryExists);
}

function getImages(folder) {
  return fs.readdirSync(folder).filter(file => /\.(png|jpg|jpeg)$/i.test(file));
}

function generateUVCoordinates(files) {
  const uvList = [];
  files.forEach((file, index) => {
    const u1 = (index % IMAGES_PER_ROW) * (TILE_SIZE / ATLAS_SIZE);
    const v1 = Math.floor(index / IMAGES_PER_ROW) * (TILE_SIZE / ATLAS_SIZE);
    const u2 = u1 + TILE_SIZE / ATLAS_SIZE;
    const v2 = v1 + TILE_SIZE / ATLAS_SIZE;

    uvList.push({
      MapKey: path.parse(file).name,
      U1: u1.toFixed(5),
      U2: u2.toFixed(5),
      V1: v1.toFixed(5),
      V2: v2.toFixed(5),
    });
  });
  return uvList;
}


// Функция для создания XML
function Gui_metadata_gen(fileData) {
  const root = create({ version: '1.0', encoding: 'utf-8' })
    .ele('save')
    .ele('version', {
      major: '4',
      minor: '7',
      revision: '1',
      build: '3',
      lslib_meta: 'v1,bswap_guids,lsf_keys_adjacency',
    })
    .up()
    .ele('region', { id: 'config' })
    .ele('node', { id: 'config' })
    .ele('children')
    .ele('node', { id: 'entries' })
    .ele('children');

  for (const { path: mapKey, h, w, mipcount } of fileData) {
    const objectNode = root
      .ele('node', { id: 'Object' })
      .ele('attribute', { id: 'MapKey', type: 'FixedString', value: mapKey })
      .up()
      .ele('children')
      .ele('node', { id: 'entries' })
      .ele('attribute', { id: 'h', type: 'int16', value: h })
      .up()
      .ele('attribute', { id: 'mipcount', type: 'int8', value: mipcount })
      .up()
      .ele('attribute', { id: 'w', type: 'int16', value: w })
      .up()
      .up()
      .up();
  }

  return root.end({ prettyPrint: true });
}



function generateXml(files) {
  const uvList = generateUVCoordinates(files);

  const doc = create({ version: "1.0", encoding: "UTF-8" })
    .ele("save")
    .ele("version", { major: "4", minor: "0", revision: "6", build: "5" }).up()
    .ele("region", { id: "TextureAtlasInfo" })
    .ele("node", { id: "root" })
    .ele("children")
    .ele("node", { id: "TextureAtlasIconSize" })
    .ele("attribute", { id: "Height", type: "int32", value: TILE_SIZE }).up()
    .ele("attribute", { id: "Width", type: "int32", value: TILE_SIZE }).up().up()
    .ele("node", { id: "TextureAtlasPath" })
    .ele("attribute", { id: "Path", type: "LSString", value: `Assets/Textures/Icons/${atlasName}.DDS` }).up()
    .ele("attribute", { id: "UUID", type: "FixedString", value: UUID }).up().up()
    .ele("node", { id: "TextureAtlasTextureSize" })
    .ele("attribute", { id: "Height", type: "int32", value: ATLAS_SIZE }).up()
    .ele("attribute", { id: "Width", type: "int32", value: ATLAS_SIZE }).up()
    .up().up().up().up()
    .ele("region", { id: "IconUVList" })
    .ele("node", { id: "root" })
    .ele("children");

  uvList.forEach(uv => {
    doc.ele("node", { id: "IconUV" })
      .ele("attribute", { id: "MapKey", type: "FixedString", value: uv.MapKey }).up()
      .ele("attribute", { id: "U1", type: "float", value: uv.U1 }).up()
      .ele("attribute", { id: "U2", type: "float", value: uv.U2 }).up()
      .ele("attribute", { id: "V1", type: "float", value: uv.V1 }).up()
      .ele("attribute", { id: "V2", type: "float", value: uv.V2 }).up().up();
  });

  return doc.end({ prettyPrint: true });
}

function generateMergedLsfFile(modName, atlasId) {
  const atlasPath = `Public/${modName}/Assets/Textures/Icons/${atlasName}.DDS`;
  const mergedLsfContent = `<?xml version="1.0" encoding="utf-8"?>
<save>
	<version major="4" minor="0" revision="10" build="200" lslib_meta="v1,bswap_guids" />
	<region id="TextureBank">
		<node id="TextureBank">
			<children>
				<node id="Resource">
					<attribute id="SourceFile" type="LSString" value="${atlasPath}" />
					<attribute id="ID" type="FixedString" value="${atlasId}" />
					<attribute id="Name" type="LSString" value="${atlasName}" />
					<attribute id="Template" type="FixedString" value="${atlasName}" />
					<attribute id="SRGB" type="bool" value="True" />
					<attribute id="Streaming" type="bool" value="True" />
					<attribute id="Type" type="int32" value="0" />
				</node>
			</children>
		</node>
	</region>
</save>
  `;

  fs.writeFileSync(mergedLsfPath, mergedLsfContent, "utf-8");
  lsxTolsf(mergedLsfPath, mergedLsfPath)
}

function Normalize_gui_metadata_p_info(directory) {
	const Normalize  = directory.replace(/\\/g, '/')
return Normalize.substring(Normalize.indexOf('Assets/'))
}

async function resizeAndSaveIconsItems(files,format = 'BC7_UNORM') {
	const fileData = [];
  for (const file of files) {
    const inputPath = path.join(itemInputFolder, file);
	

    const itemBuffer = await sharp(inputPath).resize(380, 380).toBuffer();
	const tooltipItem_path = path.join(tooltipItemFolder, file);
	 fileData.push({ path: Normalize_gui_metadata_p_info(tooltipItem_path), h: 380, w: 380, mipcount:9 });
    await saveAsDDS(itemBuffer, tooltipItem_path.replace(/\.(png|jpg|jpeg)$/i, '.DDS'),format);
	await saveAsDDS(itemBuffer, path.join(tooltipItemFolderAssetsLowRes, file.replace(/\.(png|jpg|jpeg)$/i, '.DDS')),format);


    const itemControllerBuffer = await sharp(inputPath).resize(144, 144).toBuffer();
	const controllerItem_path = path.join(controllerItemFolder, file);
	 fileData.push({ path: Normalize_gui_metadata_p_info(controllerItem_path), h: 144, w: 144, mipcount:8 });
    await saveAsDDS(itemControllerBuffer,  controllerItem_path.replace(/\.(png|jpg|jpeg)$/i, '.DDS'),format);
    await saveAsDDS(itemControllerBuffer, path.join(controllerItemFolderAssetsLowRes, file.replace(/\.(png|jpg|jpeg)$/i, '.DDS')),format);
  }
  return fileData
}
async function resizeAndSaveIconsSpell(files,format = 'BC7_UNORM') {
	const fileData = [];
  for (const file of files) {
    const inputPath = path.join(spellInputFolder, file);
	
	const spellBuffer = await sharp(inputPath).resize(380, 380).toBuffer();
	const tooltipSpell_path = path.join(tooltipSpellFolder, file);
	 fileData.push({ path: Normalize_gui_metadata_p_info(tooltipSpell_path), h: 380, w: 380, mipcount:9 });
    await saveAsDDS(spellBuffer,  tooltipSpell_path.replace(/\.(png|jpg|jpeg)$/i, '.DDS'),format);
	await saveAsDDS(spellBuffer, path.join(tooltipSpellFolderAssetsLowRes, file.replace(/\.(png|jpg|jpeg)$/i, '.DDS')),format);



    const skillBuffer = await sharp(inputPath).resize(144, 144).toBuffer();
	const controllerSpell_path = path.join(controllerSpellFolder, file);
	 fileData.push({ path: Normalize_gui_metadata_p_info(controllerSpell_path), h: 144, w: 144, mipcount:8 });
    await saveAsDDS(skillBuffer,  controllerSpell_path.replace(/\.(png|jpg|jpeg)$/i, '.DDS'),format);
    await saveAsDDS(skillBuffer, path.join(controllerSpellFolderAssetsLowRes, file.replace(/\.(png|jpg|jpeg)$/i, '.DDS')),format);
  
  }
  return fileData
}

async function saveAsDDS(imageBuffer, outputPath,format = 'BC3_UNORM') {
  // Сохраняем временный PNG-файл для конвертации в DDS
  const tempPngPath = outputPath.replace(/\.dds$/, '.png').replace(/\.DDS$/, '.png');
  await sharp(imageBuffer).toFile(tempPngPath);

  // Конвертируем временный PNG-файл в DDS
  await convertToDDS(tempPngPath, outputPath,format);
  
  // Удаляем временный PNG-файл после конвертации
  fs.unlinkSync(tempPngPath);
}



async function createAtlas() {
  createRequiredDirectories(); // Создание папок перед началом работы

    const itemFiles = getImages(itemInputFolder);
    const spellFiles = getImages(spellInputFolder);
    const combinedFiles = [...itemFiles, ...spellFiles].slice(0, IMAGES_PER_ROW ** 2);

    const canvas = sharp({
        create: {
            width: ATLAS_SIZE,
            height: ATLAS_SIZE,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    });

    let composite = [];
    
    for (let i = 0; i < combinedFiles.length; i++) {
        const inputPath = itemFiles.includes(combinedFiles[i]) ?
            path.join(itemInputFolder, combinedFiles[i]) :
            path.join(spellInputFolder, combinedFiles[i]);

        const resizedImage = await sharp(inputPath)
            .resize(TILE_SIZE, TILE_SIZE, { kernel: sharp.kernel.lanczos3 })
            .toBuffer();

        const x = (i % IMAGES_PER_ROW) * TILE_SIZE;
        const y = Math.floor(i / IMAGES_PER_ROW) * TILE_SIZE;

        composite.push({ input: resizedImage, top: y, left: x });
    }

    await canvas
    .composite(composite)
    .toFile(outputAtlas)
    .then(async () => {
      console.log(`Атлас сохранён в ${outputAtlas}`);
      await convertToDDS(outputAtlas, outputDDS,"BC3_UNORM");
	  fs.unlinkSync(outputAtlas);
      const xmlContent = generateXml(combinedFiles);
      fs.writeFileSync(outputXml, xmlContent);
	  await lsxTolsf(outputXml, outputXml)
      console.log(`XML файл успешно создан: ${outputXml}`);
	  
     const fl1 = await resizeAndSaveIconsItems(itemFiles);
     const fl2 =  await resizeAndSaveIconsSpell(spellFiles);
	  const xmlContent2 = Gui_metadata_gen([...fl1,...fl2])
	  fs.writeFileSync(metadataXml, xmlContent2);
	  await lsxTolsf(metadataXml, metadataXml)
      console.log("Иконки успешно масштабированы и сохранены.");
      generateMergedLsfFile(MODNAME, UUID);
    })
    .catch(err => console.error("Ошибка при создании атласа:", err));
}

function convertToDDS(inputPath, outputPath, format = 'BC3_UNORM') {
  return new Promise((resolve, reject) => {
    const outputDir = path.dirname(outputPath); // Получаем директорию для сохранения
    const command = `"${texconvPath}" -f ${format} -o "${outputDir}" -y "${inputPath}"`; // Используем полный путь

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error("Ошибка при конвертации в DDS:", err);
        reject(err);
        return;
      }

      // Путь к сохранённому файлу
      const savedFilePath = path.join(outputDir, path.basename(outputPath));

      // Проверяем, сохранён ли файл с маленькими буквами
      if (fs.existsSync(savedFilePath)) {
        // Если в пути указано .DDS, но файл сохранён как .dds, переименовываем его
        if (outputPath.endsWith('.DDS')) {
          const newFilePath = outputPath.replace(/\.dds$/i, '.DDS'); // Меняем .DDS на .dds
          fs.rename(savedFilePath, newFilePath, (renameErr) => {
            if (renameErr) {
              console.error("Ошибка при переименовании файла:", renameErr);
              reject(renameErr);
              return;
            }
            console.log(`DDS-файл переименован в ${newFilePath}`);
            resolve();
          });
        } else {
          console.log(`DDS-файл сохранён в ${savedFilePath}`);
          resolve();
        }
      } else {
        console.log(`Файл не найден: ${savedFilePath}`);
        reject(new Error(`Файл не найден: ${savedFilePath}`));
      }
    });
  });
}

async function lsxTolsf(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        // Определяем абсолютные пути
        const inputDir = path.resolve(path.dirname(inputPath));
        const outputDir = path.resolve(path.dirname(outputPath));

        // Путь к утилите divine.exe
       

        // Формируем команду для выполнения
        const command = `"${Divine}" -g "bg3" -s "${inputDir}" -d "${outputDir}" -a "convert-resources" -i "lsx" -o "lsf"`;

        console.log('Executing command:', command);

        // Выполняем команду через exec
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error:', stderr);
                return reject(error);
            }

            console.log('Output:', stdout);
            resolve();
        });
    });
}





// Запуск
createAtlas();

