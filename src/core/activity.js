import IPC from "./ipc.js";
import crypto from "node:crypto";
import fs from "fs";
import config from "../../config.json" with { type: "json" };

const preset = JSON.parse(
  fs.readFileSync(`presets/${config.PRESET}.json`, "utf8")
);

export default async function init_RPC() {
    await IPC.connect();

    IPC.sendPacket(1, {
        "cmd": "SET_ACTIVITY",
        "args": { "activity": preset},
        "nonce": crypto.randomUUID()
    });
}
