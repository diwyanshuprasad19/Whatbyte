Whatbyte Assignment: Django Web Application
This is a Django-based web application designed as part of the Whatbyte assignment. The application features user authentication, user account management, password reset, and a dashboard with various user functionalities. Below is a detailed guide on setting up and running the project.

Table of Contents
Setup Instructions
Running the Application
Admin Setup
File Structure
Required Links
Setup Instructions
To set up the project, follow the steps below:

1. Create a Virtual Environment
First, create a virtual environment to isolate your dependencies.

bash
Copy
python3 -m venv venv
Activate the virtual environment:

bash
Copy
source venv/bin/activate
2. Install Required Dependencies
Install the required dependencies from the requirements.txt file:

bash
Copy
pip install -r requirements.txt
3. Create the Logs Directory
Create the necessary logs directory for the email logs and set the appropriate permissions.

bash
Copy
mkdir -p /Users/diwyanshuprasad/Desktop/Whatbyte/backend/logs/emails
chmod -R 755 /Users/diwyanshuprasad/Desktop/Whatbyte/backend/logs/emails
4. Run Migrations
Apply the database migrations to set up the database schema:

bash
Copy
python manage.py migrate
5. Create a Superuser
Create a superuser account to access the Django admin panel.

bash
Copy
python manage.py createsuperuser
Use the following credentials:

Username: admin@local.com
Password: 12345
6. Start the Development Server
Run the development server:

bash
Copy
python manage.py runserver
Your server will start running at: http://127.0.0.1:8000/.

Running the Application
1. Open the Login Page
To access the login page for the application, navigate to:

http://127.0.0.1:8000/account/login/

2. Logged-in User Functionality
Once logged in, users will be able to access the following pages:

Dashboard: http://127.0.0.1:8000/account/dashboard/
Change Password: http://127.0.0.1:8000/account/change-password/
Profile Page: http://127.0.0.1:8000/account/profile/
3. Admin Panel
Once you've set up the superuser account, you can access the Django admin panel by going to:

http://127.0.0.1:8000/admin/

Login with the superuser credentials (admin@local.com / 12345).

Admin Setup
1. Admin Panel Access
Once the application is running, you can access the Django admin panel at:

http://127.0.0.1:8000/admin/

Login using the superuser credentials you created earlier.

2. Email Logs
The email logs will be stored in the following directory:

bash
Copy
/Users/diwyanshuprasad/Desktop/Whatbyte/backend/logs/emails
Make sure to grant the necessary permissions (chmod 755), so the application can write to this folder.

File Structure
Here’s an overview of the file structure of the project:

bash
Copy
backend/
│
├── db.sqlite3                # SQLite database file
├── manage.py                 # Django management script
├── update.sh                 # Update script
├── webapp/                    # The Django application
│   ├── __init__.py
│   ├── settings.py            # Django settings configuration
│   ├── urls.py                # URL configurations
│   ├── apps/
│   │   └── account/
│   │       ├── __init__.py
│   │       ├── forms.py       # Forms for user authentication and management
│   │       ├── models.py      # Database models for user and other entities
│   │       ├── service.py     # Business logic for email sending and user management
│   │       ├── views.py       # Views for handling user requests
│   │       ├── urls.py        # URL patterns for the account app
│   │       ├── email_templates.py  # Email templates (password reset, account creation)
│   │       └── migrations/
├── requirements.txt           # List of required Python packages
└── logs/
    └── emails/                # Folder to store email logs
Required Links
Here are the key links you will need to access various parts of the application:

Login Page: http://127.0.0.1:8000/account/login/
Dashboard (Authenticated Users Only): http://127.0.0.1:8000/account/dashboard/
Profile Page (Authenticated Users Only): http://127.0.0.1:8000/account/profile/
Change Password (Authenticated Users Only): http://127.0.0.1:8000/account/change-password/
Admin Panel (Superuser Access): http://127.0.0.1:8000/admin/
Conclusion
This project allows users to register, login, and manage their account details securely. The application implements standard user management features like password reset and change, with email notifications triggered for such actions. The admin panel provides administrative access to manage users and other application settings.

Feel free to explore, extend, or modify the project as needed for your use case.
