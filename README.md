# YourSpot - Desenvolvimento

Bem-vindo ao guia de desenvolvimento do **YourSpot**. Siga as instruções abaixo para configurar o seu ambiente e rodar o aplicativo React Native (Expo) localmente no VS Code.

---

## 📋 Pré-requisitos Globais

Antes de tentar rodar o projeto, você precisa ter o ambiente de desenvolvimento básico instalado no seu computador. Verifique se você já possui os seguintes itens:

1. Node.js: Versão LTS (recomendada a versão v18 ou superior).
   > [Baixar Node.js](https://nodejs.org/)
2. VS Code: O editor de código recomendado.
   > [Baixar VS Code](https://code.visualstudio.com/)
3. Ambiente Mobile:
   * Para rodar no navegador (Web): Não requer instalação extra.
   * Para rodar no Android (Emulador ou Físico): Requer Android Studio configurado.
   * Para rodar no iOS (Mac apenas): Requer Xcode e CocoaPods instalados.
   * Alternativa Prática: Instale o app Expo Go no seu celular físico (Android ou iOS) para testar sem emuladores.

---

## 🛠️ Passo a Passo para Rodar no VS Code

Abra o VS Code e siga estes comandos no terminal integrado (Ctrl + ' ou Cmd + ').

### 1. Preparar o Ambiente e Dependências

A primeira coisa a fazer é instalar o CLI do Expo globalmente e todas as bibliotecas necessárias para o app funcionar.

# 1.1 Instale o Expo CLI globalmente (caso ainda não tenha)
npm install -g expo-cli

# 1.2 Instale o TypeScript globalmente (recomendado)
npm install -g typescript

# 1.3 Entre na pasta raiz do projeto (caso não esteja nela no terminal)
# cd YourSpot

# 1.4 Instale TODAS as dependências do projeto
npm install

### 2. Rodar o Aplicativo

Com as dependências instaladas, você pode iniciar o servidor de desenvolvimento.

# Inicie o Expo
npm start

### 3. Visualizar o App

Quando você rodar "npm start", uma interface do Expo abrirá no terminal e você verá um QR Code grande.

Para ver o app funcionando, escolha uma das opções:

- Celular Físico: Abra o app Expo Go (no Android) ou a Câmera (no iOS) e escaneie o QR Code que aparece no terminal.
- Emulador Android: Com o emulador aberto, pressione a tecla "a" no terminal integrado do VS Code.
- Simulador iOS (Mac): Com o simulador aberto, pressione a tecla "i" no terminal integrado do VS Code.
- Navegador Web: Pressione a tecla "w" no terminal integrado do VS Code.

---

## 🛠️ Solução de Problemas Comuns

Se você encontrar erros, tente os seguintes passos:

1. Erro de "Module not found" ou dependência faltando:
   Tente apagar a pasta node_modules e o arquivo package-lock.json e rode "npm install" novamente.

2. Erro no TypeScript:
   Certifique-se de que rodou npm install e que o VS Code identificou o arquivo tsconfig.json. Você pode reiniciar o servidor TS pressionando Ctrl + Shift + P > "TypeScript: Restart TS server".

3. Erro no emulador:
   Verifique se o emulador Android ou simulador iOS está totalmente iniciado e reconhecido pelo sistema ("adb devices" no Android).

---
