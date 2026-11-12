using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VoltaSegura.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MigracaoInicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ocorrencias",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NumeroBo = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                    AnoBo = table.Column<string>(type: "TEXT", maxLength: 8, nullable: false),
                    Delegacia = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Rubrica = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    TipoLocal = table.Column<string>(type: "TEXT", maxLength: 60, nullable: false),
                    Bairro = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    Municipio = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    DataOcorrencia = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Faixa = table.Column<int>(type: "INTEGER", nullable: true),
                    Latitude = table.Column<double>(type: "REAL", nullable: true),
                    Longitude = table.Column<double>(type: "REAL", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ocorrencias", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "registros_consulta",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DataHoraUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    StatusResultado = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    LargurasTestadasM = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                    QuantidadeRotas = table.Column<int>(type: "INTEGER", nullable: false),
                    FaixaConsulta = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_registros_consulta", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "trajetos",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NomeOrigem = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    NomeDestino = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Sentido = table.Column<string>(type: "TEXT", maxLength: 8, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trajetos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "trechos",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Ordem = table.Column<int>(type: "INTEGER", nullable: false),
                    Modo = table.Column<string>(type: "TEXT", maxLength: 12, nullable: false),
                    ComprimentoKm = table.Column<double>(type: "REAL", nullable: false),
                    GeometriaJson = table.Column<string>(type: "TEXT", nullable: false),
                    TrajetoId = table.Column<long>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trechos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_trechos_trajetos_TrajetoId",
                        column: x => x.TrajetoId,
                        principalTable: "trajetos",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ocorrencias_Bairro_DataOcorrencia",
                table: "ocorrencias",
                columns: new[] { "Bairro", "DataOcorrencia" });

            migrationBuilder.CreateIndex(
                name: "IX_ocorrencias_Faixa",
                table: "ocorrencias",
                column: "Faixa");

            migrationBuilder.CreateIndex(
                name: "IX_ocorrencias_NumeroBo_AnoBo_Delegacia",
                table: "ocorrencias",
                columns: new[] { "NumeroBo", "AnoBo", "Delegacia" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_trajetos_NomeOrigem_NomeDestino_Sentido",
                table: "trajetos",
                columns: new[] { "NomeOrigem", "NomeDestino", "Sentido" });

            migrationBuilder.CreateIndex(
                name: "IX_trechos_TrajetoId",
                table: "trechos",
                column: "TrajetoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ocorrencias");

            migrationBuilder.DropTable(
                name: "registros_consulta");

            migrationBuilder.DropTable(
                name: "trechos");

            migrationBuilder.DropTable(
                name: "trajetos");
        }
    }
}
