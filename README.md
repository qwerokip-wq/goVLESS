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

```bash
sudo bash govless.sh
```

Или через curl (на сервере):

```bash
sudo bash <(curl -sL https://raw.githubusercontent.com/qwerokip-wq/goVLESS/main/bootstrap.sh)
```

## Автоустановка Pro (без интерактива)

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
