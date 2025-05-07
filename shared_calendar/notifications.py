import firebase_admin
from firebase_admin import credentials, messaging
import os
from django.conf import settings
from pywebpush import webpush, WebPushException
import json

# Initialize Firebase Admin SDK with error handling
firebase_initialized = False
try:
    cred = credentials.Certificate(os.path.join(os.path.dirname(__file__), 'firebase-credentials.json'))
    firebase_admin.initialize_app(cred)
    firebase_initialized = True
except (FileNotFoundError, ValueError) as e:
    print(f"Firebase initialization failed: {str(e)}")
    print("Server will continue running without Firebase functionality")

def send_web_push(subscription_info, message_body):
    """
    Send a web push notification to a specific subscription.
    
    Args:
        subscription_info (dict): The subscription information from the client
        message_body (dict): The message to send, including title and body
    """
    if not firebase_initialized:
        print("Web push notification skipped: Firebase not initialized")
        return False
        
    try:
        webpush(
            subscription_info=subscription_info,
            data=json.dumps(message_body),
            vapid_private_key=settings.WEBPUSH_SETTINGS['VAPID_PRIVATE_KEY'],
            vapid_claims={
                "sub": f"mailto:{settings.WEBPUSH_SETTINGS['VAPID_ADMIN_EMAIL']}"
            }
        )
        return True
    except WebPushException as e:
        print(f"Web push failed: {str(e)}")
        return False
    except Exception as e:
        print(f"Unexpected error in web push: {str(e)}")
        return False

def send_notification(title, body, data=None):
    """
    Send a notification to all subscribed users.
    
    Args:
        title (str): Notification title
        body (str): Notification body
        data (dict): Additional data to send with the notification
    """
    if not firebase_initialized:
        print(f"Notification '{title}' skipped: Firebase not initialized")
        return 0
        
    from .models import PushSubscription
    
    message = {
        'title': title,
        'body': body,
        'data': data or {}
    }
    
    try:
        # Get all active subscriptions
        subscriptions = PushSubscription.objects.filter(active=True)
        
        success_count = 0
        for subscription in subscriptions:
            if send_web_push(subscription.subscription_info, message):
                success_count += 1
        
        return success_count
    except Exception as e:
        print(f"Error sending notifications: {str(e)}")
        return 0 