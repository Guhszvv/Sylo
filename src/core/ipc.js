import net from "node:net";
import config from "../../config.json" with { type: "json" };

class DiscordIPC {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.listeners = new Map(); // eventos: "READY", "ERROR", etc.
    }

    // --- Conecta ao Discord ---
    connect() {
        return new Promise((resolve, reject) => {
            const path = config.SOCKET_PATH
            this.socket = net.createConnection(path);

            this.socket.on("connect", () => {
                this.connected = true;
                console.log("[Sylo-IPC] Conectado ao Discord IPC!");

                // Envia handshake inicial
                this.sendPacket(0, {
                    v: 1,
                    client_id: config.CLIENT_ID
                });

                resolve();
            });

            this.socket.on("error", (err) => {
                console.error("[Sylo-IPC] Erro:", err);
                this.emit("ERROR", err);
                reject(err);
            });

            this.socket.on("close", () => {
                console.log("[Sylo-IPC] Conexão fechada.");
                this.connected = false;
                this.emit("CLOSE");
            });

            this.socket.on("data", (data) => {
                this.handleFrame(data);
            });
        });
    }

    startHeartbeat() {
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(() => {
        this.sendPacket(1, {}); // opcode 1 = PING
        console.log("[Sylo-IPC] → PING enviado");
    }, 15000);
}
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    // --- Função para lidar com frames recebidos ---
    handleFrame(buffer) {
        const op = buffer.readInt32LE(0);
        const len = buffer.readInt32LE(4);
        const json = buffer.subarray(8, 8 + len).toString();

        const data = JSON.parse(json);

        console.log("Frame recebido:", op, data);

        // Trata OPCODES primeiro
        switch (op) {
            case 0: // DISPATCH
                this.handleDispatch(data);
                break;

            case 1: // HEARTBEAT (Discord pedindo ping)
                console.log("[Sylo-IPC] ← Discord pediu HEARTBEAT");
                this.sendPacket(1, {}); // Respondemos com PING vazio
                break;

            case 2: // FRAME
                // normal activity updates etc
                break;

            case 3: // CLOSE
                console.log("[Sylo-IPC] ← Discord enviou CLOSE");
                this.socket.end();
                break;

            default:
                console.log("[Sylo-IPC] Opcode desconhecido:", op);
                break;
        }
    }

    handleDispatch(data) {
        if (data.evt === "READY") {
            console.log("[Sylo-IPC] READY recebido — iniciando heartbeat!");

            this.startHeartbeat(); // ← ESSENCIAL

            this.emit("READY", data);
            return;
        }

        // Passa o evento pra quem estiver ouvindo
        this.emit(data.evt || data.cmd, data);
    }

    // --- Envio de pacotes ---
    sendPacket(opcode, payload) {
        if (!this.connected) {
            console.warn("[Sylo-IPC] Tentou enviar pacote sem estar conectado.");
            return;
        }

        const json = Buffer.from(JSON.stringify(payload));
        const header = Buffer.alloc(8);

        header.writeInt32LE(opcode, 0);
        header.writeInt32LE(json.length, 4);

        this.socket.write(Buffer.concat([header, json]));
    }

    // --- Event system ---
    on(event, callback) {
        this.listeners.set(event, callback);
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event)(data);
        }
    }
}

export default new DiscordIPC();
