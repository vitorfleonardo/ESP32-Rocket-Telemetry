import os
import utils
import modules.graphing as graphing
import modules.flight_selector as flight_selector
from modules.csv_importer import import_csv_data
from typess import FlightList, FlightData
from typing import Optional, Union, Dict, Tuple, Callable


def main() -> None:
    csv_path = os.path.join(os.path.dirname(__file__), "dados.csv")
    flights: FlightList = load_flights(csv_path)
    
    if not flights:
        print("Nenhum dado de voo encontrado ou o arquivo CSV não pôde ser lido.")
        return
        
    while True:
        flight: Optional[FlightData] = flight_selector.select_flight(flights)
        if flight is None:
            break
            
        while True:
            action: Optional[str] = show_graph_menu(flight)
            if action == "":
                break
            if action == "back":
                break  # Volta para a seleção de voo
            if action == "exit":
                return


# Carrega os dados de voo diretamente do arquivo CSV
def load_flights(csv_path: str) -> FlightList:
    if not os.path.exists(csv_path):
        print(f"Erro: Arquivo {csv_path} não encontrado")
        return []
        
    try:
        flights = import_csv_data(csv_path)
        if not flights:
            print("Aviso: Nenhum dado válido encontrado no arquivo CSV.")
        return flights
    except Exception as e:
        print(f"Erro ao carregar dados do CSV: {e}")
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
    print("\nOpções de gráfico:")
    for key, (label, _) in options.items():
        print(f"\n{key}. {label}")

    choice: str = utils.ask("Selecione uma opção: ").strip()

    if choice in options:
        action = options[choice][1]
        if callable(action):
            action(flight)
            return None
        return action
    print("\nOpção inválida")
    return None


if __name__ == "__main__":
    print("\n===== Sistema de Análise de Dados de Voo =====\n")
    main()
    print("\n-- Saindo do software. --\n")