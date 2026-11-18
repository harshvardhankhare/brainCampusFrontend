# Frontend test cases

Run the automated suite with `npm test`; use `npm run test:watch` while changing components. Automated cases live beside their components in `src/`.

## Automated coverage

| Area | Cases |
| --- | --- |
| Route protection | Auth initialization loading state; unauthenticated redirect; staff and student role access; role mismatch redirects; role normalization. |
| Login | Required fields; successful staff login; successful student login; `/auth/me` fallback when the login response omits the user; API error display and retry readiness. |
| Student registration | Required fields and 8-character password minimum; successful registration and sign-in link; API error display while keeping the form available. |
| Student home and profile | Personalized greeting and class details; links to profile and fees; profile fields and missing-value fallbacks. |
| Student fees | No linked student record; total/paid/remaining calculations; paid, partial, and pending statuses; API failure message. |
| Theme | Nine shade palette and base color; saved theme and color application; default light theme. |

## Route and page acceptance cases

Run these against a seeded backend account for each role. For every data-driven page, also repeat with an empty response and a failed request; the page should show an empty or error state without losing its navigation shell.

| Route | Acceptance cases |
| --- | --- |
| `/` | Redirects to `/login`. |
| `/login` | Valid staff credentials enter `/dashboard`; student credentials enter `/student-dashboard`; invalid credentials show an error; submit is disabled while the request is pending. |
| `/student-register` | Valid school code, email, and password create an account; duplicate/invalid details show a recoverable error; success links back to sign in. |
| `/forgot-password`, `/reset-password` | Page renders and supports the intended recovery flow once the backend flow is connected. |
| `/dashboard` | Dashboard request uses the current month range; metrics render from response; 403 and general failures show the appropriate error. |
| `/dashboard/students`, `/dashboard/students/list` | Student collection loads; search/filter narrows rows; empty state appears; add and row selection open the correct workflows. |
| `/dashboard/students/add` | Required student fields validate; successful save creates the student and returns to the list; API errors remain visible. |
| `/dashboard/students/:id` | Correct student details load; missing ID/data is handled; profile actions navigate to result and fee views. |
| `/dashboard/students/:id/results/:examId` | Correct exam result and subject marks display; missing results show an empty state. |
| `/dashboard/students/:id/fees`, `/dashboard/students/fees/add` | Fee history and totals match records; new fee validates and saves; partial/paid/pending states are represented. |
| `/dashboard/teachers`, `/dashboard/teachers/:id` | Teacher list, detail, empty, and error states render; selecting a row opens that teacher. |
| `/dashboard/teachers/assignments` | Assignment data loads; valid assignment can be created/updated; invalid combinations show validation feedback. |
| `/dashboard/academics`, `/dashboard/academics/setup` | Academic years/classes/sections/subjects render; setup validates required values and persists changes. |
| `/dashboard/staff` | Staff list loads; add/edit form validates; save and cancel behave correctly; server errors are shown. |
| `/dashboard/finance` | Financial totals and transactions render; empty/error states are recoverable; currency values are formatted consistently. |
| `/dashboard/settings`, `/dashboard/settings/fee-types` | Settings and fee types load; valid edits persist; invalid or failed saves show feedback; saved theme/brand settings apply. |
| `/dashboard/admin`, `/dashboard/roles` | Admin options and role list load; role changes obey available permissions; unauthorized requests show an access error. |
| `/dashboard/api-dashboard`, `/dashboard/api-dashboard/logs` | API health/status and audit events load; filters/pagination update results; empty and request error states render. |
| `/student-dashboard` | Linked student's name and academic details render; quick links open profile and fees. |
| `/student-dashboard/profile` | Student details render with clear fallbacks for missing values. |
| `/student-dashboard/fees` | Fee summary equals record totals; each record status is correct; unlinked, empty, loading, and error states render. |
| Unknown route | 404 page appears; “Go Back Home” returns to the login redirect. |

## Cross-cutting checks

- Refresh a protected route with a valid session and confirm auth initialization resolves before protected content appears.
- Confirm students cannot access staff routes and staff cannot access student routes, including after direct URL entry.
- Navigate between dashboard routes and verify the sidebar, navbar, and main content remain usable at desktop and narrow viewport widths.
- Check keyboard-only use of forms, links, navigation toggles, dialogs, and tables; visible focus and accessible labels should be present.
- Confirm loading indicators stop on both success and failure, and repeated submissions do not create duplicate records.
