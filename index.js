import fs from "fs";
import inquirer from 'inquirer';
import translate from 'translate-google';
import path from "path";

const textoParaTraduzir = 'hello';
const caminho = "./enterDir/ata.json"
const output = "./output/tr.json"
let idiomaDestino = "";

// Defina as opções do menu
const menuOptions = [
    {
      type: 'list', // O tipo de pergunta é uma lista
      name: 'menuItem', // Nome da resposta
      message: 'Escolha uma opção:', // Pergunta
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
  
    // Mostra o menu novamente para continuar a escolher
    await translateJson(caminho, idiomaDestino, output);
  }
  // Inicializa o menu
  showMenu();

  async function translateJson(caminho, idiomaDestino, output){
    try{
        // Ler o conteúdo do arquivo JSON original
        const contentOriginal = await fs.promises.readFile(caminho, "utf8");

        // Analisar o conteúdo JSON
        const objetoJSON = JSON.parse(contentOriginal);

        async function traduzirObjeto(objeto, idiomaDestino){
            const traducoes = {}
            for(const chave in objeto) {
                if(objeto.hasOwnProperty(chave)){
                    const valor = objeto[chave];
        
                    try{
                        const traducao = await translate(valor, { to: idiomaDestino });
                        traducoes[chave] = traducao; // Criar uma nova propriedade no objeto traducoes
                    } catch(err) {
                        console.log("Erro ao traduzir: " + err)
                        traducoes[chave] = valor; // Manter original caso dê erro
                    }
                }
            }
            return traducoes;
        }

    // Executar a função e guardar objeto
    const traducoes = await traduzirObjeto(objetoJSON, idiomaDestino);
    
    // Escrever as traduções no arquivo JSON traduzido
    await fs.promises.writeFile(output, JSON.stringify(traducoes, null, 2));

    console.log("Traduzido com sucesso")
    } catch (err){
        console.log(err)
    }
  }


  /*async function translateFile(){
    translate(textoParaTraduzir, { to: idiomaDestino })
    .then((res) => {
      console.log('Texto original:', textoParaTraduzir);
      console.log('Texto traduzido:', res);
    })
    .catch((err) => {
      console.error('Erro ao traduzir:', err);
    });
  }*/