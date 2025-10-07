from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from roles.models import Role


class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("The Username field is required.")
        
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if not password:
            raise ValueError("Password field is required.")
        
        return self.create_user(username, password, **extra_fields)

# Create your models here.
class User(AbstractUser):
    # TODO: do we add emails for this columbarium system?
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, related_name="users")
    email = None

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = [] # remove 'email' from createsuperuser 

    objects = CustomUserManager()

    def __str__(self):
        return self.username
    
    def has_permission(self, permission_code):
        if not self.role:
            return False
        return self.role.permissions.filter(code=permission_code).exists()

