import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import '../core/activity.js';
import init_RPC from "../core/activity.js";

function getPresetChoices() {
    const arquivos = fs.readdirSync("presets");

    const jsonFiles = arquivos.filter(f => f.endsWith(".json"));

    return jsonFiles.map(file => {
        const nome = path.basename(file, ".json");
        return {
            name: nome,   // o que aparece pro usuário
            value: nome   // o valor real usado no code
        };
    });
}

export async function escolherPreset() {
    const choices = getPresetChoices();

    const { preset } = await inquirer.prompt([
        {
            type: "list",
            name: "preset",
            message: "Selecione um preset:",
            choices: choices
        }
    ]);

    return preset;
}

function atualizarConfig(presetEscolhido) {
    const configPath = "./config.json";

    const conteudo = fs.readFileSync(configPath, "utf8");
    const json = JSON.parse(conteudo);

    json.PRESET = presetEscolhido;

    fs.writeFileSync(configPath, JSON.stringify(json, null, 4));

    console.log(`Config atualizado: PRESET = "${presetEscolhido}"`);
}

async function main() {
    const presetNome = await escolherPreset();
    const presetPath = `presets/${presetNome}.json`;

    atualizarConfig(presetNome);

    // Aqui você pode iniciar a activity
    init_RPC()
}

main();