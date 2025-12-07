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
            name: nome,
            value: nome 
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

async function main() {
    const presetNome = await escolherPreset();

    init_RPC(presetNome)
}

main();