import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { PrismaClient, Perfil } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const PORT = Number(process.env.PORT || 3333);
const JWT_SECRET = process.env.JWT_SECRET || "atlas-secret";

const uploadDir = path.resolve(
  process.env.UPLOAD_DIR || "./uploads"
);

fs.mkdirSync(uploadDir, { recursive: true });

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(uploadDir));

/* =========================================================
   UPLOAD
========================================================= */

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },

  filename: (_req, file, callback) => {
    const safeName = file.originalname.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    callback(
      null,
      `${Date.now()}-${safeName}`
    );
  },
});

const upload = multer({
  storage,
});

/* =========================================================
   TIPOS
========================================================= */

type AuthRequest = express.Request & {
  user?: {
    id: string;
    perfil: Perfil;
  };
};

/* =========================================================
   MIDDLEWARE DE AUTENTICAÇÃO
========================================================= */

function auth(
  req: AuthRequest,
  res: express.Response,
  next: express.NextFunction
) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      message: "Token não informado",
    });
  }

  const token = header.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    ) as {
      id: string;
      perfil: Perfil;
    };

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Token inválido ou expirado",
    });
  }
}

/* =========================================================
   PERMISSÕES
========================================================= */

function roles(...allowed: Perfil[]) {
  return (
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Não autenticado",
      });
    }

    if (!allowed.includes(req.user.perfil)) {
      return res.status(403).json({
        message: "Você não possui permissão",
      });
    }

    next();
  };
}

const ADMIN = [Perfil.ADMINISTRADOR];

const QUALITY = [
  Perfil.ADMINISTRADOR,
  Perfil.SUPERVISOR,
];

const INSPECTION = [
  Perfil.ADMINISTRADOR,
  Perfil.SUPERVISOR,
  Perfil.INSPETOR,
];

const AUDIT = [
  Perfil.ADMINISTRADOR,
  Perfil.SUPERVISOR,
  Perfil.AUDITOR,
];

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (_req, res) => {
  res.json({
    sistema: "Atlas Gestão",
    status: "online",
    data: new Date(),
  });
});

/* =========================================================
   LOGIN
========================================================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        message: "Informe e-mail e senha",
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: {
        email,
      },
    });

    if (!usuario) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos",
      });
    }

    if (usuario.status !== "ATIVO") {
      return res.status(403).json({
        message: "Usuário inativo",
      });
    }

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaValida) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos",
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        perfil: usuario.perfil,
      },
      JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    return res.json({
      token,

      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao realizar login",
    });
  }
});

/* =========================================================
   DASHBOARD
========================================================= */

app.get(
  "/api/dashboard",
  auth,
  async (_req, res) => {
    try {
      const [
        inspecoes,
        naoConformidades,
        acoesAbertas,
        acoesConcluidas,
        auditorias,
        documentos,
        conformes,
        reprovados,
      ] = await Promise.all([
        prisma.inspecao.count(),

        prisma.naoConformidade.count({
          where: {
            status: {
              not: "FECHADA",
            },
          },
        }),

        prisma.acaoCorretiva.count({
          where: {
            status: {
              in: [
                "ABERTA",
                "EM_ANDAMENTO",
                "ATRASADA",
              ],
            },
          },
        }),

        prisma.acaoCorretiva.count({
          where: {
            status: "CONCLUIDA",
          },
        }),

        prisma.auditoria.count(),

        prisma.documento.count(),

        prisma.inspecao.count({
          where: {
            resultado: "CONFORME",
          },
        }),

        prisma.inspecao.count({
          where: {
            resultado: "NAO_CONFORME",
          },
        }),
      ]);

      const taxaConformidade =
        inspecoes > 0
          ? Math.round(
              (conformes / inspecoes) * 100
            )
          : 0;

      const registros =
        await prisma.inspecao.findMany({
          select: {
            data: true,
            resultado: true,
          },

          orderBy: {
            data: "asc",
          },
        });

      const meses: Record<
        string,
        {
          total: number;
          conformes: number;
        }
      > = {};

      registros.forEach((item) => {
        const mes = item.data
          .toISOString()
          .slice(0, 7);

        if (!meses[mes]) {
          meses[mes] = {
            total: 0,
            conformes: 0,
          };
        }

        meses[mes].total++;

        if (
          item.resultado === "CONFORME"
        ) {
          meses[mes].conformes++;
        }
      });

      res.json({
        cards: {
          inspecoes,
          naoConformidades,
          acoesAbertas,
          acoesConcluidas,
          auditorias,
          documentos,
          conformes,
          reprovados,
          taxaConformidade,
        },

        graficos: {
          inspecoesPorMes:
            Object.entries(meses).map(
              ([mes, valores]) => ({
                mes,
                ...valores,
              })
            ),
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Erro ao carregar dashboard",
      });
    }
  }
);

/* =========================================================
   INSPEÇÕES
========================================================= */

app.get(
  "/api/inspecoes",
  auth,
  async (_req, res) => {
    const registros =
      await prisma.inspecao.findMany({
        include: {
          responsavel: {
            select: {
              id: true,
              nome: true,
            },
          },

          naoConformidade: true,
        },

        orderBy: {
          data: "desc",
        },
      });

    res.json(registros);
  }
);

app.get(
  "/api/inspecoes/:id",
  auth,
  async (req, res) => {
    const registro =
      await prisma.inspecao.findUnique({
        where: {
          id: req.params.id,
        },

        include: {
          responsavel: true,
          naoConformidade: true,
        },
      });

    if (!registro) {
      return res.status(404).json({
        message: "Inspeção não encontrada",
      });
    }

    res.json(registro);
  }
);

app.post(
  "/api/inspecoes",
  auth,
  roles(...INSPECTION),
  async (req, res) => {
    try {
      const registro =
        await prisma.inspecao.create({
          data: req.body,
        });

      res.status(201).json(registro);
    } catch (error) {
      res.status(400).json({
        message: "Erro ao cadastrar inspeção",
        error,
      });
    }
  }
);

app.put(
  "/api/inspecoes/:id",
  auth,
  roles(...INSPECTION),
  async (req, res) => {
    const registro =
      await prisma.inspecao.update({
        where: {
          id: req.params.id,
        },

        data: req.body,
      });

    res.json(registro);
  }
);

app.delete(
  "/api/inspecoes/:id",
  auth,
  roles(...INSPECTION),
  async (req, res) => {
    await prisma.inspecao.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(204).send();
  }
);

/* =========================================================
   NÃO CONFORMIDADES
========================================================= */

app.get(
  "/api/nao-conformidades",
  auth,
  async (_req, res) => {
    const registros =
      await prisma.naoConformidade.findMany({
        include: {
          responsavel: {
            select: {
              id: true,
              nome: true,
            },
          },

          acoes: true,
        },

        orderBy: {
          data: "desc",
        },
      });

    res.json(registros);
  }
);

app.post(
  "/api/nao-conformidades",
  auth,
  roles(...INSPECTION),
  async (req, res) => {
    const registro =
      await prisma.naoConformidade.create({
        data: req.body,
      });

    res.status(201).json(registro);
  }
);

app.put(
  "/api/nao-conformidades/:id",
  auth,
  roles(...INSPECTION),
  async (req, res) => {
    const registro =
      await prisma.naoConformidade.update({
        where: {
          id: req.params.id,
        },

        data: req.body,
      });

    res.json(registro);
  }
);

app.delete(
  "/api/nao-conformidades/:id",
  auth,
  roles(...INSPECTION),
  async (req, res) => {
    await prisma.naoConformidade.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(204).send();
  }
);

/* =========================================================
   AÇÕES CORRETIVAS
========================================================= */

app.get(
  "/api/acoes-corretivas",
  auth,
  async (_req, res) => {
    const registros =
      await prisma.acaoCorretiva.findMany({
        include: {
          responsavel: true,
          naoConformidade: true,
        },

        orderBy: {
          prazo: "asc",
        },
      });

    res.json(registros);
  }
);

app.post(
  "/api/acoes-corretivas",
  auth,
  roles(...QUALITY),
  async (req, res) => {
    const registro =
      await prisma.acaoCorretiva.create({
        data: req.body,
      });

    res.status(201).json(registro);
  }
);

app.put(
  "/api/acoes-corretivas/:id",
  auth,
  roles(...QUALITY),
  async (req, res) => {
    const registro =
      await prisma.acaoCorretiva.update({
        where: {
          id: req.params.id,
        },

        data: req.body,
      });

    res.json(registro);
  }
);

app.delete(
  "/api/acoes-corretivas/:id",
  auth,
  roles(...QUALITY),
  async (req, res) => {
    await prisma.acaoCorretiva.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(204).send();
  }
);

/* =========================================================
   AUDITORIAS
========================================================= */

app.get(
  "/api/auditorias",
  auth,
  async (_req, res) => {
    const registros =
      await prisma.auditoria.findMany({
        include: {
          auditor: true,
        },

        orderBy: {
          data: "desc",
        },
      });

    res.json(registros);
  }
);

app.post(
  "/api/auditorias",
  auth,
  roles(...AUDIT),
  async (req, res) => {
    const registro =
      await prisma.auditoria.create({
        data: req.body,
      });

    res.status(201).json(registro);
  }
);

app.put(
  "/api/auditorias/:id",
  auth,
  roles(...AUDIT),
  async (req, res) => {
    const registro =
      await prisma.auditoria.update({
        where: {
          id: req.params.id,
        },

        data: req.body,
      });

    res.json(registro);
  }
);

app.delete(
  "/api/auditorias/:id",
  auth,
  roles(...AUDIT),
  async (req, res) => {
    await prisma.auditoria.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(204).send();
  }
);

/* =========================================================
   DOCUMENTOS
========================================================= */

app.get(
  "/api/documentos",
  auth,
  async (_req, res) => {
    const documentos =
      await prisma.documento.findMany({
        include: {
          responsavel: true,
          revisoes: true,
        },

        orderBy: {
          data: "desc",
        },
      });

    res.json(documentos);
  }
);

app.post(
  "/api/documentos/upload",
  auth,
  roles(...QUALITY),
  upload.single("arquivo"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "Arquivo não enviado",
      });
    }

    const documento =
      await prisma.documento.create({
        data: {
          codigo: req.body.codigo,
          nome: req.body.nome,
          tipo: req.body.tipo,
          revisao: req.body.revisao,
          data: new Date(),
          arquivo: `/uploads/${req.file.filename}`,
          responsavelId:
            req.body.responsavelId,
        },
      });

    res.status(201).json(documento);
  }
);

/* =========================================================
   USUÁRIOS
========================================================= */

app.get(
  "/api/usuarios",
  auth,
  roles(...ADMIN),
  async (_req, res) => {
    const usuarios =
      await prisma.usuario.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true,
          status: true,
          criadoEm: true,
        },

        orderBy: {
          nome: "asc",
        },
      });

    res.json(usuarios);
  }
);

app.post(
  "/api/usuarios",
  auth,
  roles(...ADMIN),
  async (req, res) => {
    const senha =
      await bcrypt.hash(
        req.body.senha,
        10
      );

    const usuario =
      await prisma.usuario.create({
        data: {
          nome: req.body.nome,
          email: req.body.email,
          senha,
          perfil: req.body.perfil,
          status:
            req.body.status || "ATIVO",
        },
      });

    res.status(201).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      status: usuario.status,
    });
  }
);

/* =========================================================
   RELATÓRIO PDF
========================================================= */

app.get(
  "/api/relatorios/:tipo/pdf",
  auth,
  async (req, res) => {
    let registros: any[] = [];

    if (
      req.params.tipo ===
      "inspecoes"
    ) {
      registros =
        await prisma.inspecao.findMany();
    }

    if (
      req.params.tipo ===
      "auditorias"
    ) {
      registros =
        await prisma.auditoria.findMany();
    }

    if (
      req.params.tipo ===
      "nao-conformidades"
    ) {
      registros =
        await prisma.naoConformidade.findMany();
    }

    if (
      req.params.tipo ===
      "acoes-corretivas"
    ) {
      registros =
        await prisma.acaoCorretiva.findMany();
    }

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="atlas-${req.params.tipo}.pdf"`
    );

    const pdf =
      new PDFDocument({
        margin: 40,
      });

    pdf.pipe(res);

    pdf
      .fontSize(22)
      .text("Atlas Gestão");

    pdf
      .fontSize(14)
      .text(
        `Relatório de ${req.params.tipo}`
      );

    pdf
      .fontSize(9)
      .fillColor("#64748b")
      .text(
        new Date().toLocaleString(
          "pt-BR"
        )
      );

    pdf.moveDown();

    registros.forEach(
      (registro, index) => {
        pdf
          .fontSize(10)
          .fillColor("#1f2937")
          .text(
            `${index + 1}. ${
              registro.codigo ||
              registro.numero ||
              registro.nome ||
              registro.id
            }`
          );

        pdf
          .fontSize(9)
          .fillColor("#475569")
          .text(
            registro.descricao ||
              registro.produto ||
              registro.planoAcao ||
              registro.setor ||
              "-"
          );

        pdf.moveDown();
      }
    );

    pdf.end();
  }
);

/* =========================================================
   RELATÓRIO EXCEL
========================================================= */

app.get(
  "/api/relatorios/:tipo/excel",
  auth,
  async (req, res) => {
    const workbook =
      new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet(
        "Relatório"
      );

    worksheet.columns = [
      {
        header: "Código/Número",
        key: "codigo",
        width: 25,
      },
      {
        header: "Descrição",
        key: "descricao",
        width: 45,
      },
      {
        header: "Status",
        key: "status",
        width: 25,
      },
      {
        header: "Data",
        key: "data",
        width: 18,
      },
    ];

    let registros: any[] = [];

    if (
      req.params.tipo ===
      "inspecoes"
    ) {
      registros =
        await prisma.inspecao.findMany();
    }

    if (
      req.params.tipo ===
      "auditorias"
    ) {
      registros =
        await prisma.auditoria.findMany();
    }

    if (
      req.params.tipo ===
      "nao-conformidades"
    ) {
      registros =
        await prisma.naoConformidade.findMany();
    }

    if (
      req.params.tipo ===
      "acoes-corretivas"
    ) {
      registros =
        await prisma.acaoCorretiva.findMany();
    }

    registros.forEach(
      (registro) => {
        worksheet.addRow({
          codigo:
            registro.codigo ||
            registro.numero ||
            registro.id,

          descricao:
            registro.descricao ||
            registro.produto ||
            registro.planoAcao ||
            registro.setor ||
            "-",

          status:
            registro.status ||
            registro.resultado ||
            "-",

          data:
            registro.data
              ? new Date(
                  registro.data
                ).toLocaleDateString(
                  "pt-BR"
                )
              : "",
        });
      }
    );

    worksheet.getRow(1).font = {
      bold: true,
    };

    worksheet.autoFilter = {
      from: "A1",
      to: "D1",
    };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="atlas-${req.params.tipo}.xlsx"`
    );

    await workbook.xlsx.write(res);

    res.end();
  }
);

/* =========================================================
   ERROS
========================================================= */

app.use(
  (
    error: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(error);

    res.status(500).json({
      message:
        error?.message ||
        "Erro interno do servidor",
    });
  }
);

/* =========================================================
   SERVIDOR
========================================================= */

app.listen(PORT, () => {
  console.log(
    `Atlas Gestão API rodando em http://localhost:${PORT}`
  );
});
