import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path, { dirname } from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import twilio from "twilio";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      cb(null, "public/files");
    } catch (error) {
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    const fileName = `${file.fieldname}_${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  limits: {
    fieldSize: 2000000,
  },
  fileFilter: function (req, file, cb) {
    const allowedFileTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Tipe file tidak valid, hanya pdf, docx, xlsx dan xls yang diperbolehkan"
        ),
        false
      );
    }
  },
}).fields([
  { name: "pdf_file", maxCount: 1 },
  { name: "file_pengantar", maxCount: 1 },
  { name: "file_kk", maxCount: 1 },
  { name: "file_akte", maxCount: 1 },
  { name: "file_suratKelahiran", maxCount: 1 },
  { name: "file_suratKematian", maxCount: 1 },
  { name: "file_suratNikah", maxCount: 1 },
  { name: "file_KTPAyah", maxCount: 1 },
  { name: "file_KTPIbu", maxCount: 1 },
  { name: "file_KTPMeninggal", maxCount: 1 },
  { name: "file_KTPPemohon", maxCount: 1 },
]);

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

export const getAllLetters = async (req, res) => {
  try {
    BigInt.prototype.toJSON = function () {
      const int = Number.parseInt(this.toString());
      return int ?? this.toString();
    };

    const page = parseInt(req.query.page) || 0;

    const limit = parseInt(req.query.limit) || 10;

    const search = req.query.search_query || "";

    const offset = limit * page;

    const totalRows = await prisma.letterRequest.count({
      where: {
        OR: [
          {
            author: {
              fullname: {
                contains: search,
              },
            },
          },
          {
            author: {
              address: {
                contains: search,
              },
            },
          },
        ],
      },
    });

    const totalPage = Math.ceil(totalRows / limit);

    const results = await prisma.letterRequest.findMany({
      where: {
        OR: [
          {
            author: {
              fullname: {
                contains: search,
              },
            },
          },
          {
            author: {
              address: {
                contains: search,
              },
            },
          },
        ],
      },
      include: {
        author: {
          select: {
            fullname: true,
            nik: true,
            address: true,
            phoneNumber: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        request_id: "desc",
      },
    });
    res.status(200).json({
      results,
      page,
      limit,
      totalRows,
      totalPage,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getIncomingLetter = async (req, res) => {
  try {
    const incomingLetter = await prisma.letterRequest.count({
      where: {
        status: {
          equals: "pending",
        },
      },
    });

    res.status(200).json({ incomingLetter });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getOutgoingLetter = async (req, res) => {
  try {
    const outgoingLetter = await prisma.letterRequest.count({
      where: {
        status: {
          equals: "acc",
        },
      },
    });
    res.status(200).json({
      outgoingLetter,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getRejectedLetter = async (req, res) => {
  try {
    const rejectedLetter = await prisma.letterRequest.count({
      where: {
        status: {
          equals: "ditolak",
        },
      },
    });
    res.status(200).json({
      rejectedLetter,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getShowFileLetterById = async (req, res) => {
  const { id } = req.params;

  try {
    const letter = await prisma.letterRequest.findUnique({
      where: {
        request_id: id,
      },
    });

    if (!letter) {
      return res.status(404).json({ msg: "Surat tidak ditemukan" });
    }

    const filepath = path.join(__dirname, "..", "..", letter.pdf_file);

    if (!filepath) {
      return res.status(404).json({ msg: "Surat tidak memiliki file PDF" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.sendFile(filepath, { attachment: false });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

export const getLetterById = async (req, res) => {
  const { id } = req.params;

  try {
    const letter = await prisma.letterRequest.findUnique({
      where: {
        request_id: id,
      },
    });

    if (!letter) return res.status(404).json({ msg: "Surat tidak ada" });

    res.status(200).json(letter);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

export const getLetterByNumber = async (req, res) => {
  const { numberLetter } = req.params;

  try {
    const letter = await prisma.letterRequest.findFirst({
      where: {
        letter_number: numberLetter,
      },
    });

    if (!letter) return res.status(404).json({ msg: "Surat tidak ada" });

    res.status(200).json(letter);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

export const getLetterByAuthor = async (req, res) => {
  const id = req.cookies.id;

  try {
    BigInt.prototype.toJSON = function () {
      const int = Number.parseInt(this.toString());
      return int ?? this.toString();
    };

    const letter = await prisma.letterRequest.findMany({
      where: {
        authorId: id,
      },
      include: {
        author: {
          select: {
            fullname: true,
            nik: true,
            address: true,
            phoneNumber: true,
          },
        },
      },
    });

    res.status(200).json(letter);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getMonthlyStatistics = async (req, res) => {
  try {
    const months = 12; // Sesuaikan sesuai kebutuhan

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const startDate = new Date(currentYear, currentMonth - months, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    const incomingCount = await prisma.letterRequest.count({
      where: {
        status: "pending",
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const outgoingCount = await prisma.letterRequest.count({
      where: {
        status: "acc",
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    res.status(200).json({
      incoming: incomingCount,
      outgoing: outgoingCount,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createLetter = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ msg: "File upload invalid: " + err });
    }

    const { letter_type } = req.body;
    const pdf_file = req.files["pdf_file"]
      ? req.files["pdf_file"][0].path.replace(/\\/g, "/")
      : null;
    const file_pengantar = req.files["file_pengantar"]
      ? req.files["file_pengantar"][0].path.replace(/\\/g, "/")
      : null;
    const file_kk = req.files["file_kk"]
      ? req.files["file_kk"][0].path.replace(/\\/g, "/")
      : null;
    const file_akte = req.files["file_akte"]
      ? req.files["file_akte"][0].path.replace(/\\/g, "/")
      : null;
    const file_suratKelahiran = req.files["file_suratKelahiran"]
      ? req.files["file_suratKelahiran"][0].path.replace(/\\/g, "/")
      : null;
    const file_suratNikah = req.files["file_suratNikah"]
      ? req.files["file_suratNikah"][0].path.replace(/\\/g, "/")
      : null;
    const file_KTPAyah = req.files["file_KTPAyah"]
      ? req.files["file_KTPAyah"][0].path.replace(/\\/g, "/")
      : null;
    const file_KTPIbu = req.files["file_KTPIbu"]
      ? req.files["file_KTPIbu"][0].path.replace(/\\/g, "/")
      : null;
    const file_KTPMeninggal = req.files["file_KTPMeninggal"]
      ? req.files["file_KTPMeninggal"][0].path.replace(/\\/g, "/")
      : null;
    const file_suratKematian = req.files["file_suratKematian"]
      ? req.files["file_suratKematian"][0].path.replace(/\\/g, "/")
      : null;
    const file_KTPPemohon = req.files["file_KTPPemohon"]
      ? req.files["file_KTPPemohon"][0].path.replace(/\\/g, "/")
      : null;

    const urlToPdfFile = req.files["pdf_file"]
      ? `${req.protocol}://${req.get("host")}/static/files/${
          req.files["pdf_file"][0].filename
        }`
      : null;

    const urlPengantar = req.files["file_pengantar"]
      ? `${req.protocol}://${req.get("host")}/static/files/${
          req.files["file_pengantar"][0].filename
        }`
      : null;

    const urlKK = req.files["file_kk"]
      ? `${req.protocol}://${req.get("host")}/static/files/${
          req.files["file_kk"][0].filename
        }`
      : null;

    const urlAkte = req.files["file_akte"]
      ? `${req.protocol}://${req.get("host")}/static/files/${
          req.files["file_akte"][0].filename
        }`
      : null;

    const urlSuratKelahiran = req.files["file_suratKelahiran"]
      ? `${req.protocol}://${req.get("host")}/static/files/${
          req.files["file_suratKelahiran"][0].filename
        }`
      : null;

    const urlSuratNikah = req.files["file_suratNikah"]
      ? `${req.protocol}://${req.get("host")}/static/files/${
          req.files["file_suratNikah"][0].filename
        }`
      : null;

    const urlKTPAyah = req.files["file_KTPAyah"]
      ? `${req.protocol}://${req.get("host")}/static/files/${
          req.files["file_KTPAyah"][0].filename
        }`
      : null;

    const urlKTPIbu = req.files["file_KTPIbu"]
      ? `${req.protocol}://${req.get("host")}/static/files/${
          req.files["file_KTPIbu"][0].filename
        }`
      : null;

    const urlKTPMeninggal = req.files["file_KTPMeninggal"]
      ? `${req.protocol}://${req.get("host")}/static/files/${
          req.files["file_KTPMeninggal"][0].filename
        }`
      : null;

    const urlSuratKematian = req.files["file_suratKematian"]
      ? `${req.protocol}://${req.get("host")}/static/files/${
          req.files["file_suratKematian"][0].filename
        }`
      : null;

    const urlKTPPemohon = req.files["file_KTPPemohon"]
      ? `${req.protocol}://${req.get("host")}/static/files/${
          req.files["file_KTPPemohon"][0].filename
        }`
      : null;

    const currentDate = new Date();

    const twoDigitFormat = (num) => (num < 10 ? `0${num}` : num);

    const formattedNumber =
      twoDigitFormat(currentDate.getDate()) +
      twoDigitFormat(currentDate.getMonth() + 1) +
      currentDate.getFullYear().toString().substr(-2) +
      twoDigitFormat(currentDate.getHours()) +
      twoDigitFormat(currentDate.getMinutes()) +
      twoDigitFormat(currentDate.getSeconds());

    try {
      const user = req.user;

      const newLetter = await prisma.letterRequest.create({
        data: {
          letter_type,
          pdf_file,
          urlToPdfFile,
          file_pengantar,
          file_kk,
          file_akte,
          file_suratKelahiran,
          file_suratNikah,
          file_KTPAyah,
          file_KTPIbu,
          file_KTPMeninggal,
          file_suratKematian,
          file_KTPPemohon,
          urlPengantar,
          urlKK,
          urlAkte,
          urlSuratKelahiran,
          urlSuratNikah,
          urlKTPAyah,
          urlKTPIbu,
          urlKTPMeninggal,
          urlSuratKematian,
          urlKTPPemohon,
          created_at: new Date(),
          letter_number: `SP-${formattedNumber}`,
          authorId: user.userId,
        },
      });
      res.status(201).json({
        msg: "Berhasil mengajukan surat",
        data: newLetter,
      });
    } catch (error) {
      if (pdf_file && fs.existsSync(pdf_file)) {
        fs.unlinkSync(pdf_file);
      }
      if (file_pengantar && fs.existsSync(file_pengantar)) {
        fs.unlinkSync(file_pengantar);
      }
      if (file_kk && fs.existsSync(file_kk)) {
        fs.unlinkSync(file_kk);
      }
      if (file_akte && fs.existsSync(file_akte)) {
        fs.unlinkSync(file_akte);
      }
      if (file_suratKelahiran && fs.existsSync(file_suratKelahiran)) {
        fs.unlinkSync(file_suratKelahiran);
      }
      if (file_suratNikah && fs.existsSync(file_suratNikah)) {
        fs.unlinkSync(file_suratNikah);
      }
      if (file_KTPAyah && fs.existsSync(file_KTPAyah)) {
        fs.unlinkSync(file_KTPAyah);
      }
      if (file_KTPIbu && fs.existsSync(file_KTPIbu)) {
        fs.unlinkSync(file_KTPIbu);
      }
      if (file_KTPMeninggal && fs.existsSync(file_KTPMeninggal)) {
        fs.unlinkSync(file_KTPMeninggal);
      }
      if (file_suratKematian && fs.existsSync(file_suratKematian)) {
        fs.unlinkSync(file_suratKematian);
      }
      if (file_KTPPemohon && fs.existsSync(file_KTPPemohon)) {
        fs.unlinkSync(file_KTPPemohon);
      }

      res.status(500).json({ msg: error.message });
    }
  });
};

export const updateLetter = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      if (err instanceof multer.MulterError) {
        // Handle specific Multer errors
        return res.status(400).json({ msg: "MulterError: " + err.message });
      }

      // Handle other errors
      return res.status(400).json({ msg: "Gagal Upload: " + err });
    }

    const { id } = req.params;
    const { status } = req.body;

    const existingLetter = await prisma.letterRequest.findUnique({
      where: {
        request_id: id,
      },
      include: {
        author: true,
      },
    });

    const updatedData = {
      status,
    };

    if (req.file) {
      const url = `${req.protocol}://${req.get("host")}/static/files/${
        req.file.filename
      }`;
      updatedData.pdf_file = req.file.path.replace(/\\/g, "/");
      updatedData.urlToPdfFile = url;

      if (existingLetter.pdf_file) {
        const filepath = existingLetter.pdf_file;
        fs.unlinkSync(filepath);
      }
    }

    try {
      const updatedLetter = await prisma.letterRequest.update({
        where: {
          request_id: id,
        },
        data: updatedData,
      });

      let messageBody = "";
      if (updatedData.status === "acc") {
        messageBody =
          "Surat anda sudah di acc, silahkan download suratnya untuk anda gunakan";
      } else if (updatedData.status === "ditolak") {
        messageBody =
          "Surat anda ditolak karena persyaratan salah, silahkan perbarui persyaratannya";
      } else {
        messageBody = "Berhasil update surat";
      }

      client.messages.create({
        body: messageBody,
        from: twilioNumber,
        to: `whatsapp:+62${existingLetter.author.phoneNumber}`,
      });

      res.status(200).json({
        msg: "Berhasil update surat dan mengirim notif ke pengguna",
        updatedLetter,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  });
};

export const updateLetterKlien = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      if (err instanceof multer.MulterError) {
        // Handle specific Multer errors
        return res.status(400).json({ msg: "MulterError: " + err.message });
      }

      // Handle other errors
      return res.status(400).json({ msg: "File upload invalid: " + err });
    }

    const { id } = req.params;
    const { letter_type } = req.body;

    const existingLetter = await prisma.letterRequest.findUnique({
      where: {
        request_id: id,
      },
    });

    const updatedData = {
      letter_type,
    };

    if (req.file) {
      const url = `${req.protocol}://${req.get("host")}/static/files/${
        req.file.filename
      }`;
      updatedData.pdf_file = req.file.path.replace(/\\/g, "/");
      updatedData.urlToPdfFile = url;

      if (existingLetter.pdf_file) {
        const filepath = existingLetter.pdf_file;
        fs.unlinkSync(filepath);
      }
    }

    try {
      const updatedLetter = await prisma.letterRequest.update({
        where: {
          request_id: id,
        },
        data: updatedData,
      });
      res.status(200).json({ msg: "Berhasil update surat", updatedLetter });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  });
};

export const deleteLetter = async (req, res) => {
  const { id } = req.params;

  const letter = await prisma.letterRequest.findUnique({
    where: {
      request_id: id,
    },
    include: {
      author: true,
    },
  });

  if (!letter) return res.status(404).json({ msg: "Surat tidak ditemukan" });

  try {
    if (letter.pdf_file) {
      const filePDF = letter.pdf_file;
      fs.unlinkSync(filePDF);
    }

    if (letter.file_pengantar) {
      const filePengantar = letter.file_pengantar;
      fs.unlinkSync(filePengantar);
    }

    if (letter.file_kk) {
      const fileKK = letter.file_kk;
      fs.unlinkSync(fileKK);
    }

    if (letter.file_akte) {
      const fileAkte = letter.file_akte;
      fs.unlinkSync(fileAkte);
    }

    if (letter.file_suratNikah) {
      const fileAkteNikah = letter.file_suratNikah;
      fs.unlinkSync(fileAkteNikah);
    }

    if (letter.file_suratKelahiran) {
      const fileSuratKelahiran = letter.file_suratKelahiran;
      fs.unlinkSync(fileSuratKelahiran);
    }

    if (letter.file_suratKematian) {
      const fileSuratKematian = letter.file_suratKematian;
      fs.unlinkSync(fileSuratKematian);
    }

    if (letter.file_KTPAyah) {
      const fileKTPAyah = letter.file_KTPAyah;
      fs.unlinkSync(fileKTPAyah);
    }

    if (letter.file_KTPIbu) {
      const fileKTPIbu = letter.file_KTPIbu;
      fs.unlinkSync(fileKTPIbu);
    }

    if (letter.file_KTPMeninggal) {
      const fileKTPMeninggal = letter.file_KTPMeninggal;
      fs.unlinkSync(fileKTPMeninggal);
    }

    if (letter.file_KTPPemohon) {
      const fileKTPPemohon = letter.file_KTPPemohon;
      fs.unlinkSync(fileKTPPemohon);
    }

    await prisma.letterRequest.delete({
      where: {
        request_id: id,
      },
    });

    client.messages.create({
      body: "Surat pengajuan anda dihapus",
      from: twilioNumber,
      to: `whatsapp:${letter.author.phoneNumber}`,
    });

    res
      .status(200)
      .json({ msg: "Surat berhasil dihapus dan notif dikirim ke pengguna" });
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};
