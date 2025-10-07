from django.db import models
from django.utils.timezone import timedelta, now
from users.models import User

import secrets
import string

# Create your models here.
class Session(models.Model):
    session_token = models.CharField(max_length=67, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expiry = models.DateTimeField(default=now() + timedelta(hours=12))
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='session')

    @classmethod
    def generate_token():
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(64))

    @classmethod
    def create_session(cls, user):
        token = cls.generate_token()
        session = cls(session_token=token, user=user)
        session.save()
        return session
