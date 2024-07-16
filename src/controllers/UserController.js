import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";

const prisma = new PrismaClient();

// ** User Admin

export const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await prisma.userAdmin.findMany({
      select: {
        id: true,
        name: true,
        username: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createUserAdmin = async (req, res) => {
  const { name, username, password, confPassword, nik } = req.body;

  // Validasi name
  if (!name) return res.status(400).json({ msg: "Nama tidak boleh kosong" });

  // Validasi username
  if (!username)
    return res.status(400).json({ msg: "Username tidak boleh kosong" });
  else if (username.length > 16)
    return res.status(400).json({ msg: "Username maksimal 16 karakter" });

  // Validasi password
  if (!password)
    return res.status(400).json({ msg: "Password tidak boleh kosong" });
  else if (password.length < 6)
    return res.status(400).json({ msg: "Password minimal 6 karakter" });
  else if (!/^[A-Z]/.test(password))
    return res
      .status(400)
      .json({ msg: "Password harus diawali huruf kapital" });
  else if (!/(?=.*\d)(?=.*[!@#$%^&*()_+])/.test(password))
    return res
      .status(400)
      .json({ msg: "Password harus mengandung angka dan simbol" });

  // Validasi konfirmasi password
  if (password !== confPassword)
    return res.status(400).json({ msg: "Password tidak cocok" });

  // Validasi NIK
  if (!nik) return res.status(400).json({ msg: "NIK tidak boleh kosong" });
  else if (nik.length !== 16)
    return res.status(400).json({ msg: "NIK harus memiliki 16 digit" });

  const existingUser = await prisma.userAdmin.findFirst({
    where: {
      nik,
    },
  });

  if (existingUser)
    return res.status(400).json({ msg: "NIK sudah terdaftar, silahkan login" });

  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hashSync(password, salt);

  try {
    await prisma.userAdmin.create({
      data: {
        name,
        username,
        password: hashPassword,
        nik,
      },
      select: {
        id: true,
      },
    });
    res.status(200).json({ msg: "Registrasi Berhasil " });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const loginUserAdmin = async (req, res) => {
  try {
    const usr = req.body.username;
    const pwd = req.body.password;

    if (!usr && !pwd)
      res.status(400).json({ msg: "Username dan Password tidak boleh kosong" });
    else if (!usr) res.status(400).json({ msg: "Username tidak boleh kosong" });
    else if (!pwd) res.status(400).json({ msg: "Password tidak boleh kosong" });

    const user = await prisma.userAdmin.findMany({
      where: {
        username: usr,
      },
    });

    if (!user[0]) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const match = await bcrypt.compareSync(pwd, user[0].password);
    if (!match) return res.status(400).json({ msg: "Password salah " });

    const id = user[0].id;
    const name = user[0].name;
    const username = user[0].username;

    const accessToken = jwt.sign(
      {
        id,
        name,
        username,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "20s",
      }
    );

    const refreshToken = jwt.sign(
      {
        id,
        name,
        username,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    await prisma.userAdmin.update({
      data: {
        refresh_token: refreshToken,
      },
      where: {
        id: id,
      },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const logoutUserAdmin = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(400);

  const user = await prisma.userAdmin.findMany({
    where: {
      refresh_token: refreshToken,
    },
  });

  if (!user[0]) return res.sendStatus(204);

  const userId = user[0].id;

  await prisma.userAdmin.update({
    data: {
      refresh_token: null,
    },
    where: {
      id: userId,
    },
  });
  res.clearCookie("refreshToken");
  return res.status(200).json({ msg: "Berhasil Logout" });
};

// ** User Klien

const generateOTP = () => {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "camelkuning2023@gmail.com",
      pass: "jznifgmmtrzhhkpt",
    },
  });

  await transporter.sendMail({
    from: "camelkuning2023@gmail.com",
    to: email,
    subject: "Password Reset OTP",
    html: `
    <span>
      Your OTP is <b>${otp}</b> Use this code to reset your password.
    </span>
    `,
  });
};

export const getAllUsersKlien = async (req, res) => {
  BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };

  try {
    const page = parseInt(req.query.page) || 0;

    const limit = parseInt(req.query.limit) || 10;

    const search = req.query.search_query || "";

    const offset = limit * page;

    const totalRows = await prisma.userKlien.count({
      where: {
        OR: [
          {
            fullname: {
              contains: search,
            },
          },
          {
            address: {
              contains: search,
            },
          },
        ],
      },
    });

    const totalPage = Math.ceil(totalRows / limit);

    const results = await prisma.userKlien.findMany({
      where: {
        OR: [
          {
            fullname: {
              contains: search,
            },
          },
          {
            address: {
              contains: search,
            },
          },
        ],
      },
      select: {
        id: true,
        fullname: true,
        nik: true,
        gender: true,
        address: true,
        village: true,
        zipcode: true,
        rt: true,
        rw: true,
        birthday: true,
        job: true,
        education: true,
        religion: true,
        place: true,
        letterrequests: true,
      },
      skip: offset,
      take: limit,
      orderBy: {
        id: "desc",
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

export const getUserByIdKlien = async (req, res) => {
  BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };

  try {
    const id = req.cookies.id;

    if (!id) {
      return res.status(401).json({ msg: "Anda belum login" });
    }

    const user = await prisma.userKlien.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        fullname: true,
        nik: true,
        gender: true,
        address: true,
        village: true,
        zipcode: true,
        rt: true,
        rw: true,
        birthday: true,
        job: true,
        education: true,
        religion: true,
        place: true,
        phoneNumber: true,
        letterrequests: true,
      },
    });

    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    // Pengecekan apakah profil lengkap
    const isProfileComplete =
      user.fullname !== null &&
      user.nik !== null &&
      user.gender !== null &&
      user.address !== null &&
      user.village !== null &&
      user.zipcode !== null &&
      user.rt !== null &&
      user.rw !== null &&
      user.birthday !== null &&
      user.job !== null &&
      user.education !== null &&
      user.religion !== null;

    res.status(200).json({ ...user, isProfileComplete });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

export const createUserKlien = async (req, res) => {
  const { fullname, email, password, confPassword } = req.body;

  // Validasi name
  if (!fullname)
    return res.status(400).json({ msg: "Nama tidak boleh kosong" });

  // Validasi username
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return res.status(400).json({ msg: "Email tidak boleh kosong" });
  else if (!email.match(emailRegex))
    return res.status(400).json({ msg: "Format email tidak valid" });
  // Validasi password
  if (!password)
    return res.status(400).json({ msg: "Password tidak boleh kosong" });
  else if (password.length < 6)
    return res.status(400).json({ msg: "Password minimal 6 karakter" });
  else if (!/^[A-Z]/.test(password))
    return res
      .status(400)
      .json({ msg: "Password harus diawali huruf kapital" });
  else if (!/(?=.*\d)(?=.*[!@#$%^&*()_+])/.test(password))
    return res
      .status(400)
      .json({ msg: "Password harus mengandung angka dan simbol" });

  // Validasi konfirmasi password
  if (password !== confPassword)
    return res.status(400).json({ msg: "Password tidak cocok" });

  const existingUser = await prisma.userKlien.findFirst({
    where: {
      email,
    },
  });
  if (existingUser)
    return res
      .status(400)
      .json({ msg: "Email sudah terdaftar, silahkan login " });

  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hashSync(password, salt);

  try {
    await prisma.userKlien.create({
      data: {
        fullname,
        email,
        password: hashPassword,
      },
      select: {
        id: true,
      },
    });
    res.status(200).json({ msg: "Registrasi Berhasil " });
  } catch (error) {
    console.log(error.message);
  }
};

export const loginUserKlien = async (req, res) => {
  try {
    const usr = req.body.email;
    const pwd = req.body.password;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!usr.match(emailRegex)) {
      res.status(400).json({ msg: "Format email tidak valid" });
    } else if (!usr && !pwd) {
      res.status(400).json({ msg: "Email dan Password tidak boleh kosong" });
    } else if (!usr) {
      res.status(400).json({ msg: "Email tidak boleh kosong" });
    } else if (!pwd) {
      res.status(400).json({ msg: "Password tidak boleh kosong" });
    }

    const user = await prisma.userKlien.findMany({
      where: {
        email: usr,
      },
    });

    if (!user[0]) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const match = await bcrypt.compareSync(pwd, user[0].password);
    if (!match) return res.status(400).json({ msg: "Password salah " });

    const id = user[0].id;
    const fullname = user[0].fullname;
    const email = user[0].email;
    const accessToken = jwt.sign(
      {
        id,
        fullname,
        email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "20s",
      }
    );
    const refreshToken = jwt.sign(
      {
        id,
        fullname,
        email,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    await prisma.userKlien.update({
      data: {
        refresh_token: refreshToken,
      },
      where: {
        id: id,
      },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
    });

    res.cookie("id", id, {
      httpOnly: true,
    });

    res.json({
      id,
      fullname,
      accessToken,
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateUserKlien = async (req, res) => {
  const id = req.cookies.id;

  const {
    nik,
    gender,
    address,
    village,
    zipcode,
    rt,
    rw,
    birthday,
    job,
    education,
    religion,
    place,
    phoneNumber,
  } = req.body;

  if (!id) {
    return res.status(400).json({ msg: "id tidak tersedia" });
  }

  const user = await prisma.userKlien.findFirst({
    where: {
      id,
    },
  });

  if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

  const formattedDate = new Date(birthday).toISOString();

  BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };

  if (
    !nik ||
    !gender ||
    !address ||
    !village ||
    !zipcode ||
    !rt ||
    !rw ||
    !birthday ||
    !job ||
    !education ||
    !religion ||
    !place ||
    !phoneNumber
  ) {
    return res.status(500).json({ msg: "Semua data harus diisi" });
  } else if (typeof nik !== "number" || nik.toString().length !== 16) {
    return res.status(500).json({ msg: "NIK harus memiliki panjang 16 digit" });
  }

  try {
    await prisma.userKlien.update({
      where: {
        id,
      },
      data: {
        nik,
        gender,
        address,
        village,
        zipcode,
        rt,
        rw,
        birthday: formattedDate,
        job,
        education,
        religion,
        place,
        phoneNumber,
      },
    });
    res.status(200).json({ msg: "Profil berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ msg: "Profil gagal diperbarui" });
  }
};

export const updateProfilKlien = async (req, res) => {
  const { id } = req.params;

  const {
    nik,
    gender,
    address,
    village,
    zipcode,
    rt,
    rw,
    birthday,
    job,
    education,
    religion,
    place,
    phoneNumber,
  } = req.body;

  if (!id) {
    return res.status(400).json({ msg: "id tidak tersedia" });
  }

  const user = await prisma.userKlien.findUnique({
    where: {
      id,
    },
  });

  if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

  const formattedDate = new Date(birthday).toISOString();

  BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };

  try {
    const newData = {
      nik: nik || user.nik,
      gender: gender || user.gender,
      address: address || user.address,
      village: village || user.village,
      zipcode: zipcode || user.zipcode,
      rt: rt || user.rt,
      rw: rw || user.rw,
      birthday: formattedDate || user.birthday,
      job: job || user.job,
      education: education || user.education,
      religion: religion || user.religion,
      place: place || user.place,
      phoneNumber: phoneNumber || user.phoneNumber,
    };

    await prisma.userKlien.update({
      where: {
        id,
      },
      data: newData,
    });
    res.status(200).json({ msg: "Profil berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ msg: "Profil gagal diperbarui" });
  }
};

export const logoutUserKlien = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(400);

    const user = await prisma.userKlien.findMany({
      where: {
        refresh_token: refreshToken,
      },
    });
    if (!user[0]) return res.sendStatus(204);

    const userId = user[0].id;

    await prisma.userKlien.update({
      data: {
        refresh_token: null,
      },
      where: {
        id: userId,
      },
    });

    res.clearCookie("refreshToken");
    res.clearCookie("id");

    return res.status(200).json({ msg: "Berhasil Logout " });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const forgotPasswordUserKlien = async (req, res) => {
  const { email } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return res.status(500).json({ msg: "Email tidak boleh kosong" });
  else if (!email.match(emailRegex))
    return res.status(500).json({ msg: "Format email tidak valid" });

  const user = await prisma.userKlien.findFirst({
    where: {
      email,
    },
  });

  if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

  const otp = generateOTP();

  await prisma.userKlien.update({
    where: {
      id: user.id,
    },
    data: {
      otp: otp,
    },
  });

  try {
    await sendOTPEmail(email, otp);

    res.cookie("email", email, {
      httpOnly: true,
    });

    res.status(200).json({ msg: "OTP berhasil dikirim" });
  } catch (error) {
    res.status(500).json({ msg: "OTP gagal dikirim" });
  }
};

export const verifyOTPUserKlien = async (req, res) => {
  const { otp } = req.body;

  const email = req.cookies.email;

  if (!email) {
    return res.status(400).json({ msg: "User tidak ditemukan" });
  }

  const user = await prisma.userKlien.findFirst({
    where: {
      email,
    },
  });

  if (user.otp !== otp) return res.status(400).json({ msg: "OTP salah!!" });

  res.status(200).json({ msg: "Verifikasi OTP Berhasil" });
};

export const resetPasswordUserKlien = async (req, res) => {
  const { newPassword, confirmNewPassword } = req.body;

  const email = req.cookies.email;

  if (!email) {
    return res.status(400).json({ msg: "User tidak ditemukan" });
  }

  if (!newPassword)
    return res.status(400).json({ msg: "Password tidak boleh kosong" });
  else if (newPassword.length < 6)
    return res.status(400).json({ msg: "Password minimal 6 karakter" });
  else if (!/^[A-Z]/.test(newPassword))
    return res
      .status(400)
      .json({ msg: "Password harus diawali huruf kapital" });
  else if (!/(?=.*\d)(?=.*[!@#$%^&*()_+])/.test(newPassword))
    return res
      .status(400)
      .json({ msg: "Password harus mengandung angka dan simbol" });

  if (newPassword !== confirmNewPassword)
    return res.status(400).json({ msg: "Password tidak cocok" });

  const user = await prisma.userKlien.findFirst({
    where: {
      email,
    },
  });

  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hashSync(newPassword, salt);

  try {
    await prisma.userKlien.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashPassword,
        otp: null,
      },
    });

    res.clearCookie("email");

    res.status(200).json({ msg: "Password berhasil di perbarui" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
