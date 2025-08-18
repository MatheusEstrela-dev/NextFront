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
  echo -e "${c_fg_bright_green}==================================${c_reset}\n"

  # ===== ajuste: onde está o app =====
  APP_DIR="${APP_DIR:-./nextfront}"

  # ===== cores locais (se quiser trocar a paleta) =====
  C1="\033[38;5;45m"    # azul-ciano
  C2="\033[38;5;141m"   # roxo
  C3="\033[38;5;214m"   # laranja
  C4="\033[38;5;47m"    # verde
  C5="\033[38;5;81m"    # azul claro
  CERR="${c_fg_bright_red}"
  OK="${c_fg_bright_green}"
  WN="${c_yellow}"
  NT="${c_grey}"
  RS="\033[0m"

  # ===== helpers =====
  _ok()   { echo -e "  ${OK}✔${RS} $1"; }
  _warn() { echo -e "  ${WN}⚠${RS} $1"; }
  _err()  { echo -e "  ${CERR}✘ $1${RS}"; }
  _sep()  { echo -e "${NT}------------------------------------------------${RS}"; }
  _vge()  { [ "$(printf '%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]; } # >=
  _title(){ local t="$1" c="$2"; echo -e "${c}╔════════════════════════════════════════════════╗${RS}\n${c}║ ${t}$(printf '%*s' $((46-${#t})) ' ') ║${RS}\n${c}╠════════════════════════════════════════════════╣${RS}"; }
  _end()  { local c="$1"; echo -e "${c}╚════════════════════════════════════════════════╝${RS}\n"; }

  # saída (para resumo/exit code)
  FAIL=0; WARN=0
  _mark_fail(){ FAIL=$((FAIL+1)); }
  _mark_warn(){ WARN=$((WARN+1)); }

  # detecta package manager
  PKG="npm"
  command -v pnpm >/dev/null 2>&1 && PKG="pnpm"
  command -v yarn >/dev/null 2>&1 && PKG="yarn"

  _check_cmd_ver(){ # cmd min [flag]
    local cmd="$1" min="$2" flag="${3:---version}"
    if ! command -v "$cmd" >/dev/null 2>&1; then _err "$cmd não encontrado"; _mark_fail; return 1; fi
    local v; v="$($cmd $flag 2>/dev/null | head -n1 | grep -Eo '[0-9]+(\.[0-9]+){1,3}' | head -n1)"
    [ -z "$v" ] && { _warn "$cmd encontrado (versão não detectada)"; _mark_warn; return 0; }
    if _vge "$v" "$min"; then _ok "$cmd $v (>= $min)"; else _err "$cmd $v (< $min). Atualize para >= $min"; _mark_fail; fi
  }

  _port_busy(){ # returns 0 if busy
    local p="$1"
    if command -v ss >/dev/null 2>&1; then ss -lnt 2>/dev/null | awk '{print $4}' | grep -q ":$p$"
    elif command -v netstat >/dev/null 2>&1; then netstat -an 2>/dev/null | grep -q "[\.:]$p[[:space:]]"
    else return 1; fi
  }

  _has_pkg(){ (cd "$APP_DIR" 2>/dev/null && $PKG ls --depth=0 "$1" >/dev/null 2>&1); }

  # ============== SISTEMA (HOST) ==============
  _title "Sistema (Host)" "$C1"
  _check_cmd_ver node "18.17.0"
  _check_cmd_ver npm  "9.0.0"
  command -v npx >/dev/null 2>&1 || { _warn "npx não encontrado (vem com npm)"; _mark_warn; }
  echo
  if command -v docker >/dev/null 2>&1; then
    _check_cmd_ver docker "20.10.0"
    if docker info >/dev/null 2>&1; then _ok "Docker daemon em execução"; else _err "Docker daemon NÃO está em execução"; _mark_fail; fi
    if docker compose version >/dev/null 2>&1; then
      _ok "docker compose (plugin) $(docker compose version | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+' | head -n1)"
    elif command -v docker-compose >/dev/null 2>&1; then
      _warn "Usando docker-compose legado. Prefira 'docker compose' (plugin)"; _mark_warn
      _check_cmd_ver docker-compose "1.29.0"
    else
      _warn "Compose não encontrado. Alguns comandos de Docker podem falhar"; _mark_warn
    fi
  else
    _err "docker não encontrado"; _mark_fail
  fi
  _end "$C1"

  # ============== PORTAS ==============
  _title "Portas" "$C4"
  if _port_busy 3000; then _warn "Porta 3000 OCUPADA"; _mark_warn; else _ok "Porta 3000 livre"; fi
  if _port_busy 5555; then _warn "Porta 5555 OCUPADA (Prisma Studio)"; _mark_warn; else _ok "Porta 5555 livre"; fi
  _end "$C4"

  # ============== PROJETO ==============
  _title "Projeto (${APP_DIR})" "$C2"
  if [ ! -d "$APP_DIR" ]; then _err "Pasta ${APP_DIR} não encontrada (ajuste APP_DIR)"; _mark_fail; _end "$C2"; press_enter_to_continue; return; fi
  [ -f "$APP_DIR/package.json" ] && _ok "package.json encontrado" || { _err "package.json ausente em ${APP_DIR}"; _mark_fail; }
  _end "$C2"

  # ============== DEPENDÊNCIAS NPM ==============
  _title "Dependências NPM (app)" "$C5"
  DEPS=( next react react-dom @prisma/client prisma bcryptjs jose framer-motion lucide-react tailwindcss )
  for d in "${DEPS[@]}"; do
    if _has_pkg "$d"; then _ok "$d instalado"; else _err "$d AUSENTE (dica: cd ${APP_DIR} && $PKG add $d)"; _mark_fail; fi
  done
  if [ -f "$APP_DIR/requirements-node.txt" ]; then
    echo
    _ok "requirements-node.txt encontrado — checando versões fixas:"
    while IFS= read -r line; do
      [[ "$line" =~ ^#|^$ ]] && continue
      name="${line%@*}"; want="${line#*@}"
      cur="$(node -e "try{p=require('./${APP_DIR#./}/package.json');v=(p.dependencies&&p.dependencies['$name'])||(p.devDependencies&&p.devDependencies['$name'])||'';console.log(String(v||''))}catch(e){console.log('')}" 2>/dev/null)"
      cur="${cur#^}"; cur="${cur#~}"
      if [ -z "$cur" ]; then _warn "$name não consta no package.json"; _mark_warn
      elif [ "$cur" != "$want" ]; then _warn "$name versão $cur (desejado: $want)"; _mark_warn
      else _ok "$name @$want (ok)"; fi
    done < "$APP_DIR/requirements-node.txt"
  else
    echo; _warn "requirements-node.txt não encontrado (opcional para fixar versões)"; _mark_warn
  fi
  _end "$C5"

  # ============== PRISMA & BANCO ==============
  _title "Prisma & Banco" "$C3"
  if [ -f "$APP_DIR/prisma/schema.prisma" ]; then
    _ok "schema.prisma encontrado"
    grep -q '^DATABASE_URL=' "$APP_DIR/.env" 2>/dev/null && {
      _ok "DATABASE_URL definido em .env"
      DBV="$(grep '^DATABASE_URL=' "$APP_DIR/.env" | tail -n1 | cut -d= -f2-)"
      echo -e "  • ${NT}${DBV}${RS}"
      if echo "$DBV" | grep -qi 'file:.*\.db'; then
        DBFILE="$(echo "$DBV" | sed -E 's/^file:\.\/(.*)$/\1/I')"
        [ -f "$APP_DIR/$DBFILE" ] && _ok "SQLite OK: ${APP_DIR}/${DBFILE}" || { _warn "Arquivo SQLite não existe ainda (rode: cd ${APP_DIR} && npx prisma migrate dev)"; _mark_warn; }
      fi
    } || { _warn "DATABASE_URL não definido no .env"; _mark_warn; }
    for var in JWT_SECRET NEXT_PUBLIC_BASE_URL ADMIN_EMAIL ADMIN_PASSWORD; do
      grep -q "^${var}=" "$APP_DIR/.env" 2>/dev/null && _ok "${var} definido" || _warn "${var} não definido no .env"
    done
    if command -v npx >/dev/null 2>&1; then
      PV="$(cd "$APP_DIR" && npx prisma -v 2>/dev/null | tail -n1 | awk '{print $2}')"
      [ -n "$PV" ] && _ok "Prisma CLI: $PV"
      echo -e "  ${NT}Se aparecer 'openssl-1.1.x' em Docker, adicione ao Dockerfile:${RS}"
      echo -e "  ${NT}RUN apt-get update -y && apt-get install -y openssl${RS}"
    fi
  else
    _err "prisma/schema.prisma não encontrado"; _mark_fail
  fi
  _end "$C3"

  # ============== DOCKER COMPOSE ==============
  _title "Docker Compose" "$C1"
  if [ -f "./docker-compose.yml" ] || [ -f "./compose.yml" ]; then _ok "Arquivo compose encontrado"; else _warn "compose.yml/docker-compose.yml NÃO encontrado (opcional)"; _mark_warn; fi
  _end "$C1"

  # ============== AÇÕES SUGERIDAS ==============
  _title "Ações sugeridas" "$C4"
  echo "  • Instalar deps:           cd ${APP_DIR} && $PKG install"
  echo "  • Gerar Prisma Client:     cd ${APP_DIR} && npx prisma generate"
  echo "  • Criar/migrar DB:         cd ${APP_DIR} && npx prisma migrate dev"
  echo "  • Popular DB (seed):       cd ${APP_DIR} && $PKG run seed"
  echo "  • Abrir Prisma Studio:     cd ${APP_DIR} && npx prisma studio  (porta 5555)"
  echo "  • Subir dev (docker):      docker compose up -d && docker compose logs -f web"
  _end "$C4"

  # ============== SUMÁRIO ==============
  _title "Resumo" "$C5"
  [ "$FAIL" -eq 0 ] && _ok "Nenhum erro crítico" || _err "$FAIL erro(s) crítico(s)"
  [ "$WARN" -eq 0 ] && _ok "Nenhum aviso" || _warn "$WARN aviso(s)"
  _end "$C5"

  # exit code ajuda a CI/scripts
  if [ "$FAIL" -gt 0 ]; then EXIT=1
  elif [ "$WARN" -gt 0 ]; then EXIT=0
  else EXIT=0; fi

  echo -e "${OK}Verificação concluída.${RS}"
  press_enter_to_continue
  return $EXIT
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