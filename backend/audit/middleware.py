from .models import AuditLog
from django.utils.deprecation import MiddlewareMixin
import json
from .serializers import AuditLogSerializer
from user_sessions.models import Session
from users.models import User
from audit.models import AuditLog
from django.contrib.auth.models import AnonymousUser

class AuditMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path.startswith("/admin/"):
            return 
        
        authorization_header = request.headers.get("Authorization", "")

        if authorization_header.startswith("Session "):
            token = authorization_header.split(" ")[1]
            print("Token received:", token)

            try:
                session = Session.objects.get(session_token=token)
                user = session.user

                request.user = user
            except Session.DoesNotExist:
                request.user = None
            except User.DoesNotExist:
                request.user = None
        else:
            request.user = None

    def get_client_ip(self, request):
        xff = request.META.get('HTTP_X_FORWARDED_FOR')
        return xff.split(',')[0].strip() if xff else request.META.get('REMOTE_ADDR')

    def process_response(self, request, response):
        if request.path.startswith("/admin/"):
            return response

        authorization_header = request.headers.get("Authorization", "")

        if authorization_header.startswith("Session "):
            token = authorization_header.split(" ")[1]
            print("Token received:", token)

            try:
                session = Session.objects.get(session_token=token)
                user = session.user

                request.user = user
                print("User authenticated: ", user.username)
            except Session.DoesNotExist:
                print("Session does NOT exist")
                request.user = None
            except User.DoesNotExist:
                print("User does NOT exist")
                request.user = None
        else:
            request.user = None
        
        path = request.path
        method = request.method
        user = getattr(request, 'user', None)
        ip_address = self.get_client_ip(request)


        print("User: ", user)

        if path.startswith('/api/') and method in ['POST', 'PUT', 'DELETE'] and path != '/api/login-api/' and path != '/api/logout-api/':
            if path == '/api/users/login-api/' or path == "/api/users/logout-api/": return response

            # Extract app/action from path
            parts = path.strip('/').split('/')
            app = parts[1].capitalize() if len(parts) > 1 else "Unknown App"
            action = parts[2] if len(parts) > 2 else "Unknown Action"    

            action_map = {'create-new': 'create', 'edit': 'update', 'delete': 'delete', 'list-all': 'view',}
            action = action_map.get(action, action)

            # Request body
            try:
                req_body = json.loads(request.body.decode('utf-8')) if request.body else None
            except Exception:
                req_body = None
            
            # Response body
            try:
                res_body = json.loads(response.content.decode('utf-8')) if response.content else None
            except Exception:
                res_body = None

            log = AuditLog.objects.create(
                user=user if user else None,
                app=app,
                action=action,
                method=method,
                request_data=req_body,
                response_data=res_body,
                path=path,
                status_code=response.status_code,
                ip_address=ip_address
            )

            print("Logging: ", AuditLogSerializer(log).data)
        else:
            print("Not logging for path:", path, "and method:", method)
            request.user = AnonymousUser()

    
        return response

