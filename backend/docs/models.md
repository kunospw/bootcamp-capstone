# Database Models Documentation

This document describes the database models used in the Capstone Kada job portal application.

## User Model

The User model represents job seekers in the platform.

### Schema Fields

#### Personal Information
- **fullName** (String, required)
  - Maximum length: 100 characters
  - Trimmed automatically
  - Validation: Required field

- **email** (String, required, unique)
  - Automatically converted to lowercase
  - Trimmed automatically
  - Validation: Must be a valid email format
  - Index: Unique constraint

- **password** (String, required)
  - Minimum length: 6 characters
  - Hidden by default (select: false)
  - Encrypted before saving using bcrypt

- **phoneNumber** (String, optional)
  - Maximum length: 20 characters
  - Trimmed automatically

- **profilePicture** (String)
  - Default: Empty string
  - Stores file path or URL

- **bio** (String, optional)
  - Maximum length: 500 characters
  - Personal bio/description

#### Personal Details
- **birthDate** (Date, optional)
  - User's date of birth

- **gender** (String, optional)
  - Enum values: 'male', 'female', 'prefer-not-to-say'
  - Default: 'prefer-not-to-say'

- **domicile** (String, optional)
  - User's current location/residence
  - Trimmed automatically

- **personalSummary** (String, optional)
  - Maximum length: 1000 characters
  - Professional summary or career objective

#### Skills and Experience
- **skills** (Array of Strings)
  - List of user's skills
  - Each skill is trimmed automatically

- **experience** (Array of Objects)
  - **company** (String, required): Company name
  - **position** (String, required): Job position/title
  - **startDate** (Date, required): Employment start date
  - **endDate** (Date, optional): Employment end date
  - **current** (Boolean): Currently employed here (default: false)
  - **description** (String): Job description (max 500 characters)

- **education** (Array of Objects)
  - **institution** (String, required): Educational institution name
  - **degree** (String, required): Degree or qualification obtained
  - **fieldOfStudy** (String, optional): Field of study or major
  - **startDate** (Date, required): Education start date
  - **endDate** (Date, optional): Education end date
  - **current** (Boolean): Currently studying (default: false)
  - **grade** (String, optional): Grade or GPA achieved

#### Job Management
- **savedJobs** (Array of ObjectIds)
  - References to Job documents
  - Jobs bookmarked by the user

#### Account Management
- **isActive** (Boolean)
  - Default: true
  - Account status

- **lastLogin** (Date, optional)
  - Timestamp of last successful login

- **emailVerified** (Boolean)
  - Default: false
  - Email verification status

- **emailVerificationToken** (String, optional)
  - Token for email verification

- **passwordResetToken** (String, optional)
  - Token for password reset

- **passwordResetExpire** (Date, optional)
  - Expiration date for password reset token

#### Timestamps
- **createdAt** (Date)
  - Automatically generated on document creation

- **updatedAt** (Date)
  - Automatically updated on document modification

### Methods

#### matchPassword(enteredPassword)
- **Purpose**: Compare entered password with stored hashed password
- **Parameters**: 
  - `enteredPassword` (String): Plain text password to verify
- **Returns**: Promise<Boolean> - true if passwords match
- **Usage**: Used during authentication

#### updateLastLogin()
- **Purpose**: Update the user's last login timestamp
- **Returns**: Promise - saves the updated document
- **Usage**: Called after successful authentication

### Pre-save Middleware
- **Password Encryption**: Automatically hashes passwords using bcrypt before saving
- **Salt Rounds**: 10 (configured in pre-save hook)

---

## Company Model

The Company model represents employers/organizations in the platform.

### Schema Fields

#### Company Information
- **companyName** (String, required)
  - Maximum length: 200 characters
  - Trimmed automatically
  - Validation: Required field

- **email** (String, required, unique)
  - Automatically converted to lowercase
  - Trimmed automatically
  - Validation: Must be a valid email format
  - Index: Unique constraint

- **phoneNumber** (String, optional)
  - Maximum length: 20 characters
  - Trimmed automatically

- **password** (String, required)
  - Minimum length: 6 characters
  - Hidden by default (select: false)
  - Encrypted before saving using bcrypt

#### Company Profile
- **profilePicture** (String)
  - Default: Empty string
  - Company logo/profile picture

- **bannerPicture** (String, optional)
  - Company banner/cover image

- **website** (String, optional)
  - Company website URL
  - Validation: Must be a valid HTTP/HTTPS URL

- **industry** (String, optional)
  - Company's industry sector

- **mainLocation** (String, optional)
  - Company's primary location/headquarters

- **description** (String, optional)
  - Company description and overview

#### Verification System
- **credentialFile** (String, optional)
  - Path to uploaded credential/verification document

- **credentialStatus** (String)
  - Enum values: 'pending', 'approved', 'rejected'
  - Default: 'pending'
  - Company verification status

- **credentialReviewDate** (Date, optional)
  - Date when credentials were last reviewed

- **adminNotes** (String, optional)
  - Administrative notes regarding verification

### Methods
*Note: Methods need to be implemented for password hashing and matching similar to User model*

---

## Placeholder Models

### Job Model *(To be implemented)*

```javascript
// Expected fields:
- title (String, required)
- description (String, required)
- requirements (Array of Strings)
- salary (Object with min/max)
- location (String)
- jobType (enum: full-time, part-time, contract, internship)
- experienceLevel (enum: entry, mid, senior)
- company (ObjectId, ref: 'Company')
- applications (Array of ObjectIds, ref: 'Application')
- isActive (Boolean, default: true)
- deadline (Date)
- createdAt/updatedAt (timestamps)
```

### Application Model *(To be implemented)*

```javascript
// Expected fields:
- user (ObjectId, ref: 'User', required)
- job (ObjectId, ref: 'Job', required)
- company (ObjectId, ref: 'Company', required)
- status (enum: pending, reviewed, accepted, rejected)
- coverLetter (String)
- resume (String) // file path
- appliedAt (Date, default: now)
- reviewedAt (Date)
- notes (String) // recruiter notes
```

### Admin Model *(To be implemented)*

```javascript
// Expected fields:
- username (String, required, unique)
- email (String, required, unique)
- password (String, required)
- role (enum: super-admin, admin, moderator)
- permissions (Array of Strings)
- isActive (Boolean, default: true)
- lastLogin (Date)
- createdAt/updatedAt (timestamps)
```

### Notification Model *(To be implemented)*

```javascript
// Expected fields:
- recipient (ObjectId, refPath: 'recipientType')
- recipientType (String, enum: ['User', 'Company'])
- type (enum: application-status, job-match, system)
- title (String, required)
- message (String, required)
- isRead (Boolean, default: false)
- data (Mixed) // additional data
- createdAt (Date, default: now)
```

---

## Model Relationships

### User ↔ Job
- Users can save jobs (User.savedJobs → Job._id)
- Users can apply to jobs through Application model

### Company ↔ Job
- Companies create jobs (Job.company → Company._id)
- One-to-many relationship

### User ↔ Application ↔ Job ↔ Company
- Applications link users to specific jobs
- Forms a many-to-many relationship between Users and Jobs
- Applications belong to both User and Company for tracking

### Future Considerations
- **Indexing**: Add database indexes for frequently queried fields
- **Validation**: Add custom validators for complex business rules
- **Middleware**: Implement additional pre/post hooks for data consistency
- **Virtuals**: Add computed fields for derived data
- **Population**: Configure default population for referenced documents
