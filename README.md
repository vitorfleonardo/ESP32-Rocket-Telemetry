1. Apague tudo do SD card e depois no computador rode:

```bash
udisksctl unmount -b /dev/sda1
udisksctl power-off -b /dev/sda1
```

- Primeiro desmonta e notifica corretamente o sistema
- Segundo desliga eletricamente o leitor de SD
- Depois disso espere 2 minutos antes de inserir o SD no Micro SD adapter

2. Com o codigo ja embarcado na esp32, aperte o botao "en" para reset
3. Logo apos o SD card tera iniciado e clique no botao para iniciar as coletas e gravaçoes no SD card
4. Quando desejar parar as coletas e gravaçoes aperte novamente o botao
5. Extraia o SD card e analise os dados
