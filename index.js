import fs from "fs/promises";
import inquirer from 'inquirer';
import translate from 'translate';
import path from "path";

translate.engine = 'google';
translate.key = 'SUA_CHAVE_DA_API_DO_GOOGLE_TRANSLATE'; 

const pastaEntrada = "./enterDir/";
const pastaSaida = "./translateFile/";
let idiomaDestino = "";

const menuOptions = [
  {
    type: 'list',
    name: 'menuItem',
    message: 'Escolha uma opção:',
    choices: [
      'Portuguese',
      'English',
      'Spanish',
      'Sair'
    ]
  }
];

async function showMenu() {
  const answer = await inquirer.prompt(menuOptions);
  
  switch (answer.menuItem) {
    case 'Portuguese':
      idiomaDestino = "pt";
      break;
    case 'English':
      idiomaDestino = "en";
      break;
    case 'Spanish':
      idiomaDestino = "es";
      break;
    case 'Sair':
      console.log('Saindo do menu.');
      return;
  }

  await translateAllJsonFiles(pastaEntrada, pastaSaida, idiomaDestino);
}

// Inicializa o menu
showMenu();

async function verifyFolder() {
  try {
    await fs.stat(pastaSaida)
  } catch{
    fs.mkdir(pastaSaida)
  }
}

async function translateAllJsonFiles(inputFolder, outputFolder, language) {
  verifyFolder();

  try {
    const filesInDir = await fs.readdir(inputFolder);

    for (const file of filesInDir) {
      const filePath = path.join(inputFolder, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        const newInputFolder = path.join(inputFolder, file);
        const newOutputFolder = path.join(outputFolder, file);

        try {
          await fs.mkdir(newOutputFolder, { recursive: true });
        } catch (err) {
          // Ignora erro caso o diretório já exista
        }

        await translateAllJsonFiles(newInputFolder, newOutputFolder, language);
      } else if (path.extname(file) === '.json') {
        const content = await fs.readFile(filePath, "utf8");
        const jsonObject = JSON.parse(content);

        // Verifica se há um objeto "content" no JSON
        if (jsonObject.content && typeof jsonObject.content === "object") {
          jsonObject.content = await translateJsonObject(jsonObject.content, language);
        } else {
          await translateJsonObject(jsonObject, language);
        }

        const translatedFileName = path.basename(file, '.json') + '_translated.json';
        const outputPath = path.join(outputFolder, translatedFileName);
        await fs.writeFile(outputPath, JSON.stringify(jsonObject, null, 2));

        console.log(`Arquivo traduzido: ${translatedFileName}`);
      }
    }

    console.log("Tradução de todos os arquivos concluída.");
  } catch (error) {
    console.error('Erro:', error);
  }
}

async function translateJsonObject(jsonObject, language) {
  const translatedObject = {};
  for (const chave in jsonObject) {
    if (jsonObject.hasOwnProperty(chave)) {
      const valor = jsonObject[chave];

      if (typeof valor === "object" && valor !== null) {
        translatedObject[chave] = await translateJsonObject(valor, language);
      } else {
        try {
          const traducao = await translate(valor, { to: language });
          translatedObject[chave] = traducao;
        } catch (err) {
          console.log("Erro ao traduzir: " + err);
          translatedObject[chave] = valor;
        }
      }
    }
  }
  return translatedObject;
}