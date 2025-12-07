import { time } from "node:console";
import IPC from "./ipc.js";
import crypto from "node:crypto";
import preset from "../../presets/example.json" with { type: "json" };

await IPC.connect();
IPC.sendPacket(1, {
    "cmd": "SET_ACTIVITY",
    "args": {
        "activity": {
            ...preset
        }
    },
    nonce: crypto.randomUUID()
});