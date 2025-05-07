import firebase_admin
from firebase_admin import credentials, messaging
import os
from django.conf import settings
from pywebpush import webpush, WebPushException
import json

# Initialize Firebase Admin SDK
cred = credentials.Certificate(os.path.join(os.path.dirname(__file__), 'firebase-credentials.json'))
firebase_admin.initialize_app(cred)

def send_web_push(subscription_info, message_body):
    """
    Send a web push notification to a specific subscription.
    
    Args:
        subscription_info (dict): The subscription information from the client
        message_body (dict): The message to send, including title and body
    """
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

def send_notification(title, body, data=None):
    """
    Send a notification to all subscribed users.
    
    Args:
        title (str): Notification title
        body (str): Notification body
        data (dict): Additional data to send with the notification
    """
    from .models import PushSubscription
    
    message = {
        'title': title,
        'body': body,
        'data': data or {}
    }
    
    # Get all active subscriptions
    subscriptions = PushSubscription.objects.filter(active=True)
    
    success_count = 0
    for subscription in subscriptions:
        if send_web_push(subscription.subscription_info, message):
            success_count += 1
    
    return success_count 