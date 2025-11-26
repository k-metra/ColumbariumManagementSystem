from django.test import TestCase, Client
from django.urls import reverse
from audit.models import AuditLog
from users.models import User
from roles.models import Role, Permission
from user_sessions.models import Session
import json

class AuditMiddlewareTest(TestCase):
    def setUp(self):
        self.client = Client()
        
        # Setup permissions and role
        p1 = Permission.objects.create(code="manage_users", description="Manage users")
        p2 = Permission.objects.create(code="view_dashboard", description="View dashboard")
        self.role = Role.objects.create(name="Admin")
        self.role.permissions.add(p1, p2)
        
        self.user = User.objects.create_user(username='testuser', password='password123', role=self.role)
        
        # Create session
        self.session = Session.create_session(self.user)
        self.session.save()
        self.token = self.session.session_token
        self.auth_header = f"Session {self.token}"
        
        self.login_url = '/api/users/login-api/'
        self.create_user_url = '/api/users/create-new/'

    def test_successful_request_logged(self):
        """Test that a successful (200 OK) request to a tracked endpoint is logged."""
        # Log in first to have a user (though middleware handles anon too, usually we want to test with user)
        # Actually, let's just use the create endpoint. If it requires auth, we need to login.
        # Let's assume create-new requires auth or at least is tracked.
        
        # We need a valid tracked endpoint. 
        # Based on middleware: path.startswith('/api/') and method in ['POST', 'PUT', 'DELETE']
        # and NOT login/logout.
        
        # Let's try to create a user (which might fail if we don't provide data, giving 400, or succeed giving 201)
        # To ensure 200/201, let's provide valid data.
        data = {
            'username': 'newuser',
            'password': 'newpassword123',
            'email': 'new@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'role': 'Admin' # Assuming role is required or optional
        }
        
        # We need to mock the view or ensure it works. 
        # Alternatively, we can use a simpler endpoint if available.
        # Let's try to just hit the endpoint and see what happens. 
        # If the view returns 200/201, it should be logged.
        
        # Use the session token in the header
        response = self.client.post(
            self.create_user_url, 
            data, 
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header
        )
        
        # If creation is successful, status should be 201
        if 200 <= response.status_code < 300:
            self.assertTrue(AuditLog.objects.filter(path=self.create_user_url, method='POST').exists(),
                            f"Audit log should be created for status {response.status_code}")
        else:
            self.fail(f"Request failed with status {response.status_code}: {response.content}")

    def test_failed_request_not_logged(self):
        """Test that a failed (e.g. 400 or 500) request is NOT logged."""
        # Send invalid data to create-new to trigger 400
        # We still need auth to reach the validation step, otherwise we get 403 which is also a failure.
        # But 403 is also a failure, so it should NOT be logged either.
        # Let's test 400 (Bad Request) specifically as it's a common case.
        data = {'username': ''} # Invalid
        response = self.client.post(
            self.create_user_url, 
            data, 
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header
        )
        
        # Verify it was a bad request
        self.assertTrue(response.status_code >= 400, f"Expected error status, got {response.status_code}")
        
        # Check audit log
        # WITH THE FIX: Should NOT exist
        # WITHOUT THE FIX: Should exist
        # We will assert the DESIRED behavior (NOT exist)
        self.assertFalse(AuditLog.objects.filter(path=self.create_user_url, method='POST', status_code=response.status_code).exists(),
                         "Audit log should NOT be created for failed requests")

    def test_login_not_logged(self):
        """Test that login requests are never logged."""
        data = {'username': 'testuser', 'password': 'password123'}
        response = self.client.post(self.login_url, data, content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        self.assertFalse(AuditLog.objects.filter(path=self.login_url).exists(),
                         "Login requests should not be logged")

    def test_logout_not_logged(self):
        """Test that logout requests are never logged."""
        # Login first
        self.client.login(username='testuser', password='password123')
        logout_url = '/api/users/logout-api/'
        response = self.client.post(logout_url)
        
        self.assertFalse(AuditLog.objects.filter(path=logout_url).exists(),
                         "Logout requests should not be logged")
