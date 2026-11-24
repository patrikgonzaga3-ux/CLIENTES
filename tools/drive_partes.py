"""Corta arquivos em pedaços de 2.883.584 bytes (11 x 256 KB) para enviar ao Drive pelo conector (limite ~3 MB por envio).
Uso: python3 tools/drive_partes.py PASTA_SAIDA ID_PASTA_DESTINO arquivo1 [arquivo2 ...]
Imprime, para cada pedaço: título no Drive, sha256 e caminho -> base64Content = "sha256:<hash>:<caminho>"."""
import hashlib, os, sys
CH = 11 * 262144
saida, destino, arquivos = sys.argv[1], sys.argv[2], sys.argv[3:]
os.makedirs(saida, exist_ok=True); k = 0
for caminho in arquivos:
    dados = open(caminho, "rb").read(); nome = os.path.basename(caminho); tot = (len(dados) + CH - 1) // CH
    for i in range(tot):
        b = dados[i * CH:(i + 1) * CH]; p = os.path.abspath(f"{saida}/p_{k:03d}.bin"); open(p, "wb").write(b); k += 1
        print(f"{destino}~~{nome}~~{i + 1:03d}~~{tot:03d}.bin\t{hashlib.sha256(b).hexdigest()}\t{p}")
