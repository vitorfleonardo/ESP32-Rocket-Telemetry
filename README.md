<p align="center">
  <a href="https://www.youtube.com/shorts/Mo0wMRmowhE" target="_blank">
    <!-- use a custom image if você tiver -->
    <img src="media/foto.jpg"
         alt="Watch the Short on YouTube" width="300"/>
  </a>
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

## 🛠️ Módulos do Projeto

<div align="center">
    <h3>ESTRUTURAS DA BASE DE LANÇAMENTO E DO FOGUETE</h3>
    <img src="media/compare_estruturas.png" alt="Diagrama de Hardware" width="500"/>
    <p> Imagem 1 - Protótipos feitos para hardware interno do foguete.</p>
</div>

<div>
    Na parte de estruturas, realizamos o design da Base de Lançamentos e do Foguete com o CAD, como exemplificado em (b). Logo em seguida iniciamos a montagem do foguete como em (a) e ao final obtivemos o resultado mostrado em (c).
</div>

---

<div align="center">
    <h3>HARDWARE DO FOGUETE</h3>
    <img src="media/compare_hardware.png" alt="Diagrama de Hardware" width="500"/>
    <p> Imagem 1 - Protótipos feitos para hardware interno do foguete.</p>
</div>

<div>
Iniciamos a construção do hardware com o prototipo (a), testando o MPU-6050 com o protocolo I2C com a ESP32. Logo após aumentamos a complexidade e testamos o sistema completo com ESP32, MPU-6050 e armazenamento no Micro SD, exeplificado no protitipo (b). Em seguida realizamos uma soldagem com barras de pino em uma placa perfurada, representado pelo prototipo (c). E por fim, soldando as baterias ao dispositivo obtivemos o protitipo final (d).
</div>

---

<div align="center">
    <h3>HARDWARE DO BASE DE LANÇAMENTO</h3>
    <img src="media/compare_hardware.png" alt="Diagrama de Hardware" width="500"/>
    <p> Imagem 2 - Dispositivo da Base.</p>
</div>

<div>
Escrever
</div>

---

### 💻 Software

- Código embarcado em C++
- Análise de voo: gráficos de altitude, velocidade, aceleração e trajetória
- Exportação em JSON para análise estatística

> 💡 _[Inserir GIF de execução ou plot]_  
> `<img src="images/interface-software.png" alt="Interface de Gráficos" width="500"/>`

---

📜 Licença
MIT License © 2025 [Seu Nome ou Time]
