# TOEIC Prep Course · Elevate with Ms. Maria · Learnovate Qatar

A 12-session TOEIC prep course website for adult learners who need a TOEIC score for work or study.

- **Students** sign in with an access code you give them. No account is needed.
- **The Teacher Portal** (`#teacher`, password protected) is where you create batches, add students and their codes, follow their progress, scores, writing and Error Logs, rate their mock tests and send feedback.
- **The site** is hosted on GitHub Pages. **The data** lives in a Google Sheet, through Google Apps Script.

This is an independent course. It is not affiliated with or endorsed by ETS. TOEIC is a registered trademark of ETS. All practice questions, passages, audio scripts and sample answers are original.

```
index.html              the whole website (one file)
apps-script/Code.gs     the backend you paste into Google Apps Script
tests/                  Playwright checks with a stand-in backend (for development)
```

## 1. Set up the Google Sheet and Apps Script (about 10 minutes)

1. Create a Google Sheet and name it **TOEIC Prep Course Data**.
2. Open **Extensions → Apps Script**. Delete the sample code, paste in everything from `apps-script/Code.gs`, and click **Save**.
3. Go back to the Sheet tab and **reload the page**. A new menu called **TOEIC Course** appears, next to Help.
4. Use the menu items in this order:
   1. **TOEIC Course → 1. Set teacher password.** The first time, Google asks you to authorize: click **Continue**, choose your account, click **Advanced → Go to (project name)**, then **Allow**. Run the menu item again, type your password and click **OK**.
   2. **TOEIC Course → 2. Set up sheets.** This creates the Batches, Students, Progress, Feedback, Messages, Settings and MockScores tabs.
   3. **TOEIC Course → 3. Send me a test email.** You receive an email, which confirms the course is allowed to email students.
   4. **TOEIC Course → Check setup.** Every line should show ✅.
5. Deploy the web app, back in Apps Script:
   - Click **Deploy → New deployment**, then the gear icon → **Web app**.
   - Execute as: **Me**.
   - Who has access: **Anyone**.
   - Click **Deploy** and copy the URL that ends in `/exec`.

**Your password and API key are never in the code.** The teacher password (and the optional Claude API key below) are saved in **Script Properties** through the menu. Never paste them into `index.html`, `Code.gs` or a commit.

## 2. Connect the website

Open `index.html`, find this line near the top of the `<script>`, and paste in your `/exec` URL:

```js
API_URL:'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE'
```

The web app URL is not a secret: anyone can open the site, but only students with a code (and you, with the password) can read or save data.

## 3. Publish on GitHub Pages

1. Merge the pull request into the `main` branch.
2. In the repository, go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then branch `main` and folder `/ (root)`, and click **Save**.
3. After a minute or two the site is live at `https://learnovateqa.github.io/<repository-name>/`.

## 4. Run a batch

1. Open the site, click **Teacher portal** and sign in with your password.
2. Click **+ New batch**, then **+ Add student**. Enter their name, email and phone. Keep the generated code (for example `TOE-7KQ2MZ`) or type your own.
3. Tick **Email the access code**, or click **Copy message** and send it by email, text or WhatsApp.
4. The student opens the link, types the code, and their dashboard opens.

## Session schedule per batch

- In the **Teacher Portal**, open a batch, then **Session schedule**.
- Set each session to **Open**, **Locked** or **Opens on…** a date.
- **Fill weekly dates from start date** adds two sessions per week. **Save schedule** applies it.
- Students in that batch see 🔒 on sessions that are not open yet. You always see every session.

## Messages and email

- **Students** have a **Messages** page to write to you and reply to your tasks. A red badge shows unread messages.
- **Teacher Portal → Inbox** lists new student messages and task replies. **Student detail** shows the full conversation and a box to write to them. **Message batch** sends one announcement to everyone in a batch.
- **Also send by email** sends the message from your Google account (Google’s free limit is about 100 emails a day).
- **TOEIC email-writing task:** choose this type, or click **Insert a sample email task**, to send a Writing Questions 6–7 style task. The student replies on the site with a 10-minute timer, and the reply comes back to your inbox.
- **Get emailed about student messages (optional):** **TOEIC Course → Email me when students write: on/off**.

## AI scoring for Writing (optional, Claude)

When a student submits a TOEIC email (Questions 6–7) or opinion essay (Question 8), Claude scores it like a TOEIC rater (email 0–4, essay 0–5) and shows the four areas (grammar, vocabulary, organization, task completion), which required tasks are done, sentence fixes, an improved version, and what to study next.

1. Create an account at **console.anthropic.com**, add credit under **Billing**, and create a key under **API Keys**.
2. In the Sheet: **TOEIC Course → 4. Turn on AI scoring (Claude API key)** and paste the key. It is stored in Script Properties, never in the code.
3. No redeploy is needed for the key itself.

Each student can score up to 10 responses a day (`AI_DAILY_LIMIT` in `Code.gs`). Without a key, students score themselves with a checklist instead.

## Updating to a new version of Code.gs

1. In Apps Script, select all of the old code and replace it with the new `apps-script/Code.gs`. Save.
2. Reload the Sheet and use **TOEIC Course → 2. Set up sheets** to add any new tabs.
3. Go to **Deploy → Manage deployments → ✏️ Edit**. Set Version to **New version**, then click **Deploy**. The URL stays the same, so the website needs no change.
4. If the new version uses a new Google service (for example Google Drive for Speaking recordings), choose the `setup` function in the editor toolbar and click **Run** once, then allow the new permission.

## Good to know

- **Changing a student’s code** keeps their progress and feedback. Send them the new code.
- **Deleting a student** removes their progress, feedback and messages from the Sheet.
- **Removing a mock test attempt:** open the student in the Teacher Portal, open the mock test and click **Remove this attempt**. It deletes that mock’s answers, scores, Error Log entries and your ratings, and it stays removed: an older copy on the student’s device is never uploaded again.
- **Privacy:** an access code is the student’s key, so keep codes private. The Sheet is only visible to your Google account.
- **Offline:** if a student goes offline, their practice is kept on their device and saved again automatically.

## Development checks

The tests use the pre-installed Playwright and a stand-in for the Apps Script backend (`tests/fake-gas.js` runs the real `Code.gs` in memory):

```bash
node tests/crawl.js
```

It signs in as the teacher and as a student and opens every page at desktop and phone widths, in light and dark mode, and fails on page errors, sideways scrolling, or text such as `NaN` or `undefined`.
