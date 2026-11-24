---
name: subir-drive
description: Sobe arquivos grandes (vídeos, zip) para uma pasta do Google Drive do Patrik a partir da nuvem, contornando o limite de ~3 MB por envio do conector. Use quando o Patrik pedir "sobe no Drive", "coloca na pasta do Drive" ou entregar criativos/vídeos no Drive.
---
# Subir arquivos grandes no Google Drive

O conector do Google Drive desta nuvem aceita só ~3,1 MB por chamada. Para arquivos maiores:

1. **Cortar** em pedaços de 2.883.584 bytes:
   `python3 tools/drive_partes.py <pasta_tmp> <ID_DA_PASTA_DESTINO> arquivo1.mp4 arquivo2.mp4 ...`
   (o ID é o final do link `drive.google.com/drive/folders/<ID>`).
2. **Enviar cada pedaço** com `mcp__Google_Drive__create_file`:
   - `title` = 1ª coluna (formato `ID_DESTINO~~NOME~~001~~009.bin`)
   - `parentId` = `1F0YGPhL_60IsLjE60nbxQgO3Tb6OSt0a` (pasta "Claude – envios em partes (não mexer)")
   - `contentMimeType` = `application/octet-stream`, `disableConversionToGoogleType` = true
   - `base64Content` = `sha256:<2ª coluna>:<3ª coluna>` (referência de arquivo; não digitar base64)
   - Dá para mandar ~10 em paralelo por mensagem.
3. **O robô junta sozinho**: o Apps Script "Claude – juntar envios" (código em `tools/juntar_partes.gs`, instalado na conta do Patrik)
   roda a cada 5 min, monta o arquivo inteiro na pasta destino (upload resumível do Google) e manda os pedaços para a lixeira.
4. **Conferir**: depois de ~5–10 min, `mcp__Google_Drive__search_files` com `parentId = '<ID_DESTINO>'` e ver nome e `fileSize`
   iguais ao original. Se os pedaços continuarem na pasta de entrada, o robô não rodou: avisar o Patrik (execuções em script.google.com).

Se o robô não estiver instalado (pedaços parados), mandar ao Patrik o passo a passo de instalação do fim de `tools/juntar_partes.gs`.
