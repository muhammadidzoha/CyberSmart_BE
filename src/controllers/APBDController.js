import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path, { dirname } from "path";
import fs from "fs";
import { fileURLToPath } from "url";

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
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Tipe file tidak valid, hanya jpeg, jpg, png dan webp yang diperbolehkan"
        ),
        false
      );
    }
  },
}).single("apbd");

export const getAllTransparency = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;

    const limit = parseInt(req.query.limit) || 10;

    const search = req.query.search_query || "";

    const offset = limit * page;

    const totalRows = await prisma.transparency.count({
      where: {
        title: {
          contains: search,
        },
      },
    });

    const totalPage = Math.ceil(totalRows / limit);

    const results = await prisma.transparency.findMany({
      where: {
        title: {
          contains: search,
        },
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        transparency_id: "desc",
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

export const getTransparencyById = async (req, res) => {
  const { id } = req.params;

  try {
    const transparency = await prisma.transparency.findUnique({
      where: {
        transparency_id: id,
      },
    });
    res.status(200).json(transparency);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

export const showPDFTransparencyById = async (req, res) => {
  const { id } = req.params;

  try {
    const transparency = await prisma.transparency.findUnique({
      where: {
        transparency_id: id,
      },
    });

    const filepath = path.join(__dirname, "..", "..", transparency.apbd_file);

    if (!filepath) {
      return res.status(404).json({ msg: "Surat tidak memiliki file PDF" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.sendFile(filepath, { attachment: false });
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

export const createTransparency = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      res.status(400).json({ msg: "File upload invalid: " + err });

      if (err instanceof multer.MulterError) {
        // Handle specific Multer errors
        return res.status(400).json({ msg: "MulterError: " + err.message });
      }

      return res.status(400).json({ msg: "Error uploading file." });
    }

    const { title, date_of_publication } = req.body;
    const apbd_file = req.file ? req.file.path.replace(/\\/g, "/") : null;

    const url = `${req.protocol}://${req.get("host")}/static/files/${
      req.file.filename
    }`;

    const formattedDate = new Date(date_of_publication).toISOString();

    try {
      const user = req.user;

      const newTransparency = await prisma.transparency.create({
        data: {
          title,
          date_of_publication: formattedDate,
          apbd_file,
          urlToApbdFile: url,
          authorId: user.userId,
        },
      });
      res
        .status(201)
        .json({ msg: "Berhasil membuat transparansi apbd", newTransparency });
    } catch (error) {
      fs.unlinkSync(apbd_file);
      res.status(500).json({ msg: error.message });
    }
  });
};

export const updateTransparency = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      res.status(400).json({ msg: "File upload invalid: " + err });

      if (err instanceof multer.MulterError) {
        // Handle specific Multer errors
        return res.status(400).json({ msg: "MulterError: " + err.message });
      }

      return res.status(400).json({ msg: "Error uploading file." });
    }

    const { id } = req.params;
    const { title, date_of_publication } = req.body;

    const formattedDate = new Date(date_of_publication).toISOString();

    const existingTransparency = await prisma.transparency.findUnique({
      where: {
        transparency_id: id,
      },
    });

    const updatedData = {
      title,
      date_of_publication: formattedDate,
    };

    if (req.file) {
      const url = `${req.protocol}://${req.get("host")}/static/files/${
        req.file.filename
      }`;
      updatedData.apbd_file = req.file.path.replace(/\\/g, "/");
      updatedData.urlToApbdFile = url;

      if (existingTransparency.apbd_file) {
        const filepath = existingTransparency.apbd_file;
        fs.unlinkSync(filepath);
      }
    }

    try {
      const updatedTransparency = await prisma.transparency.update({
        where: {
          transparency_id: id,
        },
        data: updatedData,
      });
      res.status(200).json({
        msg: "Berhasil update transparansi apbd",
        updatedTransparency,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  });
};

export const deleteTransparency = async (req, res) => {
  const { id } = req.params;

  const transparency = await prisma.transparency.findUnique({
    where: {
      transparency_id: id,
    },
  });

  if (!transparency)
    return res.status(404).json({ msg: "Transparansi APBD tidak ditemukan" });

  try {
    const filepath = transparency.apbd_file;
    fs.unlinkSync(filepath);
    await prisma.transparency.delete({
      where: {
        transparency_id: id,
      },
    });
    res.status(200).json({ msg: "Transparansi APBD berhasil dihapus" });
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};
