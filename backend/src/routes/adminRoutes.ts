import { Router } from "express";
import { authorized } from "../middleware/authRole";
import authMiddleware from "../middleware/authMiddleware";
import { globalStats,
    filterUsers,
    userStats,
    getSingleUser,
     updateUser,
     changeRole, deleteUser } from "../controllers/adminController";
import { deleteEvent } from "../controllers/deleteEvent";





const router = Router();


// admin dashboard
router.get('/dashboard-stats', authMiddleware, authorized('admin'), globalStats);

router.get('/users', authMiddleware, authorized('admin'), filterUsers);

router.get('/users/stats', authMiddleware, authorized('admin'), userStats);

router.get('/users/:id', authMiddleware, authorized('admin'), getSingleUser);

router.put('/users/:id', authMiddleware, authorized('admin'), updateUser);

router.put('/users/:id/role', authMiddleware, authorized('admin'), changeRole);

router.delete('/users/:id', authMiddleware, authorized('admin'), deleteUser);

router.delete('/delete/:id',authMiddleware,authorized('admin'),deleteEvent)



export default router;
