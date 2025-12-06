from pypresence import Presence
import time
import json
import os

path = "presets"
start_time = time.time()

def verifyFile(file):
    if os.path.exists(file):
        initPresence(file)
    else:
        print("Config file not found")

def initPresence(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    ID = data.get("ID")
    if not ID:
        print("Discord ID not found in JSON file..")
        return

    RPC = Presence(ID)
    RPC.connect()
    print("Presence init")

    try:
        while True:
            # Remove a chave "ID" do dict para não passar como parâmetro
            update_data = {k: v for k, v in data.items() if k != "ID"}
            
            # Atualiza o Presence com todos os parâmetros disponíveis no JSON
            RPC.update(**update_data)
            time.sleep(15)
    except KeyboardInterrupt:
        print("\nFinalizing Presence")
        RPC.clear()
        RPC.close()
