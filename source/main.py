import json
import utils
import modules.graphing as graphing
import modules.flight_selector as flight_selector
from typess import FlightList, FlightData
from typing import Optional, Union, Dict, Tuple, Callable


def main() -> None:
    flights: FlightList = load_flights()
    
    while True:
        flight: Optional[FlightData] = flight_selector.select_flight(flights)
        if flight is None:
            break
            
        while True:
            action: Optional[str] = show_graph_menu(flight)
            if action == "":
                break
            if action == "exit":
                return


# Carrega os dados de voo do arquivo database.json
def load_flights() -> FlightList:
    try:
        with open("source/database.json", "r") as f:
            data: FlightList = json.load(f)
            return data
    except FileNotFoundError:
        print("Error: database.json not found")
        return []
    except json.JSONDecodeError:
        print("Error: Invalid JSON format")
        return []


# Exibe o menu de opções de gráficos para um voo selecionado
def show_graph_menu(flight: FlightData) -> Optional[str]:
    options: Dict[str, Tuple[str, Union[str, Callable[[FlightData], None]]]] = {
        "1": ("Velocidade", graphing.plot_velocity),
        "2": ("Aceleração", graphing.plot_acceleration),
        "3": ("Velocidade Angular", graphing.plot_angular_velocity),
        "4": ("Voltar para seleção de voo", "back"),
        "5": ("Sair do programa", "exit")
    }

    print(f"\nVoo {flight['id_voo']} - {flight['descricao']}")
    print("Opções de gráfico:")
    for key, (label, _) in options.items():
        print(f"{key}. {label}")

    choice: str = utils.ask("Selecione uma opção: ").strip()

    if choice in options:
        action = options[choice][1]
        if callable(action):
            action(flight)
            return None
        return action
    print("Opção inválida")
    return None


if __name__ == "__main__":
    print("Sistema de Análise de Dados de Voo")
    main()
    print("-- Saindo do software.")
