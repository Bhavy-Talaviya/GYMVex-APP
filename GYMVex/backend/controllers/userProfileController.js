// ═══════════════════════════════════════════════════════════════════════
// userProfileController.js — Controller for User Profile & Settings
// ═══════════════════════════════════════════════════════════════════════
// Controller handling endpoints to fetch profile, update profile/settings,
// and handle account deletion.
// ═══════════════════════════════════════════════════════════════════════

const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const UserWorkoutState = require('../models/UserWorkoutState');
const WorkoutLog = require('../models/WorkoutLog');
const WeightLog = require('../models/WeightLog');
const NotificationSettings = require('../models/NotificationSettings');

// ═══════════════════════════════════════════════════════════════════════
// 1. GET /api/profile — Fetch User Profile & Settings
// ═══════════════════════════════════════════════════════════════════════
exports.getUserProfile = async (req, res) => {
  try {
    const userId = (req.query.userId || '').trim();
    const email = (req.query.email || '').trim().toLowerCase();

    const lookupQueries = [];
    if (userId) lookupQueries.push({ userId });
    if (email) lookupQueries.push({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    if (lookupQueries.length === 0) {
      return res.json({
        success: true,
        data: null,
      });
    }

    let profile = await UserProfile.findOne({ $or: lookupQueries });
    let user = await User.findOne({ $or: lookupQueries });

    if (!profile && user) {
      profile = await UserProfile.create({
        userId: user.userId,
        name: user.name || 'Athlete',
        email: user.email,
      });
    } else if (user && profile) {
      // Sync real user details to profile if needed
      let updated = false;
      if (user.name && (!profile.name || profile.name === 'Athlete')) {
        profile.name = user.name;
        updated = true;
      }
      if (user.email && (!profile.email || profile.email === 'athlete@gymvex.com')) {
        profile.email = user.email;
        updated = true;
      }
      if (!profile.userId) {
        profile.userId = user.userId;
        updated = true;
      }
      if (updated) {
        await profile.save();
      }
    }

    res.json({
      success: true,
      data: profile || null,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 2. POST /api/profile — Update User Profile & Settings
// ═══════════════════════════════════════════════════════════════════════
exports.updateUserProfile = async (req, res) => {
  try {
    const { userId, currentEmail, ...updateFields } = req.body;

    const searchConditions = [];
    if (userId) {
      searchConditions.push({ userId });
    }
    if (updateFields.email) {
      searchConditions.push({ email: { $regex: new RegExp(`^${updateFields.email.trim()}$`, 'i') } });
    }
    if (currentEmail) {
      searchConditions.push({ email: { $regex: new RegExp(`^${currentEmail.trim()}$`, 'i') } });
    }
    if (searchConditions.length === 0) {
      return res.status(400).json({ success: false, message: 'User identification (userId or email) required' });
    }

    // Clean trimmed fields
    if (updateFields.name) updateFields.name = updateFields.name.trim();
    if (updateFields.email) updateFields.email = updateFields.email.trim().toLowerCase();

    // 1. Update UserProfile in MongoDB
    const profile = await UserProfile.findOneAndUpdate(
      { $or: searchConditions },
      { $set: { ...updateFields, ...(userId ? { userId } : {}) } },
      { new: true, upsert: true }
    );

    // 2. Also update User model in MongoDB if name or email changed
    if (updateFields.name || updateFields.email) {
      const userUpdate = {};
      if (updateFields.name) userUpdate.name = updateFields.name;
      if (updateFields.email) userUpdate.email = updateFields.email;

      await User.findOneAndUpdate(
        { $or: searchConditions },
        { $set: userUpdate }
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully in MongoDB database!',
      data: profile,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 3. DELETE /api/profile/account — Delete Account & All Data Permanently
// ═══════════════════════════════════════════════════════════════════════
exports.deleteAccount = async (req, res) => {
  try {
    const userId = (req.query.userId || req.body?.userId || '').trim();
    const email = (req.query.email || req.body?.email || '').trim().toLowerCase();

    const searchConditions = [];
    if (userId) {
      searchConditions.push({ userId });
    }
    if (email) {
      // Case-insensitive exact email match
      searchConditions.push({ email: { $regex: new RegExp(`^${email.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') } });
    }

    if (searchConditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'userId or email is required to delete account',
      });
    }

    const orSearchQuery = { $or: searchConditions };

    // Find all matching users and profiles in MongoDB
    const [matchingUsers, matchingProfiles] = await Promise.all([
      User.find(orSearchQuery).select('userId email').lean(),
      UserProfile.find(orSearchQuery).select('userId email').lean(),
    ]);

    const allUserIds = new Set();
    const allEmails = new Set();

    if (userId) allUserIds.add(userId);
    if (email) allEmails.add(email);

    matchingUsers.forEach((u) => {
      if (u.userId) allUserIds.add(u.userId);
      if (u.email) allEmails.add(u.email.trim().toLowerCase());
    });

    matchingProfiles.forEach((p) => {
      if (p.userId) allUserIds.add(p.userId);
      if (p.email) allEmails.add(p.email.trim().toLowerCase());
    });

    const userIdsArray = Array.from(allUserIds);
    const emailsRegexArray = Array.from(allEmails).map(
      (e) => new RegExp(`^${e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i')
    );

    const fullDeleteQuery = {
      $or: [
        ...(userIdsArray.length > 0 ? [{ userId: { $in: userIdsArray } }] : []),
        ...(emailsRegexArray.length > 0 ? [{ email: { $in: emailsRegexArray } }] : []),
      ],
    };

    // Delete across User, UserProfile, and all related collections in MongoDB
    const [delUsers, delProfiles, delWorkoutStates, delWorkoutLogs, delWeightLogs, delNotificationSettings] =
      await Promise.all([
        User.deleteMany(fullDeleteQuery),
        UserProfile.deleteMany(fullDeleteQuery),
        UserWorkoutState.deleteMany({ userId: { $in: userIdsArray } }),
        WorkoutLog.deleteMany({ userId: { $in: userIdsArray } }),
        WeightLog.deleteMany({ userId: { $in: userIdsArray } }),
        NotificationSettings.deleteMany({ userId: { $in: userIdsArray } }),
      ]);

    console.log(
      `🗑️ Account & Profile Deleted: Users: ${delUsers.deletedCount}, UserProfiles: ${delProfiles.deletedCount}, WorkoutStates: ${delWorkoutStates.deletedCount}, WorkoutLogs: ${delWorkoutLogs.deletedCount}, WeightLogs: ${delWeightLogs.deletedCount}, Notifications: ${delNotificationSettings.deletedCount}`
    );

    res.json({
      success: true,
      message: 'Account, user profile, and all associated fitness data permanently deleted from MongoDB',
      deletedCounts: {
        users: delUsers.deletedCount,
        userProfiles: delProfiles.deletedCount,
        workoutStates: delWorkoutStates.deletedCount,
        workoutLogs: delWorkoutLogs.deletedCount,
        weightLogs: delWeightLogs.deletedCount,
        notificationSettings: delNotificationSettings.deletedCount,
      },
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message,
    });
  }
};

