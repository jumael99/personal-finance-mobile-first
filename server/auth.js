import crypto from 'crypto';
import express from 'express';

export const authRouter = express.Router();

function getFrontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
}

function getCallbackUrl() {
  return process.env.GOOGLE_CALLBACK_URL || `${getFrontendUrl()}/api/auth/google/callback`;
}

function requiredEnv(name) {
  if (!process.env[name]) {
    throw new Error(`${name} is not configured`);
  }

  return process.env[name];
}

authRouter.get('/me', (req, res) => {
  res.json({
    authenticated: Boolean(req.session.user),
    user: req.session.user || null,
  });
});

authRouter.get('/google/start', (req, res) => {
  const state = crypto.randomBytes(24).toString('hex');
  req.session.oauthState = state;

  const params = new URLSearchParams({
    client_id: requiredEnv('GOOGLE_CLIENT_ID'),
    redirect_uri: getCallbackUrl(),
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'consent',
    access_type: 'offline',
    state,
  });

  req.session.save(() => {
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  });
});

authRouter.get('/google/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;

    if (!code || !state || state !== req.session.oauthState) {
      return res.redirect(`${getFrontendUrl()}/?authError=state`);
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: String(code),
        client_id: requiredEnv('GOOGLE_CLIENT_ID'),
        client_secret: requiredEnv('GOOGLE_CLIENT_SECRET'),
        redirect_uri: getCallbackUrl(),
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      return res.redirect(`${getFrontendUrl()}/?authError=token`);
    }

    const tokenData = await tokenResponse.json();
    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      return res.redirect(`${getFrontendUrl()}/?authError=profile`);
    }

    const profile = await profileResponse.json();

    req.session.user = {
      id: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    };

    delete req.session.oauthState;

    return req.session.save(() => {
      res.redirect(`${getFrontendUrl()}/overview`);
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.post('/logout', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie('finance.sid');
    return res.json({ ok: true });
  });
});

export function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  req.user = req.session.user;
  return next();
}
