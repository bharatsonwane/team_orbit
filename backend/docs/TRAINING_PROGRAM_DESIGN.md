# Training Program Database Design

## Overview
This document outlines the database schema design for a comprehensive training program system similar to Udemy, supporting multiple course types with various content materials.

## Design Principles
- Follow existing tenant migration patterns
- Use enums for fixed content types
- Use `tenant_lookups` for flexible categorization (categories, difficulty levels, etc.)
- Include standard audit fields (createdAt, updatedAt, createdBy, updatedBy, isArchived, etc.)
- Consider partitioning for high-volume tables (user progress, quiz attempts)
- Reference `main.users` for all user relationships

---

## ENUM Types

### 1. `course_status_enum`
```sql
ENUM ('draft', 'published', 'archived', 'suspended')
```

### 2. `content_type_enum`
```sql
ENUM ('video', 'pdf', 'quiz', 'rich_text', 'assignment', 'live_session', 'downloadable_resource')
```

### 3. `enrollment_status_enum`
```sql
ENUM ('enrolled', 'in_progress', 'completed', 'dropped', 'certified')
```

### 4. `quiz_question_type_enum`
```sql
ENUM ('multiple_choice', 'true_false', 'short_answer', 'essay', 'fill_in_blank', 'matching')
```

### 5. `progress_status_enum`
```sql
ENUM ('not_started', 'in_progress', 'completed', 'skipped')
```

### 6. `certificate_status_enum`
```sql
ENUM ('pending', 'issued', 'revoked')
```

---

## Core Tables

### 1. `training_program`
**Purpose**: Main container for training programs (can contain multiple courses)

```sql
CREATE TABLE training_program (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "thumbnailKey" VARCHAR(500), -- S3/storage key for thumbnail image
    "instructorId" INT NOT NULL REFERENCES main.users (id) ON DELETE RESTRICT,
    -- Primary instructor/creator
    "categoryId" INT REFERENCES tenant_lookups (id) ON DELETE SET NULL,
    -- Training category (using tenant_lookups)
    "difficultyLevelId" INT REFERENCES tenant_lookups (id) ON DELETE SET NULL,
    -- Beginner, Intermediate, Advanced (using tenant_lookups)
    "estimatedDuration" INT, -- Total estimated hours
    "isPublished" BOOLEAN DEFAULT FALSE NOT NULL,
    "publishedAt" TIMESTAMP,
    "status" course_status_enum DEFAULT 'draft' NOT NULL,
    "isFree" BOOLEAN DEFAULT FALSE NOT NULL,
    "price" DECIMAL(10, 2), -- If not free
    "currency" VARCHAR(3) DEFAULT 'USD',
    "language" VARCHAR(10) DEFAULT 'en',
    "rating" DECIMAL(3, 2) DEFAULT 0.00, -- Average rating (0-5)
    "totalRatings" INT DEFAULT 0,
    "totalEnrollments" INT DEFAULT 0,
    "totalCompletions" INT DEFAULT 0,
    "sortOrder" INT DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL
);
```

**Indexes:**
- `idx_training_program_instructor` ON ("instructorId", "createdAt" DESC)
- `idx_training_program_category` ON ("categoryId", "createdAt" DESC)
- `idx_training_program_status` ON ("status", "isPublished", "createdAt" DESC)
- `idx_training_program_archived` ON ("isArchived", "archivedAt") WHERE "isArchived" = FALSE

---

### 2. `course`
**Purpose**: Individual courses (can be included in multiple training programs)

```sql
CREATE TABLE course (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "thumbnailKey" VARCHAR(500),
    "instructorId" INT NOT NULL REFERENCES main.users (id) ON DELETE RESTRICT,
    "estimatedDuration" INT, -- Minutes
    "isPublished" BOOLEAN DEFAULT FALSE NOT NULL,
    "publishedAt" TIMESTAMP,
    "status" course_status_enum DEFAULT 'draft' NOT NULL,
    "prerequisiteCourseId" INT REFERENCES course (id) ON DELETE SET NULL,
    -- For course dependencies
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL
);
```

**Indexes:**
- `idx_course_instructor` ON ("instructorId", "createdAt" DESC)
- `idx_course_status` ON ("status", "isPublished", "createdAt" DESC)
- `idx_course_prerequisite` ON ("prerequisiteCourseId")
- `idx_course_archived` ON ("isArchived", "archivedAt") WHERE "isArchived" = FALSE

---

### 3. `training_program_course`
**Purpose**: Many-to-many relationship between training programs and courses

```sql
CREATE TABLE training_program_course (
    id SERIAL PRIMARY KEY,
    "trainingProgramId" INT NOT NULL REFERENCES training_program (id) ON DELETE CASCADE,
    "courseId" INT NOT NULL REFERENCES course (id) ON DELETE CASCADE,
    "sortOrder" INT DEFAULT 0 NOT NULL,
    -- Order of course within this specific program
    "isRequired" BOOLEAN DEFAULT TRUE NOT NULL,
    -- Whether this course is required in the program
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    CONSTRAINT unique_program_course UNIQUE ("trainingProgramId", "courseId")
);
```

**Indexes:**
- `idx_program_course_program` ON ("trainingProgramId", "sortOrder")
- `idx_program_course_course` ON ("courseId", "createdAt" DESC)

---

### 4. `course_section`
**Purpose**: Sections within a course to organize content items

```sql
CREATE TABLE course_section (
    id SERIAL PRIMARY KEY,
    "courseId" INT NOT NULL REFERENCES course (id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "sortOrder" INT DEFAULT 0 NOT NULL,
    "isPublished" BOOLEAN DEFAULT FALSE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL
);
```

**Indexes:**
- `idx_course_section_course` ON ("courseId", "sortOrder")
- `idx_course_section_archived` ON ("isArchived", "archivedAt") WHERE "isArchived" = FALSE

---

### 5. `course_content`
**Purpose**: Individual content items within a course section (videos, PDFs, quizzes, etc.)

```sql
CREATE TABLE course_content (
    id SERIAL PRIMARY KEY,
    "sectionId" INT NOT NULL REFERENCES course_section (id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "contentType" content_type_enum NOT NULL,
    "sortOrder" INT DEFAULT 0 NOT NULL,
    "isPublished" BOOLEAN DEFAULT FALSE NOT NULL,
    "isPreview" BOOLEAN DEFAULT FALSE NOT NULL,
    -- Free preview content
    "estimatedDuration" INT, -- Minutes (for videos, reading time, etc.)
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL
);
```

**Indexes:**
- `idx_course_content_section` ON ("sectionId", "sortOrder")
- `idx_course_content_type` ON ("contentType", "isPublished")
- `idx_course_content_archived` ON ("isArchived", "archivedAt") WHERE "isArchived" = FALSE

---

### 6. `course_content_detail`
**Purpose**: Type-specific details for each content item (polymorphic approach)

```sql
CREATE TABLE course_content_detail (
    id SERIAL PRIMARY KEY,
    "contentId" INT NOT NULL REFERENCES course_content (id) ON DELETE CASCADE,
    "contentType" content_type_enum NOT NULL,
    -- Redundant but useful for queries
    
    -- Video-specific fields
    "videoUrl" VARCHAR(500),
    "videoKey" VARCHAR(500), -- S3/storage key
    "thumbnailKey" VARCHAR(500),
    "transcript" TEXT,
    "subtitleUrl" VARCHAR(500),
    "videoDuration" INT, -- Seconds
    
    -- PDF/Document-specific fields
    "documentUrl" VARCHAR(500),
    "documentKey" VARCHAR(500),
    "pageCount" INT,
    
    -- Rich Text fields
    "richTextContent" TEXT, -- HTML/JSON content
    
    -- Quiz reference (if contentType = 'quiz')
    "quizId" INT, -- References quiz table
    
    -- Assignment fields
    "assignmentInstructions" TEXT,
    "maxScore" DECIMAL(10, 2),
    "passingScore" DECIMAL(10, 2),
    "dueDate" TIMESTAMP,
    
    -- Live Session fields
    "sessionUrl" VARCHAR(500),
    "scheduledAt" TIMESTAMP,
    "duration" INT, -- Minutes
    
    -- Downloadable Resource fields
    "resourceUrl" VARCHAR(500),
    "resourceKey" VARCHAR(500),
    "fileSize" BIGINT,
    "mimeType" VARCHAR(100),
    
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    CONSTRAINT unique_content_detail UNIQUE ("contentId")
);
```

**Indexes:**
- `idx_content_detail_content` ON ("contentId")
- `idx_content_detail_type` ON ("contentType")
- `idx_content_detail_quiz` ON ("quizId") WHERE "quizId" IS NOT NULL

---

### 7. `quiz`
**Purpose**: Quiz container (referenced by course_content when contentType = 'quiz')

```sql
CREATE TABLE quiz (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "timeLimit" INT, -- Minutes (NULL = no limit)
    "passingScore" DECIMAL(5, 2) DEFAULT 60.00 NOT NULL,
    -- Percentage required to pass
    "maxAttempts" INT, -- NULL = unlimited
    "isRandomized" BOOLEAN DEFAULT FALSE NOT NULL,
    -- Randomize question order
    "showCorrectAnswers" BOOLEAN DEFAULT TRUE NOT NULL,
    "showResultsImmediately" BOOLEAN DEFAULT TRUE NOT NULL,
    "allowReview" BOOLEAN DEFAULT TRUE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL
);
```

---

### 8. `quiz_question`
**Purpose**: Questions within a quiz

```sql
CREATE TABLE quiz_question (
    id SERIAL PRIMARY KEY,
    "quizId" INT NOT NULL REFERENCES quiz (id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    "questionType" quiz_question_type_enum NOT NULL,
    "points" DECIMAL(5, 2) DEFAULT 1.00 NOT NULL,
    "sortOrder" INT DEFAULT 0 NOT NULL,
    "explanation" TEXT,
    -- Explanation shown after answering
    "isRequired" BOOLEAN DEFAULT TRUE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL
);
```

**Indexes:**
- `idx_quiz_question_quiz` ON ("quizId", "sortOrder")
- `idx_quiz_question_type` ON ("questionType")

---

### 9. `quiz_question_option`
**Purpose**: Answer options for quiz questions (for multiple choice, true/false, matching)

```sql
CREATE TABLE quiz_question_option (
    id SERIAL PRIMARY KEY,
    "questionId" INT NOT NULL REFERENCES quiz_question (id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    "isCorrect" BOOLEAN DEFAULT FALSE NOT NULL,
    "sortOrder" INT DEFAULT 0 NOT NULL,
    "imageKey" VARCHAR(500),
    -- For image-based options
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL
);
```

**Indexes:**
- `idx_quiz_option_question` ON ("questionId", "sortOrder")

---

### 10. `training_program_enrollment`
**Purpose**: User enrollments in training programs

```sql
CREATE TABLE training_program_enrollment (
    id SERIAL PRIMARY KEY,
    "trainingProgramId" INT NOT NULL REFERENCES training_program (id) ON DELETE CASCADE,
    "userId" INT NOT NULL REFERENCES main.users (id) ON DELETE CASCADE,
    "status" enrollment_status_enum DEFAULT 'enrolled' NOT NULL,
    "enrolledAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "startedAt" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "progressPercentage" DECIMAL(5, 2) DEFAULT 0.00 NOT NULL,
    -- Overall progress (0-100)
    "lastAccessedAt" TIMESTAMP,
    "certificateId" INT,
    -- References certificate table if certified
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    CONSTRAINT unique_program_user_enrollment UNIQUE ("trainingProgramId", "userId")
);
```

**Indexes:**
- `idx_enrollment_program` ON ("trainingProgramId", "status", "enrolledAt" DESC)
- `idx_enrollment_user` ON ("userId", "status", "enrolledAt" DESC)
- `idx_enrollment_status` ON ("status", "completedAt")

---

### 11. `course_content_progress` (Partition Ready)
**Purpose**: Track user progress for each content item

```sql
CREATE TABLE course_content_progress (
    id BIGSERIAL,
    "contentId" INT NOT NULL REFERENCES course_content (id) ON DELETE CASCADE,
    "userId" INT NOT NULL REFERENCES main.users (id) ON DELETE CASCADE,
    "status" progress_status_enum DEFAULT 'not_started' NOT NULL,
    "progressPercentage" DECIMAL(5, 2) DEFAULT 0.00 NOT NULL,
    -- For videos: watch time percentage
    "timeSpent" INT DEFAULT 0 NOT NULL,
    -- Total seconds spent
    "lastPosition" INT DEFAULT 0,
    -- For videos: last watched position in seconds
    "startedAt" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    PRIMARY KEY (id, "createdAt"),
    CONSTRAINT unique_content_user_progress UNIQUE ("contentId", "userId")
) PARTITION BY RANGE ("createdAt");
```

**Indexes:**
- `idx_content_progress_content` ON ("contentId", "userId")
- `idx_content_progress_user` ON ("userId", "status", "createdAt" DESC)
- `idx_content_progress_status` ON ("status", "completedAt")

---

### 12. `quiz_attempt` (Partition Ready)
**Purpose**: User quiz attempts

```sql
CREATE TABLE quiz_attempt (
    id BIGSERIAL,
    "quizId" INT NOT NULL REFERENCES quiz (id) ON DELETE CASCADE,
    "userId" INT NOT NULL REFERENCES main.users (id) ON DELETE CASCADE,
    "attemptNumber" INT DEFAULT 1 NOT NULL,
    "score" DECIMAL(5, 2),
    -- Percentage score
    "totalPoints" DECIMAL(10, 2),
    "earnedPoints" DECIMAL(10, 2),
    "isPassed" BOOLEAN,
    "startedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "submittedAt" TIMESTAMP,
    "timeSpent" INT,
    -- Seconds spent
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    PRIMARY KEY (id, "createdAt"),
    CONSTRAINT unique_quiz_user_attempt UNIQUE ("quizId", "userId", "attemptNumber")
) PARTITION BY RANGE ("createdAt");
```

**Indexes:**
- `idx_quiz_attempt_quiz` ON ("quizId", "userId", "attemptNumber")
- `idx_quiz_attempt_user` ON ("userId", "submittedAt" DESC)
- `idx_quiz_attempt_passed` ON ("isPassed", "submittedAt")

---

### 13. `quiz_attempt_answer` (Partition Ready)
**Purpose**: User answers for quiz questions in each attempt

```sql
CREATE TABLE quiz_attempt_answer (
    id BIGSERIAL,
    "attemptId" BIGINT NOT NULL,
    "attemptCreatedAt" TIMESTAMP NOT NULL,
    "questionId" INT NOT NULL REFERENCES quiz_question (id) ON DELETE CASCADE,
    "selectedOptionId" INT REFERENCES quiz_question_option (id) ON DELETE SET NULL,
    -- For multiple choice, true/false
    "textAnswer" TEXT,
    -- For short answer, essay, fill in blank
    "isCorrect" BOOLEAN,
    "pointsEarned" DECIMAL(5, 2) DEFAULT 0.00,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    PRIMARY KEY (id, "createdAt"),
    CONSTRAINT fk_quiz_attempt_answer_attempt FOREIGN KEY ("attemptId", "attemptCreatedAt") REFERENCES quiz_attempt (id, "createdAt") ON DELETE CASCADE,
    CONSTRAINT unique_attempt_question_answer UNIQUE ("attemptId", "attemptCreatedAt", "questionId")
) PARTITION BY RANGE ("createdAt");
```

**Indexes:**
- `idx_attempt_answer_attempt` ON ("attemptId", "attemptCreatedAt", "questionId")
- `idx_attempt_answer_question` ON ("questionId", "isCorrect")

---

### 14. `assignment_submission` (Partition Ready)
**Purpose**: User assignment submissions

```sql
CREATE TABLE assignment_submission (
    id BIGSERIAL,
    "contentId" INT NOT NULL REFERENCES course_content (id) ON DELETE CASCADE,
    "userId" INT NOT NULL REFERENCES main.users (id) ON DELETE CASCADE,
    "submissionText" TEXT,
    "submissionFileKey" VARCHAR(500),
    -- S3/storage key for uploaded file
    "submittedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "gradedAt" TIMESTAMP,
    "gradedBy" INT REFERENCES main.users (id) ON DELETE SET NULL,
    "score" DECIMAL(10, 2),
    "maxScore" DECIMAL(10, 2),
    "feedback" TEXT,
    "status" VARCHAR(50) DEFAULT 'submitted',
    -- 'submitted', 'graded', 'returned', 'resubmitted'
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    PRIMARY KEY (id, "createdAt"),
    CONSTRAINT unique_content_user_submission UNIQUE ("contentId", "userId")
) PARTITION BY RANGE ("createdAt");
```

**Indexes:**
- `idx_assignment_submission_content` ON ("contentId", "submittedAt" DESC)
- `idx_assignment_submission_user` ON ("userId", "submittedAt" DESC)
- `idx_assignment_submission_status` ON ("status", "gradedAt")

---

### 15. `training_program_rating`
**Purpose**: User ratings and reviews for training programs

```sql
CREATE TABLE training_program_rating (
    id SERIAL PRIMARY KEY,
    "trainingProgramId" INT NOT NULL REFERENCES training_program (id) ON DELETE CASCADE,
    "userId" INT NOT NULL REFERENCES main.users (id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    "isVerified" BOOLEAN DEFAULT FALSE NOT NULL,
    -- Verified purchase/enrollment
    "helpfulCount" INT DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    CONSTRAINT unique_program_user_rating UNIQUE ("trainingProgramId", "userId")
);
```

**Indexes:**
- `idx_program_rating_program` ON ("trainingProgramId", "rating", "createdAt" DESC)
- `idx_program_rating_user` ON ("userId", "createdAt" DESC)

---

### 16. `certificate`
**Purpose**: Certificates issued upon program completion

```sql
CREATE TABLE certificate (
    id SERIAL PRIMARY KEY,
    "trainingProgramId" INT NOT NULL REFERENCES training_program (id) ON DELETE CASCADE,
    "userId" INT NOT NULL REFERENCES main.users (id) ON DELETE CASCADE,
    "enrollmentId" INT NOT NULL REFERENCES training_program_enrollment (id) ON DELETE CASCADE,
    "certificateNumber" VARCHAR(100) UNIQUE NOT NULL,
    -- Unique certificate identifier
    "certificateUrl" VARCHAR(500),
    -- URL to generated certificate PDF/image
    "certificateKey" VARCHAR(500),
    -- S3/storage key
    "issuedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "issuedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "status" certificate_status_enum DEFAULT 'issued' NOT NULL,
    "revokedAt" TIMESTAMP,
    "revokedBy" INT REFERENCES main.users (id) ON DELETE SET NULL,
    "revocationReason" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    CONSTRAINT unique_program_user_certificate UNIQUE ("trainingProgramId", "userId")
);
```

**Indexes:**
- `idx_certificate_program` ON ("trainingProgramId", "issuedAt" DESC)
- `idx_certificate_user` ON ("userId", "issuedAt" DESC)
- `idx_certificate_status` ON ("status", "issuedAt")
- `idx_certificate_number` ON ("certificateNumber")

---

## Supporting Tables

### 17. `training_program_instructor`
**Purpose**: Many-to-many relationship for multiple instructors per program

```sql
CREATE TABLE training_program_instructor (
    id SERIAL PRIMARY KEY,
    "trainingProgramId" INT NOT NULL REFERENCES training_program (id) ON DELETE CASCADE,
    "instructorId" INT NOT NULL REFERENCES main.users (id) ON DELETE CASCADE,
    "isPrimary" BOOLEAN DEFAULT FALSE NOT NULL,
    "sortOrder" INT DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    CONSTRAINT unique_program_instructor UNIQUE ("trainingProgramId", "instructorId")
);
```

---

### 18. `training_program_tag`
**Purpose**: Tags for training programs (using tenant_lookups)

```sql
CREATE TABLE training_program_tag (
    id SERIAL PRIMARY KEY,
    "trainingProgramId" INT NOT NULL REFERENCES training_program (id) ON DELETE CASCADE,
    "tagId" INT NOT NULL REFERENCES tenant_lookups (id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    CONSTRAINT unique_program_tag UNIQUE ("trainingProgramId", "tagId")
);
```

---

### 19. `training_program_prerequisite`
**Purpose**: Define prerequisite programs/courses

```sql
CREATE TABLE training_program_prerequisite (
    id SERIAL PRIMARY KEY,
    "trainingProgramId" INT NOT NULL REFERENCES training_program (id) ON DELETE CASCADE,
    "prerequisiteProgramId" INT NOT NULL REFERENCES training_program (id) ON DELETE CASCADE,
    "isRequired" BOOLEAN DEFAULT TRUE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    CONSTRAINT unique_program_prerequisite UNIQUE ("trainingProgramId", "prerequisiteProgramId"),
    CONSTRAINT check_no_self_prerequisite CHECK ("trainingProgramId" != "prerequisiteProgramId")
);
```

---

## Partitioning Strategy

### Tables to Partition:
1. **`course_content_progress`** - High volume, time-based queries
2. **`quiz_attempt`** - High volume, time-based queries
3. **`quiz_attempt_answer`** - High volume, time-based queries
4. **`assignment_submission`** - Medium volume, time-based queries

### Partition Function Pattern:
Similar to `chat_message` and `post` tables:
- Monthly partitions based on `createdAt`
- DEFAULT partition with redirect trigger for auto-creation
- Helper functions: `create_*_partition()`, `prepare_*_partitions()`

---

## Lookup Types (using tenant_lookups)

### Suggested Lookup Types:
1. **TRAINING_CATEGORY** - Categories (e.g., "Web Development", "Data Science", "Design")
2. **DIFFICULTY_LEVEL** - Difficulty levels (e.g., "Beginner", "Intermediate", "Advanced")
3. **TRAINING_TAG** - Flexible tags for programs
4. **LANGUAGE** - Course languages (if needed beyond enum)

---

## Key Relationships

```
training_program (N) ──→ (N) course (via training_program_course)
course (1) ──→ (N) course_section
course_section (1) ──→ (N) course_content
course_content (1) ──→ (1) course_content_detail
course_content_detail (N) ──→ (0..1) quiz

training_program (1) ──→ (N) training_program_enrollment
training_program_enrollment (1) ──→ (0..1) certificate

course_content (1) ──→ (N) course_content_progress
quiz (1) ──→ (N) quiz_attempt
quiz_attempt (1) ──→ (N) quiz_attempt_answer

training_program (N) ──→ (N) main.users (instructors via training_program_instructor)
training_program_enrollment (N) ──→ (1) main.users (students)
```

---

## Notes

1. **Many-to-Many Program-Course Relationship**: Courses can be included in multiple training programs through the `training_program_course` junction table. This allows courses to be reused across different programs. The `sortOrder` in the junction table determines the course sequence within each specific program, and `isRequired` indicates whether the course is mandatory for that program.

2. **Course Sections**: Courses are organized into sections (similar to Udemy's structure). Each course can have multiple sections, and each section contains multiple content items. This hierarchical organization helps structure course materials logically (e.g., "Introduction", "Core Concepts", "Advanced Topics", "Projects"). The `course_section` table provides flexibility to organize content and allows instructors to group related materials together.

3. **Content Type Flexibility**: The `course_content_detail` table uses a polymorphic approach with nullable fields for different content types. This allows easy extension without schema changes.

4. **Progress Tracking**: `course_content_progress` tracks granular progress (percentage, time spent, last position) for each content item.

5. **Quiz System**: Supports multiple question types, multiple attempts, and detailed answer tracking.

6. **Certificates**: Can be issued, revoked, and tracked with unique certificate numbers.

7. **Partitioning**: High-volume tables are partitioned by month for performance and scalability.

8. **Flexible Categorization**: Uses `tenant_lookups` for categories, tags, and difficulty levels, allowing tenant-specific customization.

9. **Audit Trail**: All tables include standard audit fields for tracking changes and soft deletion.

---

## Migration File Structure

Suggested migration files:
- `007-tenant-training-program-tables.do.sql` - Core tables and enums
- `008-tenant-training-program-partitions.do.sql` - Partition functions and triggers

---

## Future Considerations

1. **Discussion/Forum**: Add `training_program_discussion` and `discussion_reply` tables
2. **Notifications**: Track training-related notifications
3. **Analytics**: Add analytics tables for tracking views, engagement
4. **Bulk Operations**: Support for bulk enrollment, assignment grading
5. **Learning Paths**: Add `learning_path` table to group multiple programs
6. **Badges/Achievements**: Add gamification elements

