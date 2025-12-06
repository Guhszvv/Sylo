import psutil
import Presence

def buscar_processo_por_nome(nome):
    processos_encontrados = []

    for proc in psutil.process_iter(['pid', 'name', 'exe', 'cmdline']):
        try:
            if nome.lower() in proc.info['name'].lower():
                processos_encontrados.append(proc.info)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    return processos_encontrados

def iniciar():
    nome = input("Nome do processo: ")
    processos = buscar_processo_por_nome(nome)
    if processos:
        print(f"Processos encontrados para '{nome}':")
        for p in processos:
            print(f"PID: {p['pid']} | Nome: {p['name']}")
        Presence.verifyFile(f"presets/{nome}.json")
    else:
        print(f"Nenhum processo encontrado com '{nome}'.")

if __name__ == "__main__":
    iniciar()
