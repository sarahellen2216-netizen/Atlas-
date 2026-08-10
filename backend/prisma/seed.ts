```ts
import {
  PrismaClient,
  Perfil,
  StatusUsuario,
  ResultadoInspecao,
  Gravidade,
  StatusNaoConformidade,
  StatusAcaoCorretiva,
  ResultadoAuditoria,
  TipoDocumento,
} from "@prisma/client";

import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do Atlas Gestão...");

  const senhaAdmin = await bcrypt.hash(
    "Admin@123",
    10
  );

  const admin = await prisma.usuario.upsert({
    where: {
      email: "admin@atlasgestao.com",
    },

    update: {},

    create: {
      nome: "Administrador Atlas",
      email: "admin@atlasgestao.com",
      senha: senhaAdmin,
      perfil: Perfil.ADMINISTRADOR,
      status: StatusUsuario.ATIVO,
    },
  });

  const supervisor =
    await prisma.usuario.upsert({
      where: {
        email: "supervisor@atlasgestao.com",
      },

      update: {},

      create: {
        nome: "Supervisor da Qualidade",
        email: "supervisor@atlasgestao.com",
        senha: await bcrypt.hash(
          "Supervisor@123",
          10
        ),
        perfil: Perfil.SUPERVISOR,
        status: StatusUsuario.ATIVO,
      },
    });

  const inspetor =
    await prisma.usuario.upsert({
      where: {
        email: "inspetor@atlasgestao.com",
      },

      update: {},

      create: {
        nome: "Inspetor da Qualidade",
        email: "inspetor@atlasgestao.com",
        senha: await bcrypt.hash(
          "Inspetor@123",
          10
        ),
        perfil: Perfil.INSPETOR,
        status: StatusUsuario.ATIVO,
      },
    });

  const auditor =
    await prisma.usuario.upsert({
      where: {
        email: "auditor@atlasgestao.com",
      },

      update: {},

      create: {
        nome: "Auditor Interno",
        email: "auditor@atlasgestao.com",
        senha: await bcrypt.hash(
          "Auditor@123",
          10
        ),
        perfil: Perfil.AUDITOR,
        status: StatusUsuario.ATIVO,
      },
    });

  const inspecao =
    await prisma.inspecao.upsert({
      where: {
        codigo: "INS-0001",
      },

      update: {},

      create: {
        codigo: "INS-0001",
        produto: "Produto A",
        lote: "LOTE-2026-001",
        responsavelId: inspetor.id,
        data: new Date(),
        local: "Linha de Produção 01",
        tipo: "Inspeção de Recebimento",
        resultado:
          ResultadoInspecao.NAO_CONFORME,
        observacoes:
          "Produto apresentou divergência.",
        descricaoNC:
          "Dimensão fora da especificação.",
        gravidade: Gravidade.MEDIA,
      },
    });

  const nc =
    await prisma.naoConformidade.upsert({
      where: {
        codigo: "NC-0001",
      },

      update: {},

      create: {
        codigo: "NC-0001",
        inspecaoId: inspecao.id,
        produto: "Produto A",
        processo: "Produção",
        descricao:
          "Dimensão do produto fora da especificação.",
        categoria: "Produto",
        gravidade: Gravidade.MEDIA,
        responsavelId: supervisor.id,
        evidencias:
          "Foto e registro de inspeção.",
        status:
          StatusNaoConformidade.ABERTA,
      },
    });

  await prisma.acaoCorretiva.upsert({
    where: {
      numero: "AC-0001",
    },

    update: {},

    create: {
      numero: "AC-0001",
      naoConformidadeId: nc.id,
      responsavelId: supervisor.id,
      dataAbertura: new Date(),
      prazo: new Date(
        Date.now() +
          15 * 24 * 60 * 60 * 1000
      ),
      planoAcao:
        "Revisar parâmetro do processo e realizar nova inspeção.",
      status:
        StatusAcaoCorretiva.EM_ANDAMENTO,
    },
  });

  await prisma.auditoria.upsert({
    where: {
      codigo: "AUD-0001",
    },

    update: {},

    create: {
      codigo: "AUD-0001",
      auditorId: auditor.id,
      setor: "Produção",
      data: new Date(),
      tipo: "Auditoria Interna",
      checklist:
        "Checklist de conformidade do processo produtivo.",
      resultado:
        ResultadoAuditoria.PARCIALMENTE_CONFORME,
      observacoes:
        "Foram identificadas oportunidades de melhoria.",
    },
  });

  await prisma.documento.upsert({
    where: {
      codigo: "POP-0001",
    },

    update: {},

    create: {
      codigo: "POP-0001",
      nome: "Procedimento Operacional Padrão",
      tipo: TipoDocumento.POP,
      revisao: "00",
      data: new Date(),
      responsavelId: supervisor.id,
      arquivo: "",
      ativo: true,
    },
  });

  await prisma.configuracaoEmpresa.create({
    data: {
      nomeFantasia: "Atlas Gestão",
      razaoSocial:
        "Atlas Gestão da Qualidade Ltda.",
      email: "contato@atlasgestao.com",
    },
  });

  console.log(
    "Seed concluído com sucesso!"
  );

  console.log("");
  console.log(
    "Usuário administrador:"
  );
  console.log(
    "E-mail: admin@atlasgestao.com"
  );
  console.log(
    "Senha: Admin@123"
  );
}

main()
  .catch((error) => {
    console.error(
      "Erro no seed:",
      error
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```
