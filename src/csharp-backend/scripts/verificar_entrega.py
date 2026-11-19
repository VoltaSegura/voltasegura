"""Gera evidências reais da execução local; somente dados/rotas sintéticos. Não faz push.
Uso: python scripts/verificar_entrega.py (na pasta src/csharp-backend ou de qualquer diretório).
"""
from __future__ import annotations
import json
import os
from pathlib import Path
import socket
import subprocess
import time
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

BACKEND = Path(__file__).resolve().parents[1]
EVIDENCIAS = BACKEND.parent / "soa-backend" / "evidencias"
FLAGS = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0

def salvar(nome, dado):
    (EVIDENCIAS / nome).write_text(json.dumps(dado, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def comando(nome, args, env):
    p = subprocess.run(args, cwd=BACKEND, env=env, capture_output=True, text=True,
                       encoding="utf-8", errors="replace", creationflags=FLAGS)
    (EVIDENCIAS / nome).write_text("$ " + " ".join(args) + "\n" + p.stdout + p.stderr, encoding="utf-8")
    if p.returncode: raise RuntimeError(f"Falha em {nome}; consulte a evidência.")

def chamar(base, caminho, corpo=None):
    req = Request(base + caminho, data=json.dumps(corpo).encode() if corpo is not None else None,
                  headers={"Content-Type": "application/json"})
    try:
        with urlopen(req, timeout=30) as res: return res.status, json.load(res)
    except HTTPError as error: return error.code, json.load(error)

def iniciar(projeto, env):
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        porta = sock.getsockname()[1]
    base = f"http://127.0.0.1:{porta}"
    processo = subprocess.Popen(["dotnet", str(BACKEND / projeto / "bin/Debug/net8.0" / (projeto + ".dll")),
                                 "--urls", base], cwd=BACKEND / projeto, env=env,
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=FLAGS)
    for _ in range(100):
        if processo.poll() is not None: raise RuntimeError(f"{projeto} encerrou antes de iniciar.")
        try:
            status, _ = chamar(base, "/swagger/v1/swagger.json")
            if status == 200: return processo, base
        except (URLError, ConnectionError): pass
        time.sleep(.2)
    processo.terminate()
    processo.wait(timeout=10)
    raise RuntimeError("API não iniciou no tempo limite.")

def main():
    EVIDENCIAS.mkdir(parents=True, exist_ok=True)
    banco = BACKEND / "dados" / f"verificacao-{time.time_ns()}.db"
    env = dict(os.environ, VOLTASEGURA_DB=str(banco), ASPNETCORE_ENVIRONMENT="Development", Roteamento__Modo="mock")
    comando("01-build.txt", ["dotnet", "build", "VoltaSegura.sln", "--nologo"], env)
    comando("02-testes.txt", ["dotnet", "test", "VoltaSegura.sln", "--no-build", "--nologo"], env)
    executar = ["dotnet", "run", "--no-build", "--project", "VoltaSegura.Servicos", "--"]
    comando("03-migracao.txt", executar + ["--migrar"], env)
    comando("04-migracao-idempotente.txt", executar + ["--migrar"], env)
    processo, base = iniciar("VoltaSegura.Servicos", env)
    try:
        status, vazio = chamar(base, "/api/dados/situacao")
        assert status == 200 and vazio["carregado"] is False
        salvar("05-banco-vazio.json", vazio)
    finally:
        processo.terminate(); processo.wait(timeout=10)
    comando("06-carga-sintetica.txt", executar + ["--demonstracao"], env)
    processo, base = iniciar("VoltaSegura.Servicos", env)
    try:
        status, swagger = chamar(base, "/swagger/v1/swagger.json")
        assert status == 200
        salvar("07-openapi-soa.json", swagger)
        status, acervo = chamar(base, "/api/dados/situacao")
        assert status == 200 and acervo["boletinsDistintos"] == 80 and acervo["exemplo"] is True
        salvar("08-acervo-demonstracao.json", acervo)
        pedido = json.loads((BACKEND / "exemplos/comparacao.json").read_text(encoding="utf-8"))
        status, resposta = chamar(base, "/api/comparacoes/trajetos", pedido)
        assert status == 200 and resposta["fontes"]["exemplo"] is True
        salvar("09-comparacao.json", {"httpStatus": status, "requisicao": pedido, "resposta": resposta})
        pedido_invalido = json.loads((BACKEND / "exemplos/comparacao-invalida.json").read_text(encoding="utf-8"))
        status, erro = chamar(base, "/api/comparacoes/trajetos", pedido_invalido)
        assert status == 400
        salvar("10-validacao-400.json", {"httpStatus": status, "resposta": erro})
        status, auditoria = chamar(base, "/api/dados/auditoria")
        assert status == 200 and len(auditoria) == 1
        assert set(auditoria[0]) == {"id", "dataHoraUtc", "statusResultado", "largurasTestadasM", "quantidadeRotas", "faixaConsulta"}
        salvar("11-auditoria.json", auditoria)
    finally:
        processo.terminate(); processo.wait(timeout=10)
    processo, base = iniciar("VoltaSegura.Servicos", env)
    try:
        _, persistida = chamar(base, "/api/dados/auditoria")
        assert persistida == auditoria
        salvar("12-auditoria-apos-reiniciar.json", persistida)
    finally:
        processo.terminate(); processo.wait(timeout=10)
    processo, base = iniciar("VoltaSegura.Api", env)
    try:
        status, resposta = chamar(base, "/api/ocorrencias")
        assert status == 200 and resposta["exemplo"] is True
        salvar("13-csharp-ocorrencias.json", resposta)
        status, bloqueio = chamar(base, "/api/trajetos")
        assert status == 403
        salvar("14-historico-desativado.json", {"httpStatus": status, "resposta": bloqueio})
        _, swagger = chamar(base, "/swagger/v1/swagger.json")
        salvar("15-openapi-csharp.json", swagger)
    finally:
        processo.terminate(); processo.wait(timeout=10)
    salvar("resultado.json", {"executadoEmUtc": datetime.now(timezone.utc).isoformat(),
        "resultado": "aprovado", "acervo": "80 registros sintéticos; nenhum BO real",
        "roteamento": "mock", "reinicioComPersistencia": True,
        "otp2RealValidado": False, "sspRealImportada": False})
    print(f"Evidências aprovadas: {EVIDENCIAS}")

if __name__ == "__main__": main()
