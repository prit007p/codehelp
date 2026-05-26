import { clerkClient } from '@clerk/express';
import User from '../models/User.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

const getPrimaryEmail = (clerkUser) => {
  const primaryEmail = clerkUser.emailAddresses?.find(
    (email) => email.id === clerkUser.primaryEmailAddressId
  );

  return normalizeEmail(primaryEmail?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress);
};

const buildUsernameBase = (clerkUser, email) => {
  const fallback = email ? email.split('@')[0] : `user-${clerkUser.id.slice(-8)}`;
  const name = clerkUser.username || clerkUser.firstName || fallback;

  return name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || fallback;
};

const ensureUniqueUsername = async (baseUsername, clerkId) => {
  let username = baseUsername;
  let suffix = 1;

  while (await User.exists({ username, clerkId: { $ne: clerkId } })) {
    username = `${baseUsername}-${suffix}`;
    suffix += 1;
  }

  return username;
};

export const getOrCreateUserFromClerk = async (clerkId) => {
  if (!clerkId) {
    throw new Error('Missing Clerk user id');
  }

  let appUser = await User.findOne({ clerkId });
  if (appUser) {
    return appUser;
  }

  const clerkUser = await clerkClient.users.getUser(clerkId);
  const email = getPrimaryEmail(clerkUser);

  if (!email) {
    throw new Error(`Clerk user ${clerkId} does not have an email address`);
  }

  appUser = await User.findOne({ email });
  if (appUser) {
    appUser.clerkId = clerkId;
    if (!appUser.avatar && clerkUser.imageUrl) {
      appUser.avatar = clerkUser.imageUrl;
    }
    await appUser.save();
    return appUser;
  }

  const username = await ensureUniqueUsername(buildUsernameBase(clerkUser, email), clerkId);

  appUser = new User({
    clerkId,
    username,
    email,
    avatar: clerkUser.imageUrl,
    role: ADMIN_EMAIL && normalizeEmail(ADMIN_EMAIL) === email ? 'admin' : 'user',
  });

  await appUser.save();
  return appUser;
};

export const setRequestUser = (req, appUser, auth) => {
  req.user = {
    clerkId: auth.userId,
    userId: appUser._id.toString(),
    username: appUser.username,
    email: appUser.email,
    role: appUser.role,
  };
};
