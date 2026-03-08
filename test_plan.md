# Sorium - Comprehensive Test Scenarios

This document outlines the core test scenarios for the Sorium application. These scenarios are designed for **Manual Testing**, but they are written in a structured format (Given/When/Then) so that they can be easily converted into **Automated E2E Tests** (e.g., using Playwright or Cypress) in the future.

## 1. Authentication & Authorization (Login / Registration)

### 1.1. Successful Student Login
*   **Given** a registered student user with valid credentials.
*   **When** the user navigates to the `/login` page and enters their email and password, then clicks login.
*   **Then** the user is redirected to the homepage (`/`).
*   **And** the user's role badge (Student) and profile information are visible in the sidebar/navigation.

### 1.2. Successful Teacher Login
*   **Given** a registered teacher user with valid credentials.
*   **When** the user enters their credentials and logs in.
*   **Then** the user is redirected to the homepage.
*   **And** the user's role badge (Teacher) and subject (e.g., "Matematik") are visible.
*   **And** teacher-specific UI elements (if any) are accessible.

### 1.3. Invalid Credentials
*   **Given** an unregistered email or an incorrect password.
*   **When** the user attempts to log in.
*   **Then** the login fails.
*   **And** an appropriate error message is displayed (e.g., "Invalid login credentials").

### 1.4. Role-Based Access Control (RBAC) - Admin Pages
*   **Given** a non-admin user (Student or Teacher).
*   **When** the user attempts to access an admin-only route or perform an admin-only action (if applicable).
*   **Then** the action is blocked, and the user receives a "Forbidden" or "Unauthorized" message/redirection.

## 2. Content Feed & Homepage Filtering

### 2.1. Basic Feed Loading
*   **Given** the user is on the homepage (`/`).
*   **When** the feed loads.
*   **Then** a list of recent posts (questions, notes, videos) is displayed.

### 2.2. Grade and Subject Filtering
*   **Given** the user is on the homepage.
*   **When** the user selects a specific Grade (e.g., "11. Sınıf") and Subject (e.g., "Matematik") from the filters.
*   **Then** the feed updates to show ONLY content matching Grade 11 Mathematics.
*   **And** the URL updates with the corresponding search parameters (e.g., `/?grade=11&subject=Matematik`).
*   **And** a "Filter Active" banner is displayed.

### 2.3. Clearing Filters
*   **Given** active filters on the homepage.
*   **When** the user clicks "Clear Filters" on the filter banner.
*   **Then** the feed resets to show all content.
*   **And** the search parameters are removed from the URL.

### 2.4. Role-Based Filtering
*   **Given** the user is on the homepage.
*   **When** the user switches the feed tab between "All", "Teacher", and "Student".
*   **Then** the content is filtered based on the author's role.

## 3. Content Creation (Uploads)

### 3.1. Uploading a Question
*   **Given** a logged-in user on the `/upload` page.
*   **When** the user fills in valid details for a question (Title, Content, Grade, Subject, image if any) and submits.
*   **Then** the question is successfully created.
*   **And** the user is redirected to the new question's detail page.
*   **And** the question appears on the homepage feed for matching filters.

### 3.2. Form Validation on Upload
*   **Given** a logged-in user on the `/upload` page.
*   **When** the user attempts to submit without filling required fields (e.g., missing title or subject).
*   **Then** the submission is blocked.
*   **And** validation error messages are displayed next to the required fields.

### 3.3. Swear Filter Enforcement
*   **Given** a logged-in user.
*   **When** the user attempts to create a post or comment containing blacklisted words (or bypassed versions of them).
*   **Then** the submission is either blocked with a warning message, or the text is automatically sanitized (starred out), depending on the implementation.

## 4. Question Interaction

### 4.1. Answering a Question
*   **Given** a logged-in user on a Question Detail page.
*   **When** the user submits a valid answer.
*   **Then** the answer appears in the comments/answers section.
*   **And** the total comment/answer count increments.

### 4.2. Liking a Post
*   **Given** a logged-in user viewing a post.
*   **When** the user clicks the "Like" button.
*   **Then** the like count increments.
*   **And** the "Like" button changes state to reflect that it is liked by the current user.

### 4.3. Deleting Own Post
*   **Given** a logged-in user (e.g., Student A) who authored a specific question.
*   **When** the user navigates to the Question Detail page.
*   **Then** a "Delete" button is visible.
*   **When** the user clicks delete and confirms.
*   **Then** the post is removed from the database and feed.
*   **And** the user is redirected to the homepage.

### 4.4. Deleting Someone Else's Post (Unauthorized)
*   **Given** a logged-in Student viewing a question authored by another user.
*   **Then** the "Delete" button is NOT visible.
*   **When** the student attempts to force a delete request (e.g., via direct API call).
*   **Then** the request is rejected with a 403 Forbidden error.

### 4.5. Admin/Moderator Deletion (Authorized)
*   **Given** a logged-in Admin or Teacher (if Teachers have mod rights).
*   **When** they view any user's post.
*   **Then** the "Delete" button is visible.
*   **When** they execute the delete action.
*   **Then** the post is successfully deleted.

## 5. User Profiles & Settings

### 5.1. Viewing Own Profile
*   **Given** a logged-in user.
*   **When** the user navigates to `/profile` (or clicks their profile in the sidebar).
*   **Then** their stats (likes, comments, rank), role badge, and authored posts are displayed correctly.

### 5.2. Viewing Another User's Profile
*   **Given** a logged-in user.
*   **When** they navigate to another user's profile page (e.g., `/profile/[userId]`).
*   **Then** they see that user's public stats, role badge, and public posts.
*   **And** they CANNOT see or edit private settings.

### 5.3. Updating Profile Settings
*   **Given** a logged-in user on the `/settings` page.
*   **When** the user updates their Grade, Subject, or avatar and saves.
*   **Then** the data is updated in the database.
*   **And** the new details reflect immediately in the sidebar and profile page.

## 6. Leaderboard

### 6.1. Leaderboard Ranking Display
*   **Given** an application with populated user points/stats.
*   **When** the user navigates to the `/leaderboard` page.
*   **Then** users are displayed in descending order of points.
*   **And** the top 3 users have distinct visual highlighting (e.g., medals/crowns).

### 6.2. Points Accumulation (Integration)
*   **Given** a User A with X points.
*   **When** User A successfully answers a question (or gets a "best answer" / like).
*   **Then** User A's points increase in the database.
*   **And** this increase is reflected on the Leaderboard upon refresh.

---

### How to use these for Automated Testing (Playwright Example)
If you decide to automate these, the structure easily translates to test blocks. For example, scenario **1.1** becomes:

```typescript
test.describe('Authentication', () => {
  test('Successful Student Login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'teststudent@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('.sidebar-role-badge')).toContainText('Öğrenci');
  });
});
```
