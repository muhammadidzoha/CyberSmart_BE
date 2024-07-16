import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

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
          "Tipe file tidak valid, hanya pdf, docx, xlsx dan xls yang diperbolehkan"
        ),
        false
      );
    }
  },
}).single("announcement");

export const getAllAnnouncement = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;

    const limit = parseInt(req.query.limit) || 10;

    const search = req.query.search_query || "";

    const offset = limit * page;

    const totalRows = await prisma.announcement.count({
      where: {
        OR: [
          {
            title: {
              contains: search,
            },
          },
          {
            description: {
              contains: search,
            },
          },
        ],
      },
    });

    const totalPage = Math.ceil(totalRows / limit);

    const results = await prisma.announcement.findMany({
      where: {
        OR: [
          {
            title: {
              contains: search,
            },
          },
          {
            description: {
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
        announcement_id: "desc",
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

export const getAnnouncementById = async (req, res) => {
  const { id } = req.params;

  try {
    const announcement = await prisma.announcement.findUnique({
      where: {
        announcement_id: id,
      },
    });
    res.status(200).json(announcement);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

export const createAnnouncement = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      res.status(400).json({ msg: "File upload invalid: " + err });

      if (err instanceof multer.MulterError) {
        return res.status(400).json({ msg: "MulterError: " + err.message });
      } else {
        return res.status(400).json({ msg: "Error uploading file." });
      }
    }

    const { title, description, date_of_announcement } = req.body;
    const file = req.file ? req.file.filename : null;

    const url = `${req.protocol}://${req.get("host")}/static/files/${
      req.file.filename
    }`;

    const formattedDate = new Date(date_of_announcement).toISOString();

    try {
      const user = req.user;

      const newAnnouncement = await prisma.announcement.create({
        data: {
          title,
          description,
          date_of_announcement: formattedDate,
          file,
          urlToFile: url,
          authorId: user.userId,
        },
      });
      res
        .status(201)
        .json({ msg: "Berhasil membuat pengumuman", newAnnouncement });
    } catch (error) {
      fs.unlinkSync(file);
      res.status(500).json({ msg: error.message });
    }
  });
};

export const updateAnnouncement = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      res.status(400).json({ msg: "File upload invalid: " + err });

      if (err instanceof multer.MulterError) {
        // Handle specific Multer errors
        return res.status(400).json({ msg: "MulterError: " + err.message });
      } else {
        return res.status(400).json({ msg: "Error uploading file." });
      }
    }

    const { id } = req.params;
    const { title, description, date_of_announcement } = req.body;

    const formattedDate = new Date(date_of_announcement).toISOString();

    const existingAnnouncement = await prisma.announcement.findUnique({
      where: {
        announcement_id: id,
      },
    });

    const updatedData = {
      title,
      description,
      date_of_announcement: formattedDate,
    };

    if (req.file) {
      const url = `${req.protocol}://${req.get("host")}/static/files/${
        req.file.filename
      }`;
      updatedData.file = req.file.path.replace(/\\/g, "/");
      updatedData.urlToFile = url;

      if (existingAnnouncement.file) {
        const filepath = existingAnnouncement.file;
        fs.unlinkSync(filepath);
      }
    }

    try {
      const updatedAnnouncement = await prisma.announcement.update({
        where: {
          announcement_id: id,
        },
        data: updatedData,
      });
      res
        .status(200)
        .json({ msg: "Berhasil update pengumuman", updatedAnnouncement });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  });
};

export const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;

  const Announcement = await prisma.announcement.findUnique({
    where: {
      announcement_id: id,
    },
  });

  if (!Announcement)
    return res.status(404).json({ msg: "Pengumuman tidak ditemukan" });

  try {
    const filepath = Announcement.file;
    fs.unlinkSync(filepath);
    await prisma.announcement.delete({
      where: {
        announcement_id: id,
      },
    });
    res.status(200).json({ msg: "Pengumuman berhasil dihapus" });
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};
