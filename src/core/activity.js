import IPC from "./ipc.js";
import crypto from "node:crypto";
import fs from "fs";
import path from "path";


export default async function init_RPC(preset) {
    await IPC.connect();

    const presetPath = path.resolve(`presets/${preset}.json`);
    const Preset = JSON.parse(fs.readFileSync(presetPath, "utf8"));

    IPC.sendPacket(1, {
        cmd: "SET_ACTIVITY",
        args: { activity: Preset },
        nonce: crypto.randomUUID()
    });
}
