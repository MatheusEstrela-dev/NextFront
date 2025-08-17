#!/bin/bash

# ##################################################################
# SCRIPT PARA EXIBIR ARTE APPLE COM MENU FUNCIONAL (VERSÃO BASH)
# ##################################################################

# --- Define o título do terminal ---
echo -ne "\033]0;Apple Menu by Matheus@Estrela\007"

# ##################################################################
# 1. DEFINIÇÃO DE VARIÁVEIS DE COR (ANSI)
# ##################################################################

# --- Cores do Logo ---
c_green='\033[92m'
c_yellow='\033[93m'
c_red='\033[91m'
c_purple='\033[95m'
c_blue='\033[94m'

# --- Cores do Menu ---
c_fg_bright_white='\033[97m'
c_fg_bright_green='\033[92m'
c_fg_bright_red='\033[91m'
c_grey='\033[90m'
c_white='\033[97m' # Adicionado para compatibilidade

# --- Reset ---
c_reset='\033[0m'

# ##################################################################
# FUNÇÕES DAS OPÇÕES DO MENU
# ##################################################################

press_enter_to_continue() {
    echo ""
    read -p "Pressione Enter para voltar ao menu..."
}

# ----------- FUNÇÃO MODIFICADA -----------
docker_menu() {
    clear
    echo -e "${c_fg_bright_green}==================================${c_reset}"
    echo -e "   ${c_fg_bright_green}[1] INICIANDO CONTAINERS DOCKER${c_reset}"
    echo -e "${c_fg_bright_green}==================================${c_reset}"
    echo ""

    # Verifica se o docker-compose está instalado
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${c_fg_bright_red}Erro: O comando 'docker-compose' não foi encontrado.${c_reset}"
        echo -e "${c_white}Por favor, instale Docker e Docker Compose para continuar.${c_reset}"
        press_enter_to_continue
        return
    fi

    echo -e "${c_yellow}Executando 'docker-compose up --build -d'...${c_reset}"
    echo -e "${c_grey}Isso pode levar alguns minutos na primeira execução.${c_reset}"
    echo "----------------------------------------------------"

    # Executa o comando para construir e iniciar os containers em background
    docker-compose up --build -d

    # Verifica se o comando anterior foi executado com sucesso
    if [ $? -eq 0 ]; then
        echo "----------------------------------------------------"
        echo -e "\n${c_fg_bright_green}Containers iniciados com sucesso!${c_reset}"
        echo -e "${c_white}Use o comando 'docker-compose logs -f' para ver os logs em tempo real.${c_reset}"
    else
        echo "----------------------------------------------------"
        echo -e "\n${c_fg_bright_red}Ocorreu um erro ao tentar iniciar os containers.${c_reset}"
        echo -e "${c_white}Verifique a saída de erro acima.${c_reset}"
    fi

    press_enter_to_continue
}
# -----------------------------------------

deps_menu() {
  clear
  echo -e "${c_fg_bright_green}==================================${c_reset}"
  echo -e "     ${c_fg_bright_green}[2] VERIFICANDO DEPENDÊNCIAS${c_reset}"
  echo -e "${c_fg_bright_green}==================================${c_reset}"
  echo ""

  # === ajuste o caminho do app conforme seu repo ===
  APP_DIR="${APP_DIR:-./nextfront}"

  # ---------------- helpers ----------------
  _ok()   { echo -e "✔ $1"; }
  _warn() { echo -e "⚠ $1"; }
  _err()  { echo -e "${c_fg_bright_red}✘ $1${c_reset}"; }
  _sep()  { echo -e "${c_grey}---------------------------------------------${c_reset}"; }

  # compare versões (semver simples)
  _ver_ge() { # usage: _ver_ge "20.0.0" "18.0.0"
    [ "$(printf '%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]
  }

  # checar comando + versão mínima
  _check_cmd_ver() { # cmd min_ver [version_flag]
    local cmd="$1" min="$2" flag="${3:---version}"
    if ! command -v "$cmd" >/dev/null 2>&1; then
      _err "$cmd não encontrado."
      return 1
    fi
    local ver
    ver="$($cmd $flag 2>/dev/null | head -n1 | grep -Eo '[0-9]+(\.[0-9]+){1,3}' | head -n1)"
    if [ -z "$ver" ]; then
      _warn "$cmd encontrado, mas não consegui detectar versão."
      return 0
    fi
    if _ver_ge "$ver" "$min"; then
      _ok "$cmd $ver (>= $min)"
      return 0
    else
      _err "$cmd $ver (< $min). Atualize para >= $min."
      return 1
    fi
  }

  # porta livre?
  _port_free() { # port
    local p="$1"
    if command -v ss >/dev/null 2>&1; then
      ss -lnt 2>/dev/null | awk '{print $4}' | grep -q ":$p$"
    elif command -v netstat >/dev/null 2>&1; then
      netstat -an 2>/dev/null | grep -q "[\.:]$p[[:space:]]"
    else
      return 1
    fi
  }

  # npm ls em depth=0 (no projeto)
  _npm_has() { # pkg
    ( cd "$APP_DIR" 2>/dev/null && npm ls --depth=0 "$1" >/dev/null 2>&1 )
  }

  # lints
  _sep
  echo -e "${c_yellow}>> Sistema (Host)${c_reset}"

  _check_cmd_ver node "18.17.0"
  _check_cmd_ver npm  "9.0.0"
  _check_cmd_ver npx  "9.0.0"

  # Docker & Compose (v2)
  if command -v docker >/dev/null 2>&1; then
    _check_cmd_ver docker "20.10.0"
    if docker info >/dev/null 2>&1; then
      _ok "Docker daemon em execução"
    else
      _err "Docker daemon NÃO está em execução"
    fi

    if docker compose version >/dev/null 2>&1; then
      local dc_ver
      dc_ver="$(docker compose version 2>/dev/null | grep -Eo '[0-9]+(\.[0-9]+){1,3}' | head -n1)"
      _ok "docker compose (plugin) ${dc_ver}"
    elif command -v docker-compose >/dev/null 2>&1; then
      _warn "Usando docker-compose (binário legado). Considere usar 'docker compose'."
      _check_cmd_ver docker-compose "1.29.0"
    else
      _err "Nem 'docker compose' nem 'docker-compose' encontrados."
    fi
  else
    _err "docker não encontrado."
  fi

  # Portas
  _sep
  echo -e "${c_yellow}>> Portas${c_reset}"
  if _port_free 3000; then
    _err "Porta 3000 OCUPADA. Feche o processo que usa 3000 para rodar o Next."
  else
    _ok "Porta 3000 livre"
  fi
  if _port_free 5555; then
    _warn "Porta 5555 OCUPADA (Prisma Studio pode não abrir)."
  else
    _ok "Porta 5555 livre"
  fi

  # Projeto
  _sep
  echo -e "${c_yellow}>> Projeto (${APP_DIR})${c_reset}"
  if [ ! -d "$APP_DIR" ]; then
    _err "Pasta ${APP_DIR} não encontrada. Ajuste APP_DIR no script."
    press_enter_to_continue; return
  fi

  if [ -f "$APP_DIR/package.json" ]; then
    _ok "package.json encontrado"
  else
    _err "package.json não encontrado em ${APP_DIR}"
  fi

  # Dependências essenciais do app
  echo -e "\n${c_yellow}>> Dependências NPM (app)${c_reset}"
  DEPS=("next" "react" "react-dom" "@prisma/client" "prisma" "bcryptjs" "jose" "framer-motion" "lucide-react" "tailwindcss")
  for pkg in "${DEPS[@]}"; do
    if _npm_has "$pkg"; then
      _ok "$pkg instalado"
    else
      _err "$pkg AUSENTE (dica: cd ${APP_DIR} && npm i ${pkg})"
    fi
  done

  # Prisma & DB
  _sep
  echo -e "${c_yellow}>> Prisma & Banco${c_reset}"
  if [ -f "$APP_DIR/prisma/schema.prisma" ]; then
    _ok "schema.prisma encontrado"
    # provider e url
    local provider url
    provider="$(grep -E 'provider *= *"' "$APP_DIR/prisma/schema.prisma" 2>/dev/null | head -n1 | sed -E 's/.*"([^"]+)".*/\1/')"
    url="$(grep -E 'url *= *env\("DATABASE_URL"\)' "$APP_DIR/prisma/schema.prisma" >/dev/null 2>&1 && echo 'env(DATABASE_URL)' || echo '')"
    [ -n "$provider" ] && _ok "provider: ${provider}"
    [ -n "$url" ] && _ok 'url: env(DATABASE_URL)'

    # .env
    if [ -f "$APP_DIR/.env" ]; then
      _ok ".env encontrado"
      # DATABASE_URL presente?
      if grep -q '^DATABASE_URL=' "$APP_DIR/.env"; then
        local dbv
        dbv="$(grep '^DATABASE_URL=' "$APP_DIR/.env" | tail -n1 | cut -d= -f2-)"
        echo -e "• DATABASE_URL=${dbv}"
        # se sqlite, verificar arquivo
        if echo "$dbv" | grep -qi 'file:.*\.db'; then
          local dbfile
          dbfile="$(echo "$dbv" | sed -E 's/file:\.\/(.*)/\1/i')"
          if [ -f "$APP_DIR/$dbfile" ]; then
            _ok "Arquivo SQLite: ${APP_DIR}/${dbfile}"
          else
            _warn "Arquivo SQLite não encontrado em ${APP_DIR}/${dbfile} (rode: cd ${APP_DIR} && npx prisma migrate dev)"
          fi
        fi
      else
        _warn "DATABASE_URL não definido em ${APP_DIR}/.env"
      fi

      # JWT_SECRET
      if grep -q '^JWT_SECRET=' "$APP_DIR/.env"; then
        _ok "JWT_SECRET definido"
      else
        _warn "JWT_SECRET não definido em ${APP_DIR}/.env (usará default do código)"
      fi
    else
      _warn ".env NÃO encontrado em ${APP_DIR}"
    fi

    # prisma CLI
    if command -v npx >/dev/null 2>&1; then
      local pver
      pver="$(cd "$APP_DIR" && npx prisma -v 2>/dev/null | tail -n1 | awk '{print $2}')"
      [ -n "$pver" ] && _ok "Prisma CLI: ${pver}"
    fi
  else
    _err "prisma/schema.prisma não encontrado em ${APP_DIR}"
  fi

  # Tailwind (v4 usa plugin postcss)
  _sep
  echo -e "${c_yellow}>> Tailwind/PostCSS${c_reset}"
  if _npm_has "tailwindcss"; then
    _ok "tailwindcss presente"
  fi
  if _npm_has "@tailwindcss/postcss"; then
    _ok "@tailwindcss/postcss presente"
  else
    _warn "@tailwindcss/postcss ausente (v4 recomenda este plugin no PostCSS)"
  fi
  if _npm_has "postcss"; then
    _ok "postcss presente"
  fi

  # Compose file
  _sep
  echo -e "${c_yellow}>> Docker Compose${c_reset}"
  if [ -f "./docker-compose.yml" ] || [ -f "./compose.yml" ]; then
    _ok "Arquivo compose encontrado"
  else
    _warn "compose.yml/docker-compose.yml NÃO encontrado na raiz"
  fi

  # Ações sugeridas
  _sep
  echo -e "${c_yellow}>> Ações sugeridas${c_reset}"
  echo "• Para instalar deps do app:  cd ${APP_DIR} && npm install"
  echo "• Gerar Prisma Client:        cd ${APP_DIR} && npx prisma generate"
  echo "• Criar/migrar DB:            cd ${APP_DIR} && npx prisma migrate dev"
  echo "• Abrir Prisma Studio:        cd ${APP_DIR} && npx prisma studio  (porta 5555)"
  echo "• Subir dev (docker):         docker compose up -d && docker compose logs -f web"

  echo -e "\n${c_fg_bright_green}Verificação concluída.${c_reset}"
  press_enter_to_continue
}




db_menu() {
    clear
    echo -e "${c_fg_bright_green}==================================${c_reset}"
    echo -e "     ${c_fg_bright_green}[3] INICIAR PRISMA STUDIO (HOST)${c_reset}"
    echo -e "${c_fg_bright_green}==================================${c_reset}"
    echo ""

    APP_DIR="./nextfront"

    if [ ! -d "$APP_DIR" ]; then
      echo -e "${c_fg_bright_red}Pasta '$APP_DIR' não encontrada.${c_reset}"
      echo -e "Abra este script a partir da raiz do projeto."
      press_enter_to_continue; return
    fi

    if [ ! -f "$APP_DIR/prisma/schema.prisma" ]; then
      echo -e "${c_fg_bright_red}Não achei $APP_DIR/prisma/schema.prisma.${c_reset}"
      press_enter_to_continue; return
    fi

    # 2) escolhe o arquivo do banco (dev.db ou DEV.DB)
    DB_FILE=""
    [ -f "$APP_DIR/prisma/dev.db" ] && DB_FILE="dev.db"
    [ -z "$DB_FILE" ] && [ -f "$APP_DIR/prisma/DEV.DB" ] && DB_FILE="DEV.DB"

    if [ -z "$DB_FILE" ]; then
      echo -e "${c_yellow}Aviso:${c_reset} nenhum arquivo de banco encontrado em $APP_DIR/prisma/."
      echo -e "Rodando migrações iniciais dentro do container..."
      docker compose exec web sh -lc "npx prisma migrate dev --name init"
    else
      echo -e "Usando banco: ${c_white}$APP_DIR/prisma/$DB_FILE${c_reset}"
    fi

    # 4) roda o seed do Prisma dentro do container e verifica o sucesso
    echo -e "${c_yellow}Rodando seed do banco de dados no container...${c_reset}"
    docker compose exec web sh -lc "npm run seed"

    # Verifica o código de saída do comando anterior
    if [ $? -eq 0 ]; then
        echo -e "${c_fg_bright_green}✔ Seed do banco de dados executado com sucesso!${c_reset}"
    else
        echo -e "${c_fg_bright_red}✘ Erro ao executar o seed do banco de dados.${c_reset}"
        echo -e "${c_white}Verifique os logs do container 'web' para mais detalhes (docker compose logs -f web).${c_reset}"
        press_enter_to_continue; return
    fi

    # 5) inicia o Prisma Studio no host
    echo -e "${c_yellow}Iniciando Prisma Studio em http://localhost:5555 ...${c_reset}"
    ( cd "$APP_DIR" && npx prisma studio --hostname 0.0.0.0 --port 5555 --browser none ) &

    sleep 1
    open_url "http://localhost:5555" 2>/dev/null || true

    echo -e "${c_fg_bright_green}Prisma Studio em execução.${c_reset}"
    echo -e "${c_grey}Para encerrar, feche a aba do navegador ou Ctrl+C neste terminal.${c_reset}"
    press_enter_to_continue
}





venv_menu() {
    clear
    echo -e "${c_fg_bright_green}==================================${c_reset}"
    echo -e "        ${c_fg_bright_green}[4] AMBIENTE VIRTUAL${c_reset}"
    echo -e "${c_fg_bright_green}==================================${c_reset}"
    echo ""
    echo "Ativando o ambiente virtual..."
    # No Linux/macOS, o caminho é 'bin/activate'
    if [ -f "./venv/bin/activate" ]; then
        # Nota: 'source' em um script ativa o venv apenas para a duração do script.
        # Não afeta o terminal do usuário após a saída do script.
        source ./venv/bin/activate
        echo -e "${c_fg_bright_white}Ambiente 'venv' ativado para este script.${c_reset}"
        echo -e "${c_grey}Execute 'source ./venv/bin/activate' em seu terminal para ativá-lo permanentemente.${c_reset}"
    else
        echo -e "${c_grey}Ambiente virtual 'venv' nao encontrado no diretorio atual.${c_reset}"
    fi
    press_enter_to_continue
}

# ##################################################################
# LOOP PRINCIPAL DO MENU
# ##################################################################
while true
do
    clear

    # --- Coleta de informações do sistema ---
    CURRENT_USER=$(whoami)
    PC_NAME=$(hostname)
    OS_VERSION=$(uname -srm)
    CURRENT_DATE=$(date +"%Y-%m-%d %H:%M:%S")
    IPV4_ADDRESS=$(ip a | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d'/' -f1 | head -n 1 || echo "Nao encontrado")

    # --- Exibição da Interface Gráfica ---
    echo -e "
${c_green}                          :2${c_reset}                                         ${c_fg_bright_green}Dev Tools by Matheus@Estrela${c_reset}
${c_green}                         r72S${c_reset}                                     ${c_grey}|------------------------------------|${c_reset}
${c_green}                      iX0S2XX${c_reset}                                     ${c_grey}| ${c_fg_bright_green}[1] Iniciar Docker${c_reset}
${c_green}                     2X22220.${c_reset}                                     ${c_grey}| ${c_fg_bright_green}[2] Verificar Dependencias${c_reset}
${c_green}                    7X272aX.${c_reset}                                      ${c_grey}| ${c_yellow}[3] Iniciar Base de Dados${c_reset}
${c_green}                   .8XSXSr${c_reset}                                        ${c_grey}| ${c_yellow}[4] Ambiente Virtual${c_reset}
${c_green}                    S7i${c_reset}                                           ${c_grey}| ${c_fg_bright_red}[5] Sair${c_reset}
${c_green}       :72SXXXS27:      .r2SSXXX22i${c_reset}                               ${c_grey}|------------------------------------|${c_reset}
${c_green}     7XXX2222222XXXS22SXXaS2222222XX2:${c_reset}                            ${c_grey}| ${c_purple}OS Version: ${OS_VERSION}${c_reset}
${c_yellow}   780S222222222222SSa2S22222222222X8Br${c_reset}                           ${c_grey}| ${c_purple}Data: ${CURRENT_DATE}${c_reset}
${c_yellow} .:MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM.${c_reset}                              ${c_grey}| ${c_blue}Computador: ${PC_NAME}${c_reset}
${c_yellow} :iiiiiiiiiiiiiiiiiiiiiiiiiiiiiirrr${c_reset}                               ${c_blue}| ${c_white}Utilizador: ${CURRENT_USER}${c_reset}
${c_red}2222727222727222727272727272722222${c_reset}                                ${c_blue}| ${c_white}IPV4: ${IPV4_ADDRESS}${c_reset}
${c_red}r77777777777777777777777777777777S${c_reset}                                ${c_grey}|------------------------------------|${c_reset}
${c_red}.BBBMBMBMBBBMBMBMBMBBBMBMBMBBBMBBBB${c_reset}
${c_red} XBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.${c_reset}
${c_purple} MBMBMBMBMBMBMBMBMBMBMBMBMBMBMBBBB8BB88.${c_reset}
${c_purple}  XBBMM8M8MMM8MMMMM8MMM8MMMMMMM8M8MMBBBB${c_reset}
${c_purple}   BBBMZ80808Z808Z80Z0808080808Z8Z8088B.${c_reset}
${c_blue}     BBMMMMMMMMM8MMM8MMMMMMM8M8MMMMBBB:${c_reset}
${c_blue}      2M02S2S2S2SSaSXSXSa2S2S222SXM07${c_reset}
${c_blue}       iM8XX2SSXXZZM8M8M0XaS2SSX0M77${c_reset}
${c_blue}         .7222277.     .:722227:${c_reset}
"
    # --- Captura da escolha do usuário ---
    read -p "$(echo -e ${c_fg_bright_white}Escolha uma opcao e pressione Enter:${c_reset}) " CHOICE

    case $CHOICE in
        1) docker_menu ;;
        2) deps_menu ;;
        3) db_menu ;;
        4) venv_menu ;;
        5)
            clear
            echo "Saindo..."
            sleep 1
            exit 0
            ;;
        *)
            echo -e "\n${c_fg_bright_red}Opcao Invalida!${c_reset} Pressione Enter para tentar novamente."
            read
            ;;
    esac
done