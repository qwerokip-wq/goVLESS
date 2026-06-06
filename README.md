# goVLESS

**goVLESS** — интерактивный установщик VPN-сервера на базе **3X-UI** (Xray-core) с протоколом **VLESS + XTLS-Vision** и маскировкой трафика.

## Возможности

- **Lite (Reality)** — маскировка под популярный домен, не требует SSL/домена
- **Pro (TLS)** — ваш домен + Let's Encrypt + реальный сайт-шаблон (1800+ шаблонов)
- Переключение между режимами без потери клиентов
- Telegram Bot для управления сервером
- Telegram Mini App (WebApp)
- Cloudflared Argo Tunnel (Lite)
- Двуязычный интерфейс (en/ru)
- BBR — автоматическое включение
- WAL-safe backup/restore

## Быстрый старт

### 1. Локальный запуск (если скопировал файлы на сервер)

```bash
sudo bash govless.sh
```

### 2. Через curl (одной строкой, на сервере)

```bash
sudo bash <(curl -sL https://raw.githubusercontent.com/qwerokip-wq/goVLESS/main/bootstrap.sh)
```

Если process substitution (`<(...)`) не работает (нет `/dev/fd`), используй pipe:

```bash
curl -sL https://raw.githubusercontent.com/qwerokip-wq/goVLESS/main/bootstrap.sh | sudo bash
```

### 3. Скачать и запустить (две команды)

```bash
curl -sL -o bootstrap.sh https://raw.githubusercontent.com/qwerokip-wq/goVLESS/main/bootstrap.sh
sudo bash bootstrap.sh
```

### 4. Через wget

```bash
wget -qO- https://raw.githubusercontent.com/qwerokip-wq/goVLESS/main/bootstrap.sh | sudo bash
```

### 5. Установка git + клонирование (для доступа к полному набору файлов)

```bash
sudo apt update && sudo apt install -y git
git clone https://github.com/qwerokip-wq/goVLESS.git
cd goVLESS
sudo bash govless.sh
```

### 6. Автоустановка Pro (без интерактива, env-конфиг)

```bash
sudo bash deploy_pro.sh
```

## Структура

| Файл | Описание |
|---|---|
| `govless.sh` | Главный интерактивный установщик |
| `install.sh` | Bootstrap для curl \| bash |
| `deploy_pro.sh` | Автоматическая установка Pro |
| `self_signed_cert.sh` | Генерация самоподписанных сертификатов |
| `lib/` | Модули (common, xui, website, i18n, mode_switch) |
| `phase-a/` | Telegram Bot, WebApp, JSON-RPC демон, systemd |
| `tools/` | Инструменты разработчика |
| `templates_catalog.json` | 1800+ шаблонов сайтов |

## Требования

- Linux (Ubuntu/Debian/CentOS)
- Root-доступ
- Для Pro: свой домен с A-записью на IP сервера

## Лицензия

MIT
