Two login pages, one shared LoginForm component with a `role` prop.
STUDENT: bg #04060d, text #f4f6fb, muted #8d95a8, accent #8fb4ff. Font Geist.
Pill inputs/buttons (radius 999px), 1px borders rgba(255,255,255,.16).
Background: spiral galaxy of ~1300 tiny particles (white, blue, a few orange),
slow differential rotation, soft center glow, subtle mouse parallax.
Huge wordmarks "Student" (left) and "Portal" (right) at vertical center, hidden under 900px.
ADMIN: bg #0b0704, text #fbf3e6, muted #a3917a, accent #ffb040. Font Space Grotesk.
6px radius, amber borders. Background: 6 tilted concentric rings with orbiting dots
and a slow horizontal scan line. Wordmarks "Admin" / "Console".
Centered frosted card (blur 14px, 1px border), sentence-case copy, no all caps.
Motion: slow only; respect prefers-reduced-motion; cap devicePixelRatio at 1.5.
EFFECTS
- Canvas states: idle | focus | error | success
- focus: center glow brightens, rotation slows 40%
- error: 400ms ripple pushes particles outward, they ease back, card shakes 6px
- success: particles ease to the center over 900ms, then fade to dashboard
- Role switch: background cross-fades (galaxy <-> rings) over 600ms, accent colors tween
- Performance: <= 1300 particles desktop, <= 600 mobile, pause when tab hidden,
  cap devicePixelRatio at 1.5, honor prefers-reduced-motion (static frame)

TASK 2: STUDENT DASHBOARD (same Student theme: bg #04060d, accent #8fb4ff, Geist)
Layout (desktop): left slim sidebar, main area with a greeting header.
 Row 1: Profile summary card (avatar, name, program, semester, overall progress ring)
 Row 2: Continue Learning (one large featured card, resume button, progress bar)
 Row 3: Enrolled courses grid (each: title, instructor, progress %, progress bar)
 Row 4: Recently accessed lessons (list, 5 items, course name + time ago)
 Row 5: Completed courses (compact cards with a completed badge and date)
Mobile (<768px): sidebar becomes a bottom tab bar, cards stack in one column,
 course grid becomes a horizontal scroll or single column.
Style: reuse the frosted cards (blur 14px, 1px border rgba(255,255,255,.16)),
 sparse starfield background (about 150 slow particles, not the full galaxy),
 pill buttons, sentence-case copy, no all caps.
Effects: progress rings and bars animate from 0 to their value on first view (900ms ease-out),
 numbers count up, cards lift 2px on hover, one staggered entrance on page load only.
 Respect prefers-reduced-motion (show final values instantly).
Mock data: one student, 6 enrolled courses, 3 completed, 5 recent lessons.

TASK 3: COURSE LISTING & SEARCH (Student theme, route /student/courses)
Layout (desktop): page header, search bar + sort dropdown, left filter panel
 (category checkboxes, level pills: All / Beginner / Intermediate / Advanced),
 results grid (3 columns), pagination at the bottom.
Mobile (<768px): filters move into a slide-up "Filters" sheet, grid is 1 column.
Course card: thumbnail gradient, title, instructor, category tag, level tag,
 duration, rating, lesson count, and an "Enrolled" badge if the student is enrolled.
Course details preview: clicking a card opens a side drawer (desktop) or full-height
 sheet (mobile) with description, what you'll learn, syllabus outline, instructor,
 and an Enroll / Continue button. Esc closes it, focus is trapped inside while open.
Behavior: search is debounced (300ms) and matches title, instructor and category;
 filters combine (AND); active filters shown as removable chips; "Clear all";
 filter, search, sort and page are stored in the URL query string;
 pagination is numbered, 9 courses per page; empty state says what to change.
Style: same frosted cards, pill buttons, sentence case. Cards fade in once per page change,
 the drawer slides in 250ms, results animate only when the list changes.
 Respect prefers-reduced-motion.
Mock data: 30 courses across 6 categories and 3 levels.

TASK 4: COURSE DETAILS & ENROLLMENT (Student theme)
Routes: /student/courses/:courseId (details), /student/checkout/:courseId (mock payment),
 /student/checkout/:courseId/processing, /student/checkout/:courseId/success.
The Task 3 drawer gets a "View full details" link to the details page.
Details page layout (desktop): hero (title, short description, rating stars + count,
 duration, level, lesson count, category tag), two columns below:
 main = About this course, What you'll learn, Modules accordion (each module expands to
 its lessons list with lesson title, duration, and a lock icon if not enrolled),
 Instructor card (avatar, name, role, bio, courses count, rating).
 side = sticky enroll card (price or Free, "Enroll now" pill button, includes list).
Mobile (<768px): single column, enroll card becomes a sticky bottom bar with price + button.
Enrollment states: not enrolled -> "Enroll now"; enrolled -> "Continue learning" + progress;
 free course -> enrolls instantly with a success toast, no checkout.
Mock checkout (paid courses): order summary, a payment method choice (Card, UPI, Net banking)
 shown as selectable pills, a clearly labelled "Demo payment: no real charge" notice,
 NO real card fields: do not collect or store card numbers; use a "Pay (demo)" button.
 Flow: checkout -> processing screen (2s animated) -> success or failure (toggle with ?fail=1)
 -> on success, add course to enrolled list in session state and offer "Start first lesson".
Style: same frosted cards, pill buttons, sentence case. Accordion opens in 200ms,
 processing screen reuses a small version of the starfield, success has one particle burst.
 Respect prefers-reduced-motion.
Mock data: extend courseCatalog with price, modules[{title, lessons[{title, duration}]}],
 instructor{name, role, bio, rating, courseCount}.

 TASK 5: LESSON PAGE (Student theme)
Route: /student/learn/:courseId/:lessonId (enrolled students only; others redirect to
 /student/courses/:courseId with a toast).
Layout (desktop): two columns.
 main = video player (16:9, rounded, frosted border), lesson title, short description,
  action row: Previous / Mark as complete / Next, then a Resources section (downloads).
 side = course outline: module accordion with lessons, each showing a status icon
  (not started, in progress, completed), duration, and the current lesson highlighted.
 Top strip: course title, back-to-course link, lesson progress indicator
  ("Lesson 4 of 18" + a thin course progress bar with %).
Mobile (<768px): player on top, then title and actions, the outline becomes a bottom
 sheet opened by a "Course content" button, and the action row sticks to the bottom.
Behavior:
 - Video uses a native HTML5 <video> with controls and a poster; the source is a small
   local file in /public/videos. Remember playback position per lesson.
 - Mark as complete toggles the lesson (undo allowed), updates the outline, the progress
   bar and percentage, and the course progress on the Dashboard and Courses pages without
   a reload. Auto-prompt "Mark as complete?" when the video reaches 90%.
 - Next goes to the next lesson (crossing module boundaries); on the last lesson it shows
   "Course complete" and a link to the course page. Previous is disabled on the first lesson.
 - Resources: list of mock downloadable files (PDF, ZIP, code) with name, type and size;
   a download button for each, using small placeholder files in /public/resources.
 - Progress and playback positions are stored in sessionStorage via a ProgressContext.
Style: same frosted cards, pill buttons, sentence case. Lesson changes cross-fade the
 title area in 200ms; the progress bar animates; completing a lesson shows one small
 check animation. Respect prefers-reduced-motion.
Keyboard: Left/Right arrows seek only when the video is focused; "N" next lesson and
 "P" previous lesson work when focus is not in an input.