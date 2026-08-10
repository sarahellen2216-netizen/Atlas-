import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function listarAcoes(
  req: Request,
  res: Response
) {
  try {
    const acoes =
      await prisma.acaoCorretiva.findMany({
        orderBy: {
          id: "desc",
        },
        include: {
          naoConformidade: true,
        },
      });

    return res.json(acoes);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Erro ao buscar ações corretivas.",
    });
  }
}

export async function buscarAcao(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    const acao =
      await prisma.acaoCorretiva.findUnique({
        where: {
          id,
        },
        include: {
          naoConformidade: true,
        },
      });

    if (!acao) {
      return res.status(404).json({
        message:
          "Ação corretiva não encontrada.",
      });
    }

    return res.json(acao);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Erro ao buscar ação corretiva.",
    });
  }
}

export async function criarAcao(
  req: Request,
  res: Response
) {
  try {
    const {
      numero,
      nao_conformidade_id,
      responsavel,
      data_abertura,
      prazo,
      plano_acao,
      status,
      observacoes,
      percentual,
    } = req.body;

    if (
      !numero ||
      !responsavel ||
      !data_abertura ||
      !prazo ||
      !plano_acao
    ) {
      return res.status(400).json({
        message:
          "Preencha os campos obrigatórios.",
      });
    }

    const acao =
      await prisma.acaoCorretiva.create({
        data: {
          numero,

          nao_conformidade_id:
            nao_conformidade_id
              ? Number(
                  nao_conformidade_id
                )
              : null,

          responsavel,

          data_abertura:
            new Date(
              data_abertura
            ),

          prazo:
            new Date(prazo),

          plano_acao,

          status:
            status || "ABERTA",

          observacoes:
            observacoes || null,

          percentual:
            percentual !== undefined
              ? Number(percentual)
              : 0,
        },

        include: {
          naoConformidade: true,
        },
      });

    return res.status(201).json(acao);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Erro ao criar ação corretiva.",
    });
  }
}

export async function atualizarAcao(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    const {
      numero,
      nao_conformidade_id,
      responsavel,
      data_abertura,
      prazo,
      plano_acao,
      status,
      observacoes,
      percentual,
    } = req.body;

    const acao =
      await prisma.acaoCorretiva.update({
        where: {
          id,
        },

        data: {
          numero,

          nao_conformidade_id:
            nao_conformidade_id
              ? Number(
                  nao_conformidade_id
                )
              : null,

          responsavel,

          data_abertura:
            new Date(
              data_abertura
            ),

          prazo:
            new Date(prazo),

          plano_acao,

          status,

          observacoes:
            observacoes || null,

          percentual:
            percentual !== undefined
              ? Number(percentual)
              : 0,
        },

        include: {
          naoConformidade: true,
        },
      });

    return res.json(acao);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Erro ao atualizar ação corretiva.",
    });
  }
}

export async function excluirAcao(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    await prisma.acaoCorretiva.delete({
      where: {
        id,
      },
    });

    return res.json({
      message:
        "Ação corretiva excluída com sucesso.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Erro ao excluir ação corretiva.",
    });
  }
}
