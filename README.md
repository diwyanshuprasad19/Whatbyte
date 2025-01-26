# Whatbyte Assignment

## This is a Django-based web application developed as part of the Whatbyte assignment. It includes user authentication, user account management, password reset, and a dashboard with various user functionalities. This guide will help you set up and run the project on your local machine.

Link:https://docs.google.com/document/d/1LPiKM5RvpfkaN4ntg9atcW2-Ef5Ohx094Pe5570cWBU/edit?tab=t.0

Setup Instructions
1. Create a Virtual Environment
To isolate the dependencies of the project, create a Python virtual environment:
### python3 -m venv venv

Activate the virtual environment:
### source venv/bin/activate

2. Install Required Dependencies
Install all the required dependencies listed in requirements.txt:
### pip install -r requirements.txt

4. Create the Logs Directory
Create the logs directory to store email logs:

### mkdir -p /{Relative Path to the project}/Whatbyte/backend/logs/emails
### chmod -R 755 /{Relative Path to the project}/Whatbyte/backend/logs/emails
Use pwd if want to find path to the project

4. Run Migrations
Run the Django migrations to set up the database schema:

### python manage.py migrate

5. Create a Superuser
You can log in to the Django admin panel with the these credentials:

### Username: admin@local.com
### Password: 12345

Otherwise run this command to create the superuser:

### python manage.py createsuperuser

6. Start the Development Server
Run the development server:

### python manage.py runserver
Your application will now be running at http://127.0.0.1:8000/.


Running the Application
1. Open the Login Page
To access the login page, navigate to:

### http://127.0.0.1:8000/account/login/

2. Admin Panel
After creating the superuser account, you can access the Django admin panel using the following URL:

### http://127.0.0.1:8000/admin/

Use the superuser credentials (admin@local.com / 12345) to log in.


## Additional Enhancements & Notes
### Development Only (Not for Production)
1.Environment: This application is designed primarily for development purposes and is not optimized for a production environment.

2.Custom User Model: For better scalability and flexibility, consider using a custom user model instead of the default Django user model. This allows for greater customization in the future, especially when handling user data.

3.SMTP for Email: Currently, the application uses Django's default email backend for development. For production, configure an SMTP service (such as SendGrid, Amazon SES, or Mailgun) for better email reliability.

4.Custom Email Templates: This project uses Django’s built-in email templates. However, you can easily extend this by implementing custom HTML email templates for more professional-looking emails and better branding.

5.Logging: Implement more detailed logging across the application, especially for requests, responses, and errors. This can help in tracking user activity, debugging, and auditing.

6.Request/Response Logging: You can implement request/response logging to track API calls or user interactions on certain endpoints, helping monitor the performance and usage of your application.

7.Separation of Concerns: For a more scalable project structure, consider separating the frontend (React or any other JS framework) and backend (Django REST Framework) into distinct repositories. This helps in better maintainability and cleaner architecture.
  Frontend: React (or any JS framework) for a dynamic and responsive user interface.
  Backend: Django Rest Framework (DRF) for creating APIs, with Django handling user authentication and management.


### OAuth Integration for Login

1.OAuth for Login: Integrate OAuth libraries (such as django-allauth or python-social-auth) for enabling users to log in using their Google, Facebook, or other third-party accounts. This would eliminate the need for users to remember multiple passwords, making the login process easier and more secure.

### Future Improvements

1.Email Verification: Currently, there's no email verification for new users during sign-up. This can be added to ensure that users are registered with valid emails.

2.Rate Limiting: Add rate limiting for sensitive endpoints (like login and password reset) to prevent brute force attacks.

3.User Activity Tracking: Keep track of user activities such as login history, password change, and other significant actions.


Contributing Contributions are welcome! Feel free to fork the repository and submit pull requests.

Contact For questions or feedback, feel free to reach out at diwyanshu.prasad@gmail.com.
