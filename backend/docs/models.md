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
  - Trimmed automatically

- **industry** (String, optional)
  - Maximum length: 100 characters
  - Company's industry sector
  - Trimmed automatically

- **mainLocation** (String, optional)
  - Maximum length: 200 characters
  - Company's primary location/headquarters
  - Trimmed automatically

- **description** (String, optional)
  - Maximum length: 2000 characters
  - Company description and overview

#### Account Management
- **lastLogin** (Date, optional)
  - Timestamp of last successful login

#### Timestamps
- **createdAt** (Date)
  - Automatically generated on document creation

- **updatedAt** (Date)
  - Automatically updated on document modification

### Virtual Fields
- **jobsCount** (Number)
  - Virtual field that counts the number of jobs posted by this company
  - References Job model where companyId matches this company's _id

### Methods

#### matchPassword(enteredPassword)
- **Purpose**: Compare entered password with stored hashed password
- **Parameters**: 
  - `enteredPassword` (String): Plain text password to verify
- **Returns**: Promise<Boolean> - true if passwords match
- **Usage**: Used during authentication

#### updateLastLogin()
- **Purpose**: Update the company's last login timestamp
- **Returns**: Promise - saves the updated document with validateBeforeSave: false
- **Usage**: Called after successful authentication

### Pre-save Middleware
- **Password Encryption**: Automatically hashes passwords using bcrypt before saving
- **Salt Rounds**: 10 (configured in pre-save hook)

---

## Job Model

The Job model represents job postings in the platform.

### Schema Fields

#### Basic Job Information
- **title** (String, required)
  - Maximum length: 200 characters
  - Trimmed automatically
  - Validation: Required field

- **major** (String, required)
  - Maximum length: 100 characters
  - Job major/field of study
  - Trimmed automatically

- **type** (String, required)
  - Enum values: 'full-time', 'part-time', 'contract', 'internship', 'freelance'
  - Default: 'full-time'

- **workLocation** (String, required)
  - Enum values: 'onsite', 'remote', 'hybrid'
  - Default: 'onsite'

- **location** (String, required)
  - Maximum length: 200 characters
  - Physical job location
  - Trimmed automatically

#### Salary Information
- **salary** (Object)
  - **min** (Number): Minimum salary (cannot be negative)
  - **max** (Number): Maximum salary (cannot be negative)
  - **currency** (String): Enum values: 'USD', 'IDR', 'SGD', 'MYR', 'PHP', 'THB' (default: 'USD')
  - **period** (String): Enum values: 'hourly', 'monthly', 'yearly' (default: 'monthly')

#### Job Details
- **description** (String, required)
  - Maximum length: 5000 characters
  - Detailed job description

- **requirements** (Array of Strings, required)
  - Job requirements
  - Each requirement is trimmed automatically

- **responsibilities** (Array of Strings, required)
  - Job responsibilities
  - Each responsibility is trimmed automatically

- **skills** (Array of Strings)
  - Required or preferred skills
  - Each skill is trimmed automatically

- **benefits** (Array of Strings)
  - Job benefits and perks
  - Each benefit is trimmed automatically

- **experienceLevel** (String, required)
  - Enum values: 'entry', 'mid', 'senior', 'lead', 'executive'

#### References
- **category** (ObjectId, required)
  - Reference to Category model
  - Job category classification

- **companyId** (ObjectId, required)
  - Reference to Company model
  - Company posting the job

#### Dates and Status
- **datePosted** (Date)
  - Default: Current date/time
  - When the job was posted

- **applicationDeadline** (Date, optional)
  - Application deadline
  - Validation: Must be in the future

- **isActive** (Boolean)
  - Default: true
  - Job posting status

- **isFeatured** (Boolean)
  - Default: false
  - Featured job status

#### Metrics
- **views** (Number)
  - Default: 0
  - Number of times job was viewed

- **applicationsCount** (Number)
  - Default: 0
  - Number of applications received

#### Additional Information
- **tags** (Array of Strings)
  - Job tags for categorization
  - Each tag is trimmed automatically

- **contactEmail** (String, optional)
  - Contact email for applications
  - Validation: Must be valid email format
  - Trimmed automatically

- **contactPhone** (String, optional)
  - Maximum length: 20 characters
  - Contact phone number
  - Trimmed automatically

#### Timestamps
- **createdAt** (Date)
  - Automatically generated on document creation

- **updatedAt** (Date)
  - Automatically updated on document modification

### Indexes
- **Text Index**: title, description, major (for text search)
- **Single Field Indexes**: location, type, workLocation, experienceLevel, datePosted, isActive, companyId, category

### Virtual Fields
- **applications** (Array)
  - Virtual field that populates applications for this job
  - References Application model where jobId matches this job's _id

### Methods

#### incrementViews()
- **Purpose**: Increment the view count for the job
- **Returns**: Promise - saves the updated document
- **Usage**: Called when job is viewed

#### incrementApplications()
- **Purpose**: Increment the applications count for the job
- **Returns**: Promise - saves the updated document
- **Usage**: Called when someone applies to the job

#### isExpired()
- **Purpose**: Check if the job application deadline has passed
- **Returns**: Boolean - true if expired
- **Usage**: Used to determine if applications are still accepted

### Pre-save Middleware
- **Salary Validation**: Ensures minimum salary is not greater than maximum salary

---

## Category Model

The Category model represents job categories and filters in the platform.

### Schema Fields

#### Category Information
- **categoryName** (String, required, unique)
  - Maximum length: 100 characters
  - Trimmed automatically
  - Unique constraint

- **categoryType** (String, required)
  - Enum values: 'major', 'type', 'workLocation', 'location'
  - Default: 'major'
  - Defines the type of category

- **description** (String, optional)
  - Maximum length: 500 characters
  - Category description
  - Trimmed automatically

- **isActive** (Boolean)
  - Default: true
  - Category status

#### Timestamps
- **createdAt** (Date)
  - Automatically generated on document creation

- **updatedAt** (Date)
  - Automatically updated on document modification

### Static Methods

#### getMajors()
- **Purpose**: Get all active major categories
- **Returns**: Promise<Array> - sorted by categoryName
- **Usage**: Used for filtering jobs by major

#### getTypes()
- **Purpose**: Get all active type categories
- **Returns**: Promise<Array> - sorted by categoryName
- **Usage**: Used for filtering jobs by type

#### getLocations()
- **Purpose**: Get all active location categories
- **Returns**: Promise<Array> - sorted by categoryName
- **Usage**: Used for filtering jobs by location

#### getWorkLocations()
- **Purpose**: Get all active work location categories
- **Returns**: Promise<Array> - sorted by categoryName
- **Usage**: Used for filtering jobs by work location type

---

## SavedJob Model

The SavedJob model represents jobs bookmarked by users.

### Schema Fields

#### References
- **userId** (ObjectId, required)
  - Reference to User model
  - User who saved the job

- **jobId** (ObjectId, required)
  - Reference to Job model
  - The saved job

#### User Annotations
- **note** (String, optional)
  - Maximum length: 500 characters
  - User's personal note about the job
  - Trimmed automatically

- **tags** (Array of Strings)
  - User-defined tags for organization
  - Maximum length per tag: 50 characters
  - Each tag is trimmed automatically

- **priority** (String)
  - Enum values: 'low', 'medium', 'high'
  - Default: 'medium'
  - User-defined priority level

- **reminderDate** (Date, optional)
  - Optional reminder date set by user

#### Status and Dates
- **dateSaved** (Date)
  - Default: Current date/time
  - When the job was saved

- **isActive** (Boolean)
  - Default: true
  - Saved job status

#### Timestamps
- **createdAt** (Date)
  - Automatically generated on document creation

- **updatedAt** (Date)
  - Automatically updated on document modification

### Indexes
- **Compound Unique Index**: userId + jobId (prevents duplicate saves)
- **Compound Index**: userId + isActive
- **Single Field Indexes**: dateSaved, priority, reminderDate

### Virtual Fields
- **job** (Object)
  - Virtual field that populates the saved job details
  - References Job model

### Methods

#### updateNote(note)
- **Purpose**: Update the user's note for the saved job
- **Parameters**: `note` (String): New note text
- **Returns**: Promise - saves the updated document

#### addTag(tag)
- **Purpose**: Add a tag to the saved job (prevents duplicates)
- **Parameters**: `tag` (String): Tag to add
- **Returns**: Promise - saves if tag was added, otherwise returns unchanged document

#### removeTag(tag)
- **Purpose**: Remove a specific tag from the saved job
- **Parameters**: `tag` (String): Tag to remove
- **Returns**: Promise - saves the updated document

#### setReminder(date)
- **Purpose**: Set a reminder date for the saved job
- **Parameters**: `date` (Date): Reminder date
- **Returns**: Promise - saves the updated document

### Static Methods

#### getSavedJobsByUser(userId, filters)
- **Purpose**: Get saved jobs for a user with optional filters
- **Parameters**: 
  - `userId` (ObjectId): User ID
  - `filters` (Object): Optional filters (priority, tags, hasReminder)
- **Returns**: Promise<Array> - saved jobs with populated job details, sorted by dateSaved (newest first)

---

## Application Model

The Application model represents job applications submitted by users.

### Schema Fields

#### References
- **userId** (ObjectId, required)
  - Reference to User model
  - User who submitted the application

- **jobId** (ObjectId, required)
  - Reference to Job model
  - Job being applied for

#### Personal Information
- **fullName** (String, required)
  - Maximum length: 100 characters
  - Applicant's full name
  - Trimmed automatically

- **domicile** (String, required)
  - Maximum length: 200 characters
  - Applicant's residence location
  - Trimmed automatically

- **phoneNumber** (String, required)
  - Maximum length: 20 characters
  - Contact phone number
  - Trimmed automatically

- **email** (String, required)
  - Contact email address
  - Validation: Must be valid email format
  - Trimmed automatically

#### Application Documents
- **resume** (String, required)
  - Path to uploaded resume file

- **coverLetter** (String, optional)
  - Maximum length: 2000 characters
  - Cover letter text

- **personalStatement** (String, optional)
  - Maximum length: 1000 characters
  - Personal statement or motivation letter

#### Application Status
- **applicationDate** (Date)
  - Default: Current date/time
  - When application was submitted

- **status** (String)
  - Enum values: 'pending', 'reviewing', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn'
  - Default: 'pending'
  - Current application status

- **statusHistory** (Array of Objects)
  - **status** (String, required): Status value
  - **date** (Date): When status was set (default: current time)
  - **note** (String): Optional note about status change (max 500 characters)
  - **updatedBy** (ObjectId): Reference to Company who updated status

#### Company Management
- **companyNotes** (Array of Objects)
  - **note** (String, required): Note content (max 1000 characters)
  - **createdBy** (ObjectId, required): Reference to Company who created note
  - **createdAt** (Date): When note was created (default: current time)

#### Interview Information
- **interviewDetails** (Object)
  - **scheduledDate** (Date): Interview date/time
  - **location** (String): Interview location (trimmed)
  - **type** (String): Enum values: 'phone', 'video', 'onsite', 'online' (default: 'onsite')
  - **notes** (String): Interview notes (max 1000 characters)

#### Compensation and Availability
- **expectedSalary** (Object)
  - **amount** (Number): Expected salary amount (cannot be negative)
  - **currency** (String): Enum values: 'USD', 'IDR', 'SGD', 'MYR', 'PHP', 'THB' (default: 'USD')
  - **period** (String): Enum values: 'hourly', 'monthly', 'yearly' (default: 'monthly')

- **availableStartDate** (Date, optional)
  - When applicant can start working

#### Additional Documents
- **additionalDocuments** (Array of Objects)
  - **name** (String, required): Document name (trimmed)
  - **url** (String, required): Document file path/URL
  - **type** (String): Enum values: 'portfolio', 'certificate', 'recommendation', 'other' (default: 'other')

#### Timestamps
- **createdAt** (Date)
  - Automatically generated on document creation

- **updatedAt** (Date)
  - Automatically updated on document modification

### Indexes
- **Compound Unique Index**: userId + jobId (prevents duplicate applications)
- **Single Field Indexes**: status, applicationDate, jobId + status, userId + status

### Virtual Fields
- **job** (Object)
  - Virtual field that populates the job details
  - References Job model

- **user** (Object)
  - Virtual field that populates the user details
  - References User model

### Methods

#### updateStatus(newStatus, note, updatedBy)
- **Purpose**: Update application status and add to history
- **Parameters**: 
  - `newStatus` (String): New status value
  - `note` (String): Optional note about the change
  - `updatedBy` (ObjectId): Company ID making the change
- **Returns**: Promise - saves the updated document

#### addCompanyNote(note, createdBy)
- **Purpose**: Add a company note to the application
- **Parameters**: 
  - `note` (String): Note content
  - `createdBy` (ObjectId): Company ID creating the note
- **Returns**: Promise - saves the updated document

#### isEditable()
- **Purpose**: Check if application can still be edited by the user
- **Returns**: Boolean - true if status is 'pending' or 'reviewing'

### Pre-save Middleware
- **Status History**: Automatically adds initial status to statusHistory when application is created

---

## Model Relationships

### User Relationships
- **User → SavedJob**: One-to-Many (user can save multiple jobs)
- **User → Application**: One-to-Many (user can apply to multiple jobs)

### Company Relationships
- **Company → Job**: One-to-Many (company can post multiple jobs)
- **Company → Application**: One-to-Many (company receives multiple applications)

### Job Relationships
- **Job → Category**: Many-to-One (multiple jobs can belong to one category)
- **Job → Company**: Many-to-One (multiple jobs can belong to one company)
- **Job → SavedJob**: One-to-Many (job can be saved by multiple users)
- **Job → Application**: One-to-Many (job can have multiple applications)

### Category Relationships
- **Category → Job**: One-to-Many (category can be assigned to multiple jobs)

### Application Relationships
- **Application → User**: Many-to-One (multiple applications can belong to one user)
- **Application → Job**: Many-to-One (multiple applications can be for one job)
- **Application → Company**: Many-to-One (multiple applications can be received by one company)

### SavedJob Relationships
- **SavedJob → User**: Many-to-One (multiple saved jobs can belong to one user)
- **SavedJob → Job**: Many-to-One (multiple saved job records can reference one job)

## Data Validation Summary

### Email Validation
All models use the same email validation pattern: `/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/`

### Password Requirements
- Minimum length: 6 characters
- Automatically hashed using bcrypt with 10 salt rounds
- Hidden by default in queries (select: false)

### String Length Limits
- **Names**: 100-200 characters max
- **Descriptions**: 500-5000 characters max depending on context
- **Phone Numbers**: 20 characters max
- **Tags**: 50 characters max
- **Notes**: 500-1000 characters max depending on context

### Currency Support
Supported currencies across salary and compensation fields:
- USD (US Dollar)
- IDR (Indonesian Rupiah)
- SGD (Singapore Dollar)
- MYR (Malaysian Ringgit)
- PHP (Philippine Peso)
- THB (Thai Baht)

### Date Validations
- **Application Deadlines**: Must be in the future
- **Status History**: Automatically timestamped
- **Salary Ranges**: Minimum cannot exceed maximum

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
