// ═══════════════════════════════════════════════════════════════════════
// authController.js — Controller for Authentication (GYMVex)
// ═══════════════════════════════════════════════════════════════════════

const User = require('../models/User');
const UserProfile = require('../models/UserProfile');

// ═══════════════════════════════════════════════════════════════════════
// 1. POST /api/auth/register — Register New User Account
// ═══════════════════════════════════════════════════════════════════════
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || 'Athlete').trim();

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please sign in instead.',
      });
    }

    // Create unique userId
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Create User record in MongoDB
    const newUser = await User.create({
      userId,
      name: cleanName,
      email: cleanEmail,
      password: password.trim(),
      loginCount: 1,
    });

    // Determine default avatar
    const isFemale = /^(emma|olivia|ava|isabella|sophia|mia|charlotte|amelia|harper|evelyn|abigail|emily|ella|elizabeth|camila|luna|sofia|avery|mila|aria|scarlett|penelope|layla|chloe|victoria|madison|eleanor|grace|nora|riley|zoey|hannah|hazel|lily|ellie|violet|lillian|zoe|stella|aurora|natalie|emilia|everly|leah|aubrey|willow|addison|lucy|audrey|bella|claire|skylar|isla|genesis|naomi|elena|sarah|priya|pooja|neha|ananya|sneha|shreya|divya|kavya|rita|maria|anna|laura|jessica|ashley|karen|nancy|lisa|betty|margaret|sandra|kimberly|donna|michelle|carol|amanda|melissa|deborah|stephanie|rebecca|sharon|cynthia|kathleen|amy|shirley|angela|helen|brenda|pamela|nicole|samantha|katherine|christine|debra|rachel|carolyn|janet|catherine|heather|diane|ruth|julie|joyce|virginia|kelly|lauren|christina|joan|judith|megan|andrea|cheryl|jacqueline|martha|gloria|teresa|ann|sara|frances|kathryn|janice|jean|alice|julia|judy|denise|amber|doris|marilyn|danielle|beverly|theresa|diana|brittany|marie|kayla|alexis|lori|tina|tiffany|priyanka|deepika|katrina|alia|shraddha|kareena|rashmika|kriti|kiara|disha|janhvi|anushka|radhika|taapsee|sonam|sonakshi|parineeti|iliana|yami|tamannaah|nayanthara|keerthy|trisha|kajal|anupama|hansika|raashi|shruti|genelia|aishwarya|madhuri|juhi|rani|preity|bipasha|vidya|sushmita|lara|dia|mallika|kangna|tabu|urvashi|mrunal|nushrratt|bhumi|huma|richa|swara|fatima|sanya|palak|suhana|khushi|shanaya|tara|rhea|alessia|giulia|chiara|francesca|federica|martina|valentina|silvia|elisa|camilla|giorgia|ilaria|beatrice|eleonora|roberta|woman|female|girl)/i.test(cleanName);
    const assignedAvatar = req.body.profileImage || (isFemale
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400'
      : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400');

    // Create or link initial UserProfile document
    let profile = await UserProfile.findOne({ userId });
    if (!profile) {
      profile = await UserProfile.create({
        userId,
        name: cleanName,
        email: cleanEmail,
        profileImage: assignedAvatar,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        profileImage: profile.profileImage || assignedAvatar,
        isFirstLogin: true,
        loginCount: 1,
        profile,
      },
    });
  } catch (error) {
    console.error('Error during user registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 2. POST /api/auth/login — Sign In User
// ═══════════════════════════════════════════════════════════════════════
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user in MongoDB
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found. Please create an account first.',
      });
    }

    // Verify password using bcryptjs matchPassword
    const isPasswordMatch = await user.matchPassword(password.trim());
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.',
      });
    }

    // If existing user has legacy plain text password, automatically hash it on login
    if (
      !user.password.startsWith('$2a$') &&
      !user.password.startsWith('$2b$') &&
      !user.password.startsWith('$2y$')
    ) {
      user.password = password.trim();
    }

    // Track whether this is the first login or returning login
    const isFirstLogin = !user.loginCount || user.loginCount <= 1;
    user.loginCount = (user.loginCount || 1) + 1;
    await user.save();

    // Fetch user profile data if available
    let profile = await UserProfile.findOne({ userId: user.userId });
    if (!profile) {
      profile = await UserProfile.create({
        userId: user.userId,
        name: user.name,
        email: user.email,
      });
    }

    return res.json({
      success: true,
      message: 'Signed in successfully!',
      data: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        profileImage: profile.profileImage,
        isFirstLogin: isFirstLogin,
        loginCount: user.loginCount,
        ...profile.toObject(),
      },
    });
  } catch (error) {
    console.error('Error during user login:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during sign in. Please try again.',
      error: error.message,
    });
  }
};

