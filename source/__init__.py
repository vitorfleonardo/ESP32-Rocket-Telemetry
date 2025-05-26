import utils
import modules.exit

data = utils.ask("Ler dados.json? (Y/N) ")

print(data)

if __name__ == "__main__":
    while True:
        
        if modules.exit.cli_exit():
            break
        
    print("-- Saindo do software.")