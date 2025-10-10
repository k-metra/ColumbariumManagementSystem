from .models import Session
from django.utils import timezone

def format_token(token):
    if token.startswith('Session '):
        token = token.split(' ')[1]
    return token

def verify_session(session_token):
    session_token = format_token(session_token)
    
    try:
        session = Session.objects.get(session_token=session_token)
    except Session.DoesNotExist:
        return None
    
    return (session.expiry > timezone.now()) # return true if session is valid else false


def get_user_from_session(session_token):
    session_token = format_token(session_token)
    
    try:
        session = Session.objects.get(session_token=session_token)
    except Session.DoesNotExist:
        return None
    
    if session.expiry > timezone.now():
        return session.user
    return None
