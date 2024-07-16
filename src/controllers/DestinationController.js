import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

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
}).single("destination");

export const getAllDestination = async (req, res) => {
  try {
    BigInt.prototype.toJSON = function () {
      const int = Number.parseInt(this.toString());
      return int ?? this.toString();
    };

    const page = parseInt(req.query.page) || 0;

    const limit = parseInt(req.query.limit) || 9;

    const search = req.query.search_query || "";

    const offset = limit * page;

    const totalRows = await prisma.destination.count({
      where: {
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            description: {
              contains: search,
            },
          },
          {
            location: {
              contains: search,
            },
          },
        ],
      },
    });

    const totalPage = Math.ceil(totalRows / limit);

    const results = await prisma.destination.findMany({
      where: {
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            description: {
              contains: search,
            },
          },
          {
            location: {
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
        destination_id: "desc",
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

export const getDestinationById = async (req, res) => {
  const { id } = req.params;

  try {
    const destination = await prisma.destination.findUnique({
      where: {
        destination_id: id,
      },
    });
    res.status(200).json(destination);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

export const getTopDestination = async (req, res) => {
  try {
    BigInt.prototype.toJSON = function () {
      const int = Number.parseInt(this.toString());
      return int ?? this.toString();
    };

    const topDestination = await prisma.destination.findMany({
      where: {
        views: {
          gt: 400,
        },
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
      take: 1,
    });
    res.status(200).json(topDestination);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

export const getTop2Destination = async (req, res) => {
  try {
    BigInt.prototype.toJSON = function () {
      const int = Number.parseInt(this.toString());
      return int ?? this.toString();
    };

    const topDestinations = await prisma.destination.findMany({
      where: {
        views: {
          gt: 400,
        },
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    const topDestinationIds = topDestinations.map(
      (destination) => destination.destination_id
    );

    const top2Destinations = await prisma.destination.findMany({
      where: {
        views: {
          gt: 100,
        },
        NOT: {
          destination_id: {
            in: topDestinationIds,
          },
        },
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });
    res.status(200).json(top2Destinations);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

export const getDestinationsBelow50Views = async (req, res) => {
  try {
    const totalDestination = await prisma.destination.count({
      where: {
        views: {
          lt: 50,
        },
      },
    });
    res.status(200).json({
      totalDestination,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getDestinationsAbove100Views = async (req, res) => {
  try {
    const totalAboveDestination = await prisma.destination.count({
      where: {
        views: {
          gt: 100,
        },
      },
    });
    res.status(200).json({
      totalAboveDestination,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createDestination = async (req, res) => {
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

    const { name, description, content, location } = req.body;
    const image = req.file ? req.file.filename : null;

    const url = `${req.protocol}://${req.get("host")}/static/images/${
      req.file.filename
    }`;

    try {
      const user = req.user;

      const newDestination = await prisma.destination.create({
        data: {
          name,
          description,
          content,
          image,
          urlToImage: url,
          location,
          authorId: user.userId,
        },
      });
      res
        .status(201)
        .json({ msg: "Destinasi berhasil dibuat", newDestination });
    } catch (error) {
      fs.unlinkSync(image);
      res.status(500).json({ msg: error.message });
    }
  });
};

export const updateDestination = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error("File Upload Error:", err);

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
    const { name, description, content, location } = req.body;

    const existingDestination = await prisma.destination.findUnique({
      where: {
        destination_id: id,
      },
    });

    const updatedData = {
      name,
      description,
      content,
      location,
    };

    if (req.file) {
      const url = `${req.protocol}://${req.get("host")}/static/images/${
        req.file.filename
      }`;
      updatedData.image = req.file.path.replace(/\\/g, "/");
      updatedData.urlToImage = url;

      if (existingDestination.image) {
        const filepath = `public/images/${existingDestination.image}`;
        fs.unlinkSync(filepath);
      }
    }

    try {
      const updatedDestination = await prisma.destination.update({
        where: {
          destination_id: id,
        },
        data: updatedData,
      });
      res
        .status(200)
        .json({ msg: "Berhasil update berita", updatedDestination });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  });
};

export const updateViewDestination = async (req, res) => {
  const { id } = req.params;

  BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };

  const destination = await prisma.destination.findUnique({
    where: {
      destination_id: id,
    },
  });

  if (!destination)
    return res.status(404).json({ msg: "Destinasi tidak ditemukan" });

  const updatedViews = parseInt(destination.views) + 1;

  try {
    await prisma.destination.update({
      where: {
        destination_id: id,
      },
      data: {
        views: updatedViews,
      },
    });
    res.status(200).json({ msg: "Views destinasi berhasil diperbarui" });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Views destinasi gagal diperbarui", error: error.message });
  }
};

export const deleteDestination = async (req, res) => {
  const { id } = req.params;

  const destination = await prisma.destination.findUnique({
    where: {
      destination_id: id,
    },
  });

  if (!destination)
    return res.status(404).json({ msg: "Destinasi tidak ditemkan" });

  try {
    const filepath = destination.image;
    fs.unlinkSync(filepath);
    await prisma.destination.delete({
      where: {
        destination_id: id,
      },
    });
    res.status(200).json({ msg: "Destinasi berhasil dihapus" });
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};
