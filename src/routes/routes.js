import { Router } from "express";
import {
  createUserAdmin,
  createUserKlien,
  forgotPasswordUserKlien,
  getAllUsersAdmin,
  getAllUsersKlien,
  getUserByIdKlien,
  loginUserAdmin,
  loginUserKlien,
  logoutUserAdmin,
  logoutUserKlien,
  resetPasswordUserKlien,
  updateProfilKlien,
  updateUserKlien,
  verifyOTPUserKlien,
} from "../controllers/UserController.js";
import {
  refreshTokenAdmin,
  refreshTokenKlien,
} from "../controllers/RefreshToken.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import {
  createNews,
  deleteNews,
  getAllNews,
  getNewsAbove100Views,
  getNewsBelow50Views,
  getNewsById,
  getTopBerita,
  updateNews,
  updateViewNews,
} from "../controllers/NewsController.js";
import {
  createDestination,
  deleteDestination,
  getAllDestination,
  getDestinationById,
  getDestinationsAbove100Views,
  getDestinationsBelow50Views,
  getTop2Destination,
  getTopDestination,
  updateDestination,
  updateViewDestination,
} from "../controllers/DestinationController.js";
import {
  createLetter,
  deleteLetter,
  getAllLetters,
  getIncomingLetter,
  getLetterByAuthor,
  getLetterById,
  getLetterByNumber,
  getMonthlyStatistics,
  getOutgoingLetter,
  getRejectedLetter,
  getShowFileLetterById,
  updateLetter,
  updateLetterKlien,
} from "../controllers/LettersController.js";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
} from "../controllers/AnnouncementController.js";
import {
  createTransparency,
  deleteTransparency,
  getAllTransparency,
  getTransparencyById,
  showPDFTransparencyById,
  updateTransparency,
} from "../controllers/APBDController.js";
import {
  createComentar,
  getAllComentars,
} from "../controllers/ComentarController.js";

const router = Router();

// ** Routes User Admin
router.get("/auth/users", verifyToken, getAllUsersAdmin);
router.get("/auth/retoken", refreshTokenAdmin);
router.post("/auth/login", loginUserAdmin);
router.post("/auth/create", createUserAdmin);
router.delete("/auth/logout", logoutUserAdmin);

// ** Routes User Klien
router.get("/users", getAllUsersKlien);
router.get("/user", getUserByIdKlien);
router.get("/retoken", refreshTokenKlien);
router.post("/create", createUserKlien);
router.post("/login", loginUserKlien);
router.post("/forgot-password", forgotPasswordUserKlien);
router.post("/forgot-password/otp", verifyOTPUserKlien);
router.post("/reset-password", resetPasswordUserKlien);
router.patch("/updateUser", updateUserKlien);
router.patch("/updateProfil/:id", updateProfilKlien);
router.delete("/logout", logoutUserKlien);

// ** Routes News
router.get("/news", getAllNews);
router.get("/news/:id", getNewsById);
router.get("/newsTop", getTopBerita);
router.get("/newsBelow50", getNewsBelow50Views);
router.get("/newsAbove100", getNewsAbove100Views);
router.post("/news/create", verifyToken, createNews);
router.patch("/news/update/:id", updateNews);
router.patch("/news/updateViews/:id", updateViewNews);
router.delete("/news/delete/:id", deleteNews);

// ** Routes Comentar
router.get("/comentars", getAllComentars);
router.post("/comentar/create", verifyToken, createComentar);

// ** Routes Destinations
router.get("/destinations", getAllDestination);
router.get("/destination/:id", getDestinationById);
router.get("/destinationTop", getTopDestination);
router.get("/destinationTop2", getTop2Destination);
router.get("/destinationBelow50", getDestinationsBelow50Views);
router.get("/destinationAbove100", getDestinationsAbove100Views);
router.post("/destination/create", verifyToken, createDestination);
router.patch("/destination/update/:id", updateDestination);
router.patch("/destination/updateViews/:id", updateViewDestination);
router.delete("/destination/delete/:id", deleteDestination);

// ** Routes Letter
router.get("/letters", getAllLetters);
router.get("/letter/:id", getLetterById);
router.get("/letterNumber/:numberLetter", getLetterByNumber);
router.get("/letterAuthor", getLetterByAuthor);
router.get("/letterPending", getIncomingLetter);
router.get("/letterAccepted", getOutgoingLetter);
router.get("/letterRejected", getRejectedLetter);
router.get("/letterShowFile/:id", getShowFileLetterById);
router.get("/letterStatsMonthly", getMonthlyStatistics);
router.post("/letter/create", verifyToken, createLetter);
router.patch("/letter/update/:id", updateLetter);
router.patch("/letter/updateKlien/:id", updateLetterKlien);
router.delete("/letter/delete/:id", deleteLetter);

// ** Routes Announcements
router.get("/announcements", getAllAnnouncement);
router.get("/announcement/:id", getAnnouncementById);
router.post("/announcement/create", verifyToken, createAnnouncement);
router.patch("/announcement/update/:id", updateAnnouncement);
router.delete("/announcement/delete/:id", deleteAnnouncement);

// ** Routes Transparency
router.get("/transparencys", getAllTransparency);
router.get("/transparency/:id", getTransparencyById);
router.get("/transparencyShow/:id", showPDFTransparencyById);
router.post("/transparency/create", verifyToken, createTransparency);
router.patch("/transparency/update/:id", updateTransparency);
router.delete("/transparency/delete/:id", deleteTransparency);

export default router;
