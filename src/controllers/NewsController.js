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
      cb(null, "public/images");
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
    fieldSize: 5000000,
  },
  fileFilter: function (req, file, cb) {
    const allowedFileTypes = ["image/jpeg", "image/png", "image/webp"];

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
}).single("thumbnail");

export const getAllNews = async (req, res) => {
  try {
    BigInt.prototype.toJSON = function () {
      const int = Number.parseInt(this.toString());
      return int ?? this.toString();
    };

    const page = parseInt(req.query.page) || 0;

    const limit = parseInt(req.query.limit) || 9;

    const search = req.query.search_query || "";

    const offset = limit * page;

    const totalRows = await prisma.news.count({
      where: {
        OR: [
          {
            title: {
              contains: search,
            },
          },
          {
            content: {
              contains: search,
            },
          },
        ],
      },
    });

    const totalPage = Math.ceil(totalRows / limit);

    const results = await prisma.news.findMany({
      where: {
        OR: [
          {
            title: {
              contains: search,
            },
          },
          {
            content: {
              contains: search,
            },
          },
        ],
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
        news_id: "desc",
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

export const getNewsById = async (req, res) => {
  const { id } = req.params;

  try {
    BigInt.prototype.toJSON = function () {
      const int = Number.parseInt(this.toString());
      return int ?? this.toString();
    };

    const news = await prisma.news.findUnique({
      where: {
        news_id: id,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        comentars: {
          include: {
            author: {
              select: {
                fullname: true,
              },
            },
          },
        },
      },
    });

    const commentCount = news.comentars.length;
    res.status(200).json({
      news,
      commentCount,
    });
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

export const getTopBerita = async (req, res) => {
  try {
    const topBerita = await prisma.news.findMany({
      where: {
        views: {
          gt: 100,
        },
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
      take: 6,
    });
    res.status(200).json(topBerita);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getNewsBelow50Views = async (req, res) => {
  try {
    const totalNews = await prisma.news.count({
      where: {
        views: {
          lt: 50,
        },
      },
    });
    res.status(200).json({
      totalNews,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getNewsAbove100Views = async (req, res) => {
  try {
    const totalAboveNews = await prisma.news.count({
      where: {
        views: {
          gt: 100,
        },
      },
    });
    res.status(200).json({
      totalAboveNews,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createNews = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      res.status(400).json({ msg: "File upload invalid: " + err });

      if (err instanceof multer.MulterError) {
        // Handle specific Multer errors
        return res.status(400).json({ msg: "MulterError: " + err.message });
      }

      return res.status(400).json({ msg: "Error uploading file." });
    }

    BigInt.prototype.toJSON = function () {
      const int = Number.parseInt(this.toString());
      return int ?? this.toString();
    };

    const { title, description, content, source } = req.body;
    const thumbnail = req.file ? req.file.filename : null;

    const url = `${req.protocol}://${req.get("host")}/static/images/${
      req.file.filename
    }`;

    try {
      const user = req.user;

      const newNews = await prisma.news.create({
        data: {
          title,
          description,
          content,
          thumbnail,
          urlToThumbnail: url,
          source,
          authorId: user.userId,
        },
      });
      res.status(201).json({ msg: "Berita berhasil dibuat", newNews });
    } catch (error) {
      fs.unlinkSync(thumbnail);
      res.status(500).json({ msg: error.message });
    }
  });
};

export const updateNews = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      res.status(400).json({ msg: "File upload invalid: " + err });

      if (err instanceof multer.MulterError) {
        // Handle specific Multer errors
        return res.status(400).json({ msg: "MulterError: " + err.message });
      }

      return res.status(400).json({ msg: "Error uploading file." });
    }

    BigInt.prototype.toJSON = function () {
      const int = Number.parseInt(this.toString());
      return int ?? this.toString();
    };

    const { id } = req.params;
    const { title, description, content, source } = req.body;

    const existingNews = await prisma.news.findUnique({
      where: {
        news_id: id,
      },
    });

    const updatedData = {
      title,
      description,
      content,
      source,
    };

    if (req.file) {
      const url = `${req.protocol}://${req.get("host")}/static/images/${
        req.file.filename
      }`;
      updatedData.thumbnail = req.file.path.replace(/\\/g, "/");
      updatedData.urlToThumbnail = url;

      // Hapus thumbnail sebelumnya jika ada
      if (existingNews.thumbnail) {
        const imagePath = path.resolve(
          __dirname,
          "..",
          "..",
          "public",
          "images",
          existingNews.thumbnail
        );
        fs.unlinkSync(imagePath);
      }
    }

    try {
      const updatedNews = await prisma.news.update({
        where: {
          news_id: id,
        },
        data: updatedData,
      });
      res.status(200).json({ msg: "Berhasil update berita", updatedNews });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  });
};

export const updateViewNews = async (req, res) => {
  const { id } = req.params;

  BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };

  const news = await prisma.news.findUnique({
    where: {
      news_id: id,
    },
  });

  if (!news) return res.status(404).json({ msg: "Berita tidak ditemukan" });

  const updatedViews = parseInt(news.views) + 1;

  try {
    await prisma.news.update({
      where: {
        news_id: id,
      },
      data: {
        views: updatedViews,
      },
    });
    res.status(200).json({ msg: "Views berita berhasil diperbarui" });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Views berita gagal diperbarui", error: error.message });
  }
};

export const deleteNews = async (req, res) => {
  const { id } = req.params;

  try {
    const newsToDelete = await prisma.news.findUnique({
      where: {
        news_id: id,
      },
    });

    if (newsToDelete.thumbnail) {
      const imagePath = path.resolve(
        __dirname,
        "..",
        "..",
        newsToDelete.thumbnail
      );
      fs.unlinkSync(imagePath);
    }

    await prisma.news.delete({
      where: {
        news_id: id,
      },
    });

    res.status(200).json({ msg: "Berita berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
