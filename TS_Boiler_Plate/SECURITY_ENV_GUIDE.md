# 🔐 Environment Variables Security Guide

## ⚠️ CRITICAL: Your Credentials Were Exposed!

Your `.env.example` file contained **REAL CREDENTIALS** that should NEVER be committed to GitHub:

### 🚨 Exposed Credentials (NOW FIXED):
- ❌ MongoDB connection string with real username/password
- ❌ Real email address and app password
- ❌ Weak JWT secrets

**These have been sanitized in `.env.example`**, but you need to take additional security measures.

---

## 🛡️ How to Properly Manage Environment Variables

### 1. **Understanding the Two Files**

| File | Purpose | Should be in Git? |
|------|---------|-------------------|
| `.env` | **Your actual secrets** (real passwords, API keys) | ❌ **NO - Never commit!** |
| `.env.example` | **Template with placeholders** (guides other developers) | ✅ **YES - Safe to commit** |

### 2. **Current Status** ✅

Good news! Your setup is now correct:

```bash
# ✅ .env is in .gitignore (line 16)
# ✅ .env has never been committed to Git
# ✅ .env.example is now sanitized with placeholders
```

---

## 🔒 Security Best Practices

### **Step 1: Rotate Exposed Credentials Immediately**

Since your credentials were in `.env.example`, you should rotate them:

#### A. **MongoDB Password**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to Database Access
3. Edit user `sabbirdev001_db_user`
4. Click "Edit Password" → Generate new password
5. Update your local `.env` file (NOT `.env.example`)

#### B. **Email App Password**
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Delete the old app password
3. Generate a new one
4. Update your local `.env` file

#### C. **JWT Secrets**
Generate strong secrets:
```bash
# Run this command to generate secure secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Update in your `.env` file:
```env
JWT_SECRET=<generated_secret_1>
JWT_REFRESH_TOKEN_SECRET=<generated_secret_2>
```

---

### **Step 2: Verify .gitignore is Working**

Run this command to ensure `.env` is ignored:

```bash
git check-ignore -v .env
```

Expected output:
```
.gitignore:16:.env    .env
```

---

### **Step 3: Keep Your Secrets Safe**

#### ✅ **DO:**
- Keep real credentials in `.env` (local only)
- Use `.env.example` with placeholders for documentation
- Add helpful comments in `.env.example`
- Use strong, randomly generated secrets
- Rotate credentials regularly
- Use different credentials for dev/staging/production

#### ❌ **DON'T:**
- Never commit `.env` to Git
- Never put real credentials in `.env.example`
- Never share `.env` via Slack/Discord/Email
- Never use weak secrets like "change-me" or "secret123"
- Never reuse the same secrets across projects

---

## 📦 How to Share Environment Variables Safely

### **Option 1: Secure Password Manager** (Recommended)
Use a password manager to share credentials with your team:
- [1Password](https://1password.com/) - Team vaults
- [Bitwarden](https://bitwarden.com/) - Open source
- [LastPass](https://www.lastpass.com/) - Team sharing

### **Option 2: Environment Variable Management Services**
For production deployments:
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [Azure Key Vault](https://azure.microsoft.com/en-us/services/key-vault/)
- [Google Cloud Secret Manager](https://cloud.google.com/secret-manager)
- [HashiCorp Vault](https://www.vaultproject.io/)
- [Doppler](https://www.doppler.com/)
- [Infisical](https://infisical.com/)

### **Option 3: Encrypted Files** (For Small Teams)
Use `git-crypt` or `sops` to encrypt `.env` files in Git:

```bash
# Install git-crypt
brew install git-crypt  # macOS
# or
apt-get install git-crypt  # Linux

# Initialize in your repo
git-crypt init

# Add .env to encrypted files
echo ".env filter=git-crypt diff=git-crypt" >> .gitattributes

# Add collaborators
git-crypt add-gpg-user USER_ID
```

---

## 🚀 Production Deployment

### **Never Use .env Files in Production!**

Instead, use environment variables from your hosting platform:

#### **Vercel**
```bash
vercel env add MONGODB_URL production
```

#### **Heroku**
```bash
heroku config:set MONGODB_URL="your_connection_string"
```

#### **AWS (Elastic Beanstalk)**
```bash
eb setenv MONGODB_URL="your_connection_string"
```

#### **Docker**
```bash
docker run -e MONGODB_URL="your_connection_string" your-image
```

#### **Kubernetes**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  MONGODB_URL: <base64-encoded-value>
```

---

## 🔍 How to Check if Secrets Were Committed

### **Check Git History**
```bash
# Search for specific patterns in Git history
git log --all --full-history --source --all -- .env

# Search for MongoDB connection strings
git log -S "mongodb+srv://" --all

# Search for email passwords
git log -S "EMAIL_PASSWORD" --all
```

### **If You Find Secrets in Git History**

⚠️ **You MUST remove them from Git history:**

```bash
# WARNING: This rewrites Git history - coordinate with your team!

# Option 1: Using BFG Repo-Cleaner (Recommended)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Option 2: Using git-filter-repo
pip install git-filter-repo
git filter-repo --path .env --invert-paths

# After cleaning, force push (DANGEROUS - warn team first!)
git push origin --force --all
```

**Then:**
1. Rotate ALL exposed credentials immediately
2. Notify your team about the force push
3. Everyone must re-clone the repository

---

## 📋 Checklist: Securing Your Environment Variables

- [ ] `.env` is listed in `.gitignore`
- [ ] `.env` has never been committed to Git
- [ ] `.env.example` contains only placeholders
- [ ] Real credentials have been rotated after exposure
- [ ] JWT secrets are strong (64+ characters, random)
- [ ] Different credentials for dev/staging/production
- [ ] Team uses secure method to share credentials
- [ ] Production uses platform environment variables
- [ ] Regular credential rotation schedule established

---

## 🆘 Emergency Response: Credentials Leaked

If you accidentally commit secrets to Git:

### **Immediate Actions (Within 1 hour):**
1. ✅ Rotate ALL exposed credentials immediately
2. ✅ Remove secrets from Git history (see above)
3. ✅ Force push cleaned history
4. ✅ Notify team to re-clone repository

### **Within 24 hours:**
1. ✅ Review access logs for unauthorized access
2. ✅ Enable 2FA on all affected services
3. ✅ Update security policies
4. ✅ Document the incident

### **Long-term:**
1. ✅ Implement secret scanning (GitHub Advanced Security)
2. ✅ Use pre-commit hooks to prevent future leaks
3. ✅ Regular security audits
4. ✅ Team security training

---

## 🛠️ Tools to Prevent Secret Leaks

### **Pre-commit Hooks**

Install `git-secrets`:
```bash
# Install
brew install git-secrets  # macOS
# or
apt-get install git-secrets  # Linux

# Setup
git secrets --install
git secrets --register-aws
git secrets --add 'mongodb+srv://[^"]*'
git secrets --add 'EMAIL_PASSWORD=[^"]*'
```

### **GitHub Secret Scanning**

Enable in your repository:
1. Go to Settings → Security → Code security and analysis
2. Enable "Secret scanning"
3. Enable "Push protection"

### **Pre-commit Framework**

Create `.pre-commit-config.yaml`:
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: detect-private-key
      - id: check-added-large-files
  
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
```

Install:
```bash
pip install pre-commit
pre-commit install
```

---

## 📚 Additional Resources

- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [12-Factor App: Config](https://12factor.net/config)
- [Mozilla: Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)

---

## ✅ Your Current Status

**Good News:**
- ✅ `.env` is properly gitignored
- ✅ `.env` was never committed to Git
- ✅ `.env.example` is now sanitized

**Action Required:**
- ⚠️ Rotate MongoDB password
- ⚠️ Rotate email app password  
- ⚠️ Generate strong JWT secrets
- ⚠️ Update your local `.env` with new credentials

**Your `.env` file is safe and will NOT be pushed to GitHub!** 🎉

---

<div align="center">
  <b>Remember: Secrets in code = Security incident waiting to happen!</b>
</div>
