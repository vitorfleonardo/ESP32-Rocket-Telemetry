import utils

def cli_exit() -> bool:
	answer = utils.ask("Saindo do software, confirme: (Y/N)")
	return answer.lower() == 'y'