import utils
from typess import FlightList, FlightData
from typing import Optional

# Exibe a lista de voos e retorna a seleção do usuário
def select_flight(flights: FlightList) -> Optional[FlightData]:
    if not flights:
        print("Nenhum dado de voo disponível")
        return None
    
    while True:
        print("\nVoos disponíveis:")
        for i, flight in enumerate(flights, 1):
            print(f"\n{i}. Voo {flight['id_voo']} ({flight['data_lancamento']})")
            print(f"   {flight['descricao']}")
        
        print("\nS. Sair do programa")

        choice: str = utils.ask("Selecione um voo: ").strip().lower()

        if choice == 's':
            return None
        if choice.isdigit():
            index: int = int(choice) - 1
            if 0 <= index < len(flights):
                return flights[index]

        print("\nSeleção inválida. Por favor, tente novamente.")