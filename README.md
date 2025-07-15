<!-- BANNER VISUAL -->
<p align="center">
  <img src="caminho/para/logo-ou-foto-do-foguete.jpg" alt="Foguete d'Água" width="600"/>
</p>

<h1 align="center">🚀 Foguete d'Água com Base Automatizada</h1>

<p align="center">
  Projeto Interdisciplinar - Faculdade UnB Gama<br>
  <strong>Engenharias Aeroespacial, Eletrônica, Software, Automotiva e Energia</strong> – 2025<br>
  <em>Controle de Trajetória, Automação e Análise de Dados</em>
</p>

---

## 📘 Sobre o Projeto

Este repositório contém o projeto **"Foguete d’Água com Base Automatizada"**, desenvolvido como parte da disciplina **Projeto Integrador de Engenharia 1 (PI1)** da Universidade de Brasília (UnB). O sistema foi concebido para realizar lançamentos de foguetes com **propulsão hidrostática** de forma segura, reutilizável e com **coleta de dados embarcada**.

> 🎯 **Objetivo**: Alcançar distâncias pré-definidas de 10 m, 20 m e 30 m com precisão de ±0.5 m, coletando e processando dados em tempo real por meio de um microcontrolador embarcado (ESP32). Após o voo, construir análises da trajetória.

---

## 🧠 Tecnologias e Ferramentas

| Área      | Tecnologias Utilizadas                                 |
| --------- | ------------------------------------------------------ |
| Hardware  | ESP32, MPU-6050, Módulo SD Card, LiPo Battery, Ponte H |
| Software  | Python, Pandas,                                        |
| Estrutura | CAD 3D com CATIA, Tubos de PVC, PSAI                   |
| Energia   | Power Bank 3300 mAh, Bateria LiPo 100–150 mAh          |
| Gerência  | EAP (PMBOK), BPMN, Cronogramas, Orçamento, Gantt       |

---

## 🧩 Estrutura do Projeto

```bash
📁 rocket_with_esp32
├── /docs # Documentações e Relatórios
├── /hardware # Esquemas elétricos, diagramas e fotos
├── /software # Códigos Arduino/C para ESP32
├── /data # Dados coletados (JSON)
├── /images # Imagens do projeto
└── README.md # Apresentação do repositório
```

---

## 🛠️ Módulos do Projeto

### 🔩 Estruturas

- Modelagem 3D em CATIA
- Aletas em PSAI para estabilidade
- Base de lançamento em PVC com suporte angular fixo a 45°

> 💡 _[Inserir imagem da estrutura aqui]_  
> `<img src="images/estrutura.jpg" alt="Estrutura do Foguete" width="500"/>`

---

### ⚡ Hardware

- ESP32 com coleta via sensores inerciais (MPU-6050)
- Armazenamento em SD Card
- Arquitetura robusta com isolamento de ruídos e alimentação dedicada

> 💡 _[Inserir diagrama de blocos aqui]_  
> `<img src="images/diagrama-hardware.png" alt="Diagrama de Hardware" width="500"/>`

---

### 💻 Software

- Código embarcado em C++
- Análise de voo: gráficos de altitude, velocidade, aceleração e trajetória
- Exportação em JSON para análise estatística

> 💡 _[Inserir GIF de execução ou plot]_  
> `<img src="images/interface-software.png" alt="Interface de Gráficos" width="500"/>`

---

## 📈 Resultados e Métricas

| Indicador                         | Valor Alcançado      |
| --------------------------------- | -------------------- |
| Precisão média do lançamento      | ± 0.38 m             |
| Reutilizações bem-sucedidas       | 3/3                  |
| Dados coletados por voo           | > 250 amostras       |
| Consumo energético total (3 voos) | 0.35 Wh              |
| Funcionalidades implementadas     | 100% (9/9 entregues) |

---

## 👥 Equipe

| Nome          | Função             | Curso             |
| ------------- | ------------------ | ----------------- |
| Vitor Feijó   | Gerente do Projeto | Eng. de Software  |
| Erick Tavares | Estruturas         | Eng. Aeroespacial |
| Lucas Gama    | Hardware           | Eng. de Software  |
| ...           | ...                | ...               |

> 🔗 Lista completa no relatório [`doc_pi1.pdf`](docs/doc_pi1.pdf)

---

## 📷 Galeria de Imagens

<div align="center">
  <img src="media/output.gif" width="300"/>
  <img src="images/base-teste.jpg" width="300"/>
  <img src="images/pcb.jpg" width="300"/>
</div>

---

📜 Licença
MIT License © 2025 [Seu Nome ou Time]
